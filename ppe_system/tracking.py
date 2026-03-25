from __future__ import annotations

from .config import TrackerConfig
from .schemas import DetectionBox, TrackBox

try:
    from deep_sort_realtime.deepsort_tracker import DeepSort
except ImportError:  # pragma: no cover - dependency availability varies by machine
    DeepSort = None


class DeepSortTrackerAdapter:
    def __init__(self, config: TrackerConfig, gpu_enabled: bool):
        if DeepSort is None:
            raise ImportError(
                "deep-sort-realtime is not installed. Install it with "
                "`pip install deep-sort-realtime` to enable tracking."
            )

        self.config = config
        self.tracker = DeepSort(
            max_age=config.max_age,
            n_init=config.n_init,
            max_iou_distance=config.max_iou_distance,
            max_cosine_distance=config.max_cosine_distance,
            nn_budget=config.nn_budget,
            embedder=config.embedder,
            half=config.half and gpu_enabled,
            bgr=config.bgr,
            embedder_gpu=config.embedder_gpu and gpu_enabled,
            polygon=config.polygon,
        )

    def update(self, person_detections: list[DetectionBox], frame) -> list[TrackBox]:
        detections = []
        for person in person_detections:
            x1, y1, x2, y2 = person.bbox
            detections.append(([x1, y1, x2 - x1, y2 - y1], person.confidence, "person"))

        tracks = self.tracker.update_tracks(detections, frame=frame)
        active_tracks: list[TrackBox] = []

        for track in tracks:
            confirmed = track.is_confirmed()
            if not confirmed and not self.config.include_tentative:
                continue

            ltrb = track.to_ltrb(orig=False)
            active_tracks.append(
                TrackBox(
                    track_id=int(track.track_id),
                    bbox=(float(ltrb[0]), float(ltrb[1]), float(ltrb[2]), float(ltrb[3])),
                    confirmed=confirmed,
                )
            )

        return active_tracks
