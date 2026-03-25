from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class DetectorConfig:
    model_path: str = "best.pt"
    confidence: float = 0.25
    person_confidence: float = 0.35
    image_size: int = 960
    device: str = "auto"
    classes_of_interest: tuple[str, ...] = (
        "person",
        "helmet",
        "vest",
        "gloves",
        "mask",
        "no_helmet",
        "no_vest",
        "no_gloves",
        "no_mask",
    )


@dataclass(slots=True)
class TrackerConfig:
    max_age: int = 30
    n_init: int = 3
    max_iou_distance: float = 0.7
    max_cosine_distance: float = 0.25
    nn_budget: int | None = 100
    embedder: str = "mobilenet"
    half: bool = True
    bgr: bool = True
    embedder_gpu: bool = True
    polygon: bool = False
    include_tentative: bool = False


@dataclass(slots=True)
class ComplianceConfig:
    required_items: tuple[str, ...] = ("helmet", "vest", "gloves", "mask")
    history_size: int = 180
    stale_track_frames: int = 120
    missing_alert_frames: int = 15
    head_region_y: tuple[float, float] = (0.0, 0.28)
    face_region_y: tuple[float, float] = (0.08, 0.36)
    torso_region_y: tuple[float, float] = (0.28, 0.78)
    gloves_region_y: tuple[float, float] = (0.35, 0.95)
    side_region_width_ratio: float = 0.35
    center_margin_ratio: float = 0.15
    min_region_overlap: float = 0.05


@dataclass(slots=True)
class RuntimeConfig:
    display: bool = False
    display_window_name: str = "PPE Compliance Monitor"
    output_video_path: str | None = None
    output_jsonl_path: str | None = None
    max_frames: int | None = None
    save_annotated: bool = True
    show_fps_overlay: bool = True


@dataclass(slots=True)
class SystemConfig:
    detector: DetectorConfig = field(default_factory=DetectorConfig)
    tracker: TrackerConfig = field(default_factory=TrackerConfig)
    compliance: ComplianceConfig = field(default_factory=ComplianceConfig)
    runtime: RuntimeConfig = field(default_factory=RuntimeConfig)
