#!/usr/bin/env python3
"""
Objective transition QA for Remotion video scenarios.

Checks:
  - blank_frame              mean luminance out of range
  - animation_jump           sudden pixel delta spike between adjacent frames
  - color_leakage            scene-specific colors visible in wrong scene
  - missing_tap_ripple       WhatsApp green not growing during tap animation window
  - typing_indicator_too_short  typingDuration too short for message length (data check)

Usage:
  python3 check_transitions.py \\
    --frames-dir out/qa/LvBag/ \\
    --scenario-json '{"scenario_id":"LvBag","fps":30,"scenes":[...]}'

Output: JSON to stdout.

Deps: Pillow (pip3 install Pillow). numpy optional (faster image math).
"""

import json
import sys
import os
import argparse
import math
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print(
        "ERROR: Pillow not installed. Run: pip3 install Pillow",
        file=sys.stderr,
    )
    sys.exit(1)

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


# ---------------------------------------------------------------------------
# Color targets
# ---------------------------------------------------------------------------

WHATSAPP_GREEN  = (29, 171, 97)    # #1dab61 — tap ripple, unread badges, send button
SENT_BUBBLE     = (220, 248, 198)  # #dcf8c6 — outgoing chat bubble background


# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------

def load_img(path: str) -> Image.Image:
    return Image.open(path).convert("RGB")


def mean_luminance(img: Image.Image) -> float:
    """Average brightness across all pixels (0–255)."""
    if HAS_NUMPY:
        return float(np.array(img).mean())
    pixels = list(img.getdata())
    return sum((r + g + b) / 3.0 for r, g, b in pixels) / len(pixels)


def mean_abs_delta(img_a: Image.Image, img_b: Image.Image) -> float:
    """Mean absolute per-channel difference between two same-size images."""
    if HAS_NUMPY:
        a = np.array(img_a).astype(float)
        b = np.array(img_b).astype(float)
        return float(np.abs(a - b).mean())
    pa = list(img_a.getdata())
    pb = list(img_b.getdata())
    total = sum(abs(ra - rb) + abs(ga - gb) + abs(ba - bb)
                for (ra, ga, ba), (rb, gb, bb) in zip(pa, pb))
    return total / (3.0 * len(pa))


def count_color_pixels(
    img: Image.Image,
    target_rgb: tuple,
    tolerance: int = 15,
    y_start: int = 0,
    y_end: int = None,
) -> int:
    """Count pixels matching target_rgb within per-channel tolerance."""
    if y_end is None:
        y_end = img.height
    region = img.crop((0, y_start, img.width, y_end))
    tr, tg, tb = target_rgb
    if HAS_NUMPY:
        arr = np.array(region)
        mask = (
            (np.abs(arr[:, :, 0].astype(int) - tr) <= tolerance)
            & (np.abs(arr[:, :, 1].astype(int) - tg) <= tolerance)
            & (np.abs(arr[:, :, 2].astype(int) - tb) <= tolerance)
        )
        return int(mask.sum())
    pixels = list(region.getdata())
    return sum(
        1 for r, g, b in pixels
        if abs(r - tr) <= tolerance and abs(g - tg) <= tolerance and abs(b - tb) <= tolerance
    )


def frame_path(frames_dir: str, n: int) -> Path:
    return Path(frames_dir) / f"f{n}.png"


def existing_frames(frames_dir: str, frame_numbers) -> list:
    """Return (frame_num, path_str) pairs for frames that actually exist."""
    result = []
    for n in frame_numbers:
        p = frame_path(frames_dir, n)
        if p.exists():
            result.append((n, str(p)))
    return result


# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------

def check_blank_frames(frames_dir: str, all_frames: list) -> list:
    findings = []
    for n, path in existing_frames(frames_dir, all_frames):
        lum = mean_luminance(load_img(path))
        if lum < 15:
            findings.append({
                "frame": n, "check": "blank_frame",
                "detail": f"Frame nearly black (luminance={lum:.1f}/255)"
            })
        elif lum > 245:
            findings.append({
                "frame": n, "check": "blank_frame",
                "detail": f"Frame blown out (luminance={lum:.1f}/255)"
            })
    return findings


def check_animation_jumps(frames_dir: str, sorted_frames: list) -> list:
    """Flag sudden pixel-delta spikes between consecutive rendered frames."""
    findings = []
    # Only compare frames that are 1–2 apart (actual consecutive frames)
    for i in range(len(sorted_frames) - 1):
        n_a, n_b = sorted_frames[i], sorted_frames[i + 1]
        if n_b - n_a > 2:
            continue  # gap too large; not actually consecutive
        pa = frame_path(frames_dir, n_a)
        pb = frame_path(frames_dir, n_b)
        if not (pa.exists() and pb.exists()):
            continue
        delta = mean_abs_delta(load_img(str(pa)), load_img(str(pb)))
        if delta > 35:
            findings.append({
                "frame": n_b, "check": "animation_jump",
                "detail": f"Pixel delta {delta:.1f} between frames {n_a}→{n_b} (smooth transitions should be ≤35)"
            })
    return findings


def check_color_leakage(frames_dir: str, transitions: list) -> list:
    """
    Detect scene-specific colors appearing in frames where they don't belong.

    conversation→chat-list: look for sent-bubble green (#dcf8c6) in post-transition frames
    chat-list→conversation: look for large WhatsApp-green patches still visible
    """
    findings = []
    for t in transitions:
        t_frame = t["frame"]
        transition_key = f"{t.get('from', '')}>{t.get('to', '')}"
        # Check frames a few frames into the new scene, where the old scene should be gone
        post_frames = [t_frame + 3, t_frame + 5]

        if transition_key == "conversation>chat-list":
            for n, path in existing_frames(frames_dir, post_frames):
                img = load_img(path)
                # Sent-bubble green (#dcf8c6) should not appear in chat-list frames.
                # Threshold >300 to avoid false positives from background patterns.
                count = count_color_pixels(img, SENT_BUBBLE, tolerance=12, y_start=200)
                if count > 300:
                    findings.append({
                        "frame": n, "check": "color_leakage",
                        "detail": (
                            f"Sent bubble green (#dcf8c6) in {count} pixels at frame {n} "
                            f"(chat-list frame) — conversation scene bleeding through"
                        )
                    })

        elif transition_key == "chat-list>conversation":
            for n, path in existing_frames(frames_dir, post_frames):
                img = load_img(path)
                # A large patch of WhatsApp green below the header signals the tap
                # ripple hasn't faded out yet.
                count = count_color_pixels(img, WHATSAPP_GREEN, tolerance=10, y_start=200)
                if count > 500:
                    findings.append({
                        "frame": n, "check": "color_leakage",
                        "detail": (
                            f"WhatsApp green (#1dab61) in {count} pixels at frame {n} "
                            f"(conversation frame) — tap ripple persisting into next scene"
                        )
                    })
    return findings


def check_tap_ripple(frames_dir: str, scenes: list) -> list:
    """
    For each chat-list scene, verify the tap ripple is actually visible.

    The ripple grows from 0 to ~160px diameter starting at tap_start_frame,
    adding a significant number of #1dab61 pixels below the header.
    Compare green pixel count just before vs during the tap window.
    """
    findings = []
    for scene in scenes:
        if scene["type"] != "chat-list":
            continue
        tap_start = scene.get("tap_start_frame")
        if tap_start is None:
            continue

        frame_before = tap_start - 3
        frame_during = tap_start + 5  # ripple is growing but not yet full

        pb = frame_path(frames_dir, frame_before)
        pd = frame_path(frames_dir, frame_during)
        if not (pb.exists() and pd.exists()):
            continue

        img_before = load_img(str(pb))
        img_during = load_img(str(pd))

        # Measure green pixels below the header + search bar area (y > 220 in 1920px render)
        before_count = count_color_pixels(img_before, WHATSAPP_GREEN, tolerance=12, y_start=220)
        during_count = count_color_pixels(img_during, WHATSAPP_GREEN, tolerance=12, y_start=220)
        delta = during_count - before_count

        # A growing ripple should add ≥150 new green pixels by frame tap_start+5.
        # Unread badges are small and don't change between these frames.
        if delta < 150:
            findings.append({
                "frame": frame_during, "check": "missing_tap_ripple",
                "detail": (
                    f"Tap ripple not visible: only {delta} new green pixels at frame {frame_during} "
                    f"(expect ≥150 from ripple growth). Before: {before_count}, during: {during_count}"
                )
            })
    return findings


def check_typing_indicator(scenes: list) -> list:
    """
    Data-level check (no pixels needed): typing indicator duration must be
    proportional to the length of the message that follows it.

    A very short typing duration on a long message looks fake — the bot
    appears to type 200 characters in under half a second.

    Formula: min_duration = max(15, 15 + (chars - 50) // 6)
    This gives ~15 frames for short messages, scaling up linearly for longer ones.
    """
    findings = []
    for scene in scenes:
        if scene["type"] != "conversation":
            continue
        typing_duration = scene.get("typing_duration", 18)
        max_chars = scene.get("max_bot_message_chars", 0)
        min_duration = max(15, 15 + max(0, max_chars - 50) // 6)
        if typing_duration < min_duration:
            findings.append({
                "frame": scene.get("start_frame", 0),
                "check": "typing_indicator_too_short",
                "detail": (
                    f"typingDuration={typing_duration} frames is too short for a "
                    f"{max_chars}-char bot message (minimum: {min_duration} frames). "
                    f"Increase typingDuration in the scenario file."
                )
            })
    return findings


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def build_transitions(scenes: list) -> list:
    transitions = []
    for i in range(len(scenes) - 1):
        t_frame = scenes[i]["start_frame"] + scenes[i]["duration"]
        transitions.append({
            "frame": t_frame,
            "from": scenes[i]["type"],
            "to": scenes[i + 1]["type"],
        })
    return transitions


def all_frames_to_check(scenes: list, transitions: list) -> list:
    frames = set()
    for t in transitions:
        for offset in (-5, -3, -1, 0, 1, 3, 5):
            frames.add(t["frame"] + offset)
    for scene in scenes:
        if scene["type"] == "chat-list":
            tap = scene.get("tap_start_frame")
            if tap is not None:
                for offset in (-3, 0, 5):
                    frames.add(tap + offset)
    return sorted(frames)


def main():
    parser = argparse.ArgumentParser(
        description="Objective transition QA checks for Remotion videos."
    )
    parser.add_argument("--frames-dir", required=True, help="Directory containing f{N}.png files")
    parser.add_argument(
        "--scenario-json",
        required=True,
        help="JSON string with computed scenario timeline (scenes, fps, etc.)",
    )
    args = parser.parse_args()

    scenario = json.loads(args.scenario_json)
    scenes = scenario.get("scenes", [])
    transitions = build_transitions(scenes)
    sorted_frames = all_frames_to_check(scenes, transitions)

    findings = []
    findings += check_blank_frames(args.frames_dir, sorted_frames)
    findings += check_animation_jumps(args.frames_dir, sorted_frames)
    findings += check_color_leakage(args.frames_dir, transitions)
    findings += check_tap_ripple(args.frames_dir, scenes)
    findings += check_typing_indicator(scenes)

    result = {
        "passed": len(findings) == 0,
        "scenario_id": scenario.get("scenario_id", "unknown"),
        "frames_checked": sorted_frames,
        "transitions": transitions,
        "findings": findings,
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
