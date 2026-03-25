from __future__ import annotations

import argparse

import uvicorn

from ppe_system.server import create_app


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Start the live PPE backend server.")
    parser.add_argument("--model", default="best.pt", help="Path to the YOLOv8 model weights.")
    parser.add_argument("--imgsz", type=int, default=384, help="YOLO inference size for fast live monitoring.")
    parser.add_argument("--max-frame-side", type=int, default=448, help="Resize incoming live frames so the largest side is at most this value.")
    parser.add_argument("--save-dataset", action="store_true", help="Save streamed frames and labels to the dataset folder during live monitoring.")
    parser.add_argument("--dataset-stride", type=int, default=18, help="If dataset saving is enabled, save only every Nth processed frame.")
    parser.add_argument("--host", default="127.0.0.1", help="Host interface for the backend server.")
    parser.add_argument("--port", type=int, default=8000, help="Port for the backend server.")
    parser.add_argument("--reload", action="store_true", help="Enable uvicorn reload for development.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    app = create_app(
        model_path=args.model,
        inference_image_size=args.imgsz,
        max_frame_side=args.max_frame_side,
        save_dataset=args.save_dataset,
        dataset_stride=args.dataset_stride,
    )
    uvicorn.run(app, host=args.host, port=args.port, reload=args.reload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
