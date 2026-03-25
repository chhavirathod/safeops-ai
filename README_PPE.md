# PPE Compliance System

This package adds a modular Python PPE compliance pipeline to the warehouse project using:

- YOLOv8 via Ultralytics for detection
- DeepSORT for worker tracking
- OpenCV for CCTV/video IO and rendering

## Features

- Accepts a live stream, video file, webcam index, RTSP source, or frame directory
- Uses the custom `best.pt` model for `Person`, `Hardhat`, `Safety Vest`, `Gloves`, `Mask`, and `NO-*` detections
- Tracks workers with persistent IDs using DeepSORT
- Evaluates PPE compliance per tracked worker with region-aware checks
- Emits per-frame JSON output and optional JSONL logging
- Draws worker IDs and compliance status on annotated frames
- Maintains per-track compliance history and raises an alert if the helmet is missing for more than `N` frames

## Install

```bash
python3 -m pip install -r requirements-ppe.txt
```

## Run On Video

```bash
python3 run_ppe_monitor.py --model best.pt --source input.mp4 --show --output-video outputs/annotated.mp4 --output-jsonl outputs/frames.jsonl
```

## Run On Frame Sequence

```bash
python3 run_ppe_monitor.py --model best.pt --frames-dir sample_frames --output-jsonl outputs/frames.jsonl
```

## JSON Output

Each processed frame is emitted as JSON:

```json
{
  "frame_index": 12,
  "timestamp_ms": 400.0,
  "workers": [
    {
      "id": "ID_1",
      "track_id": 1,
      "bbox": [100, 50, 220, 360],
      "helmet": true,
      "vest": true,
      "gloves": false,
      "mask": true,
      "compliant": false,
      "violations": ["gloves"],
      "missing_counts": {
        "helmet": 0,
        "vest": 0,
        "gloves": 4,
        "mask": 0
      },
      "last_seen_frame": 12
    }
  ],
  "alerts": [
    {
      "id": "ID_4",
      "track_id": 4,
      "rule": "missing_helmet_persisted",
      "frame_index": 12,
      "message": "ID_4 is missing a helmet for 15 consecutive frames."
    }
  ]
}
```

## Python API

```python
import cv2

from ppe_system.api import create_pipeline, process_frame_json

pipeline = create_pipeline()
frame = cv2.imread("frame.jpg")
result = process_frame_json(pipeline, frame=frame, frame_index=0)
print(result)
```

## Notes

- GPU acceleration is used automatically when `torch.cuda.is_available()` is true, or you can pass `--device cuda:0`.
- The compliance logic uses region-aware spatial checks:
  - helmet in head region
  - mask in face region
  - vest in torso region
  - gloves near left/right arm regions
- If `deep-sort-realtime` is not installed, the tracker module will raise a clear install error at startup.
