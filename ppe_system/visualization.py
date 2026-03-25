from __future__ import annotations

import cv2

from .schemas import FrameComplianceResult


GREEN = (56, 199, 89)
RED = (49, 49, 230)
AMBER = (0, 191, 255)
WHITE = (245, 245, 245)
PANEL = (20, 20, 28)


def annotate_frame(frame, result: FrameComplianceResult, show_fps: bool = True, fps: float = 0.0):
    annotated = frame.copy()
    for worker in result.workers:
        x1, y1, x2, y2 = worker.bbox
        color = GREEN if worker.compliant else RED
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

        status = "COMPLIANT" if worker.compliant else f"MISSING: {', '.join(worker.violations)}"
        header = f"{worker.id} | {status}"
        detail = (
            f"H:{int(worker.helmet)} V:{int(worker.vest)} "
            f"G:{int(worker.gloves)} M:{int(worker.mask)}"
        )
        _draw_label(annotated, header, x1, max(24, y1 - 28), color)
        _draw_label(annotated, detail, x1, max(48, y1 - 4), PANEL, text_color=WHITE)

    if result.alerts:
        _draw_label(
            annotated,
            f"ALERTS: {len(result.alerts)}",
            16,
            24,
            AMBER,
            text_color=(10, 10, 10),
        )

    if show_fps:
        _draw_label(
            annotated,
            f"FRAME {result.frame_index} | FPS {fps:.1f}",
            16,
            58,
            PANEL,
            text_color=WHITE,
        )

    return annotated


def _draw_label(frame, text: str, x: int, y: int, bg_color, text_color=WHITE):
    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = 0.55
    thickness = 1
    (width, height), baseline = cv2.getTextSize(text, font, scale, thickness)
    cv2.rectangle(
        frame,
        (x - 4, y - height - 8),
        (x + width + 8, y + baseline - 2),
        bg_color,
        -1,
    )
    cv2.putText(frame, text, (x, y - 4), font, scale, text_color, thickness, cv2.LINE_AA)
