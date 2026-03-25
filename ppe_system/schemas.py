from __future__ import annotations

from dataclasses import asdict, dataclass, field


BBox = tuple[float, float, float, float]


@dataclass(slots=True)
class DetectionBox:
    label: str
    canonical_label: str
    confidence: float
    bbox: BBox

    def center(self) -> tuple[float, float]:
        x1, y1, x2, y2 = self.bbox
        return ((x1 + x2) / 2.0, (y1 + y2) / 2.0)


@dataclass(slots=True)
class TrackBox:
    track_id: int
    bbox: BBox
    confirmed: bool = True


@dataclass(slots=True)
class WorkerCompliance:
    id: str
    track_id: int
    bbox: list[int]
    helmet: bool
    vest: bool
    gloves: bool
    mask: bool
    compliant: bool
    violations: list[str] = field(default_factory=list)
    missing_counts: dict[str, int] = field(default_factory=dict)
    last_seen_frame: int = 0

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass(slots=True)
class AlertEvent:
    id: str
    track_id: int
    rule: str
    frame_index: int
    message: str

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass(slots=True)
class FrameComplianceResult:
    frame_index: int
    timestamp_ms: float
    workers: list[WorkerCompliance]
    alerts: list[AlertEvent] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "frame_index": self.frame_index,
            "timestamp_ms": self.timestamp_ms,
            "workers": [worker.to_dict() for worker in self.workers],
            "alerts": [alert.to_dict() for alert in self.alerts],
        }
