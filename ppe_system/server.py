from __future__ import annotations

import asyncio
from pathlib import Path
from time import perf_counter

import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from .config import DetectorConfig
from .dataset_export import DatasetExporter
from .detection import YoloPpeDetector
from .schemas import AlertEvent, DetectionBox, FrameComplianceResult, WorkerCompliance


def _head_region(person_box: tuple[float, float, float, float]) -> tuple[float, float, float, float]:
    x1, y1, x2, y2 = person_box
    width = x2 - x1
    height = y2 - y1
    return (
        x1 + width * 0.16,
        y1,
        x2 - width * 0.16,
        y1 + height * 0.3,
    )


def _intersection_area(
    box_a: tuple[float, float, float, float],
    box_b: tuple[float, float, float, float],
) -> float:
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b
    overlap_x1 = max(ax1, bx1)
    overlap_y1 = max(ay1, by1)
    overlap_x2 = min(ax2, bx2)
    overlap_y2 = min(ay2, by2)
    if overlap_x2 <= overlap_x1 or overlap_y2 <= overlap_y1:
        return 0.0
    return float((overlap_x2 - overlap_x1) * (overlap_y2 - overlap_y1))


def _box_area(box: tuple[float, float, float, float]) -> float:
    x1, y1, x2, y2 = box
    return max(0.0, x2 - x1) * max(0.0, y2 - y1)


def _center_inside(box: tuple[float, float, float, float], point: tuple[float, float]) -> bool:
    x1, y1, x2, y2 = box
    px, py = point
    return x1 <= px <= x2 and y1 <= py <= y2


def _detection_center(detection: DetectionBox) -> tuple[float, float]:
    x1, y1, x2, y2 = detection.bbox
    return ((x1 + x2) * 0.5, (y1 + y2) * 0.5)


class FastLivePpeEvaluator:
    def __init__(self, model_path: str, inference_image_size: int = 384):
        self.detector = YoloPpeDetector(
            DetectorConfig(
                model_path=model_path,
                image_size=inference_image_size,
                confidence=0.24,
                person_confidence=0.18,
                classes_of_interest=("person", "helmet", "no_helmet"),
            )
        )
        self.device = self.detector.device

    def process_frame(self, frame, frame_index: int) -> FrameComplianceResult:
        start = perf_counter()
        people, ppe = self.detector.infer(frame)
        workers = self._build_workers(people, ppe)
        alerts = [
            AlertEvent(
                id=worker.id,
                track_id=worker.track_id,
                rule="missing_helmet",
                frame_index=frame_index,
                message=f"{worker.id} missing helmet",
            )
            for worker in workers
            if not worker.helmet
        ]
        timestamp_ms = (perf_counter() - start) * 1000.0
        return FrameComplianceResult(
            frame_index=frame_index,
            timestamp_ms=timestamp_ms,
            workers=workers,
            alerts=alerts,
            detections=[*people, *ppe],
        )

    def _build_workers(
        self,
        people: list[DetectionBox],
        ppe_detections: list[DetectionBox],
    ) -> list[WorkerCompliance]:
        workers: list[WorkerCompliance] = []
        ordered_people = sorted(people, key=lambda detection: (detection.bbox[1], detection.bbox[0]))
        for index, person in enumerate(ordered_people, start=1):
            helmet_present = self._has_helmet(person, ppe_detections)
            bbox = [int(round(value)) for value in person.bbox]
            workers.append(
                WorkerCompliance(
                    id=f"ID_{index}",
                    track_id=index,
                    bbox=bbox,
                    helmet=helmet_present,
                    vest=True,
                    gloves=True,
                    mask=True,
                    compliant=helmet_present,
                    violations=[] if helmet_present else ["helmet"],
                    missing_counts={"helmet": 0 if helmet_present else 1},
                    last_seen_frame=0,
                )
            )
        return workers

    def _has_helmet(self, person: DetectionBox, ppe_detections: list[DetectionBox]) -> bool:
        head_box = _head_region(person.bbox)
        head_area = max(_box_area(head_box), 1.0)
        positive_score = 0.0
        negative_score = 0.0

        for detection in ppe_detections:
            if detection.canonical_label not in {"helmet", "no_helmet"}:
                continue

            center = _detection_center(detection)
            if not _center_inside(person.bbox, center):
                continue

            overlap = _intersection_area(head_box, detection.bbox) / head_area
            if overlap <= 0.01 and not _center_inside(head_box, center):
                continue

            score = max(overlap, 0.12) * detection.confidence
            if detection.canonical_label == "helmet":
                positive_score = max(positive_score, score)
            else:
                negative_score = max(negative_score, score)

        if positive_score == 0.0 and negative_score == 0.0:
            return False
        return positive_score >= negative_score


class LivePpeServer:
    def __init__(
        self,
        model_path: str = "best.pt",
        inference_image_size: int = 384,
        max_frame_side: int = 448,
        save_dataset: bool = False,
        dataset_stride: int = 18,
    ):
        resolved_model = Path(model_path).expanduser()
        if not resolved_model.exists():
            raise FileNotFoundError(f"Model file not found: {resolved_model}")

        self.model_path = str(resolved_model)
        self.evaluator = FastLivePpeEvaluator(
            model_path=self.model_path,
            inference_image_size=inference_image_size,
        )
        self.max_frame_side = max(256, max_frame_side)
        self.save_dataset = save_dataset
        self.dataset_stride = max(1, dataset_stride)
        self.dataset_exporter = DatasetExporter("dataset") if save_dataset else None
        self.lock = asyncio.Lock()

    async def process_encoded_frame(self, frame_bytes: bytes, frame_index: int) -> dict:
        np_buffer = np.frombuffer(frame_bytes, dtype=np.uint8)
        frame = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Invalid frame payload. Expected an encoded JPEG/PNG image.")
        frame = self._resize_for_live_processing(frame)

        async with self.lock:
            result = self.evaluator.process_frame(frame=frame, frame_index=frame_index)
            payload = result.to_dict()
            dataset_files = None
            if self.dataset_exporter is not None and frame_index % self.dataset_stride == 0:
                dataset_files = self.dataset_exporter.save_frame(frame, result)

        frame_height, frame_width = frame.shape[:2]

        return {
            "type": "frame_result",
            "frame_index": frame_index,
            "result": payload,
            "dataset_files": dataset_files,
            "frame_size": {
                "width": frame_width,
                "height": frame_height,
            },
        }

    def _resize_for_live_processing(self, frame):
        height, width = frame.shape[:2]
        largest_side = max(height, width)
        if largest_side <= self.max_frame_side:
            return frame
        scale = self.max_frame_side / float(largest_side)
        resized_size = (max(1, int(round(width * scale))), max(1, int(round(height * scale))))
        return cv2.resize(frame, resized_size, interpolation=cv2.INTER_AREA)


def create_app(
    model_path: str = "best.pt",
    inference_image_size: int = 384,
    max_frame_side: int = 448,
    save_dataset: bool = False,
    dataset_stride: int = 18,
) -> FastAPI:
    server = LivePpeServer(
        model_path=model_path,
        inference_image_size=inference_image_size,
        max_frame_side=max_frame_side,
        save_dataset=save_dataset,
        dataset_stride=dataset_stride,
    )
    app = FastAPI(title="Warehouse PPE Compliance Backend", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {
            "status": "ok",
            "model_path": server.model_path,
            "device": server.evaluator.device,
            "mode": "fast-live-helmet",
        }

    @app.get("/")
    async def root():
        return JSONResponse(
            {
                "status": "ok",
                "message": "Warehouse PPE backend is running.",
                "health_url": "/health",
                "websocket_url": "/ws/ppe",
                "next_step": "Start the Vite frontend with `npm run dev`, then use the website to begin live monitoring.",
                "mode": "fast-live-helmet",
            }
        )

    @app.get("/favicon.ico")
    async def favicon():
        return Response(status_code=204)

    @app.websocket("/ws/ppe")
    async def ppe_socket(websocket: WebSocket):
        await websocket.accept()
        await websocket.send_json(
            {
                "type": "ready",
                "model_path": server.model_path,
                "device": server.evaluator.device,
                "message": "Fast PPE backend connected",
                "mode": "fast-live-helmet",
            }
        )

        frame_index = 0
        try:
            while True:
                message = await websocket.receive()

                if message.get("type") == "websocket.disconnect":
                    break

                if message.get("bytes") is not None:
                    try:
                        response = await server.process_encoded_frame(message["bytes"], frame_index)
                    except Exception as exc:  # pragma: no cover - runtime path
                        await websocket.send_json(
                            {
                                "type": "error",
                                "frame_index": frame_index,
                                "message": str(exc),
                            }
                        )
                    else:
                        await websocket.send_json(response)
                        frame_index += 1
                    continue

                text_payload = message.get("text", "")
                if text_payload == "ping":
                    await websocket.send_json({"type": "pong"})
                else:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": "Unsupported payload. Send JPEG/PNG bytes or 'ping'.",
                        }
                    )
        except WebSocketDisconnect:
            return

    return app
