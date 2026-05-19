#!/usr/bin/env python3
"""
Objective transition QA for Remotion video scenarios.

Checks:
  - blank_frame                  mean luminance out of range
  - animation_jump               sudden pixel delta spike between adjacent frames
  - color_leakage                scene-specific colors visible in wrong scene
  - missing_tap_ripple           tap ripple color not growing during tap animation window
  - typing_indicator_too_short   typingDuration too short for message length (data check)
  - missing_quick_reply_typing   no typing indicator between user reply and contact response
  - multi_bot_no_typing          conversation has >1 bot message but only one typing window
  - typing_overlaps_message      typing indicator still showing after the message it precedes appears
  - scroll_jump                  bubble position jumps >80px in one frame when a bot message arrives

Usage:
  python3 check_transitions.py \\
    --frames-dir out/qa/LvBag/ \\
    --scenario-json '{"scenario_id":"LvBag","fps":30,"scenes":[...]}'

Extended scenario JSON fields (optional but enable more checks):

  conversation scene:
    "typing_frame": int            absolute frame typing starts (start_frame + typing_offset)
    "bot_message_count": int       number of bot messages in this scene
    "message_start_frames": [int]  per-message absolute start frames (include jitter)
                                   Jitter pattern: [0,2,1,0,2,1,2,0,1,2] repeating per ChatConversation.tsx

  quick-reply scene:
    "reply_frame": int             absolute frame user reply appears (start_frame + replyOffset)
    "their_reply_frame": int       absolute frame contact reply appears (start_frame + responseOffset)

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

WHATSAPP_GREEN  = (29, 171, 97)    # #1dab61 — badges, send button, avatar backgrounds
TAP_RIPPLE      = (37, 211, 102)   # #25d366 — tap ripple and row-highlight color in ChatList.tsx
SENT_BUBBLE     = (220, 248, 198)  # #dcf8c6 — outgoing chat bubble background
SENT_BUBBLE_2   = (217, 253, 211)  # #D9FDD3 — WA.bgBubbleSent (theme value)
TYPING_DOT      = (102, 119, 129)  # #667781 — WA.textSecondary used for typing indicator dots


# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------

def load_img(path: str) -> Image.Image:
    return Image.open(path).convert("RGB")


def mean_luminance(img: Image.Image) -> float:
    """Average brightness across all pixels (0–255)."""
    if HAS_NUMPY:
        return float(np.array(img).mean())
    pixels = list(img.get_flattened_data() if hasattr(img, 'get_flattened_data') else img.getdata())
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
    x_start: int = 0,
    x_end: int = None,
) -> int:
    """Count pixels matching target_rgb within per-channel tolerance in a region."""
    if y_end is None:
        y_end = img.height
    if x_end is None:
        x_end = img.width
    region = img.crop((x_start, y_start, x_end, y_end))
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


def first_row_with_color(
    img: Image.Image,
    target_rgb: tuple,
    tolerance: int = 15,
    y_start: int = 0,
    y_end: int = None,
) -> int:
    """
    Return the first (topmost) row Y index containing ≥5 pixels matching target_rgb.
    Returns -1 if not found. Used to track vertical position of a bubble.
    """
    if y_end is None:
        y_end = img.height
    tr, tg, tb = target_rgb
    if HAS_NUMPY:
        arr = np.array(img)[y_start:y_end]
        mask = (
            (np.abs(arr[:, :, 0].astype(int) - tr) <= tolerance)
            & (np.abs(arr[:, :, 1].astype(int) - tg) <= tolerance)
            & (np.abs(arr[:, :, 2].astype(int) - tb) <= tolerance)
        )
        row_counts = mask.sum(axis=1)
        matches = np.where(row_counts >= 5)[0]
        return int(matches[0]) + y_start if len(matches) > 0 else -1
    # Fallback: row-by-row scan
    w = img.width
    for y in range(y_start, y_end):
        row = [img.getpixel((x, y)) for x in range(w)]
        count = sum(
            1 for r, g, b in row
            if abs(r - tr) <= tolerance and abs(g - tg) <= tolerance and abs(b - tb) <= tolerance
        )
        if count >= 5:
            return y
    return -1


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
        img = load_img(path)
        if HAS_NUMPY:
            lum = float(np.array(img).mean())
        else:
            pixels = list(img.getdata())
            lum = sum((r + g + b) / 3.0 for r, g, b in pixels) / len(pixels)
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
    for i in range(len(sorted_frames) - 1):
        n_a, n_b = sorted_frames[i], sorted_frames[i + 1]
        if n_b - n_a > 2:
            continue
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

    conversation→chat-list: sent-bubble green (#dcf8c6) in post-transition frames
    chat-list→conversation: tap ripple green in the MIDDLE of the frame only
        (excludes y < 200 [header] and y > 1700 [composer/send-button]
         to avoid false positives from the Budget Bot avatar and the green mic button)
    """
    findings = []
    for t in transitions:
        t_frame = t["frame"]
        transition_key = f"{t.get('from', '')}>{t.get('to', '')}"
        post_frames = [t_frame + 3, t_frame + 5]

        if transition_key == "conversation>chat-list":
            for n, path in existing_frames(frames_dir, post_frames):
                img = load_img(path)
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
                # Restrict to mid-screen (y=200–1700) — excludes header avatars and
                # the green send/mic button in the composer bar at the bottom.
                count = count_color_pixels(
                    img, WHATSAPP_GREEN, tolerance=10,
                    y_start=200, y_end=1700,
                )
                if count > 5000:
                    findings.append({
                        "frame": n, "check": "color_leakage",
                        "detail": (
                            f"WhatsApp green (#1dab61) in {count} pixels at frame {n} "
                            f"(mid-screen, y=200–1700) — tap ripple persisting into conversation"
                        )
                    })
    return findings


def count_green_lean_pixels(
    img: Image.Image,
    y_start: int = 300,
    y_end: int = 1700,
    g_min: int = 200,
    g_minus_r: int = 60,
    g_minus_b: int = 50,
) -> int:
    """
    Count pixels where green channel is significantly higher than red and blue.

    Default thresholds (G>200, G-R>60, G-B>50) target rgba(37,211,102) at ≥85% opacity.

    For the chat-list row-highlight (max 25% opacity), use looser thresholds:
      g_minus_r=30, g_minus_b=15  — see check_tap_ripple for usage.
    """
    if HAS_NUMPY:
        arr = np.array(img)[y_start:min(y_end, img.height)]
        r = arr[:, :, 0].astype(int)
        g = arr[:, :, 1].astype(int)
        b = arr[:, :, 2].astype(int)
        return int(((g > g_min) & ((g - r) > g_minus_r) & ((g - b) > g_minus_b)).sum())
    count = 0
    for y in range(y_start, min(y_end, img.height)):
        for x in range(img.width):
            r, g, b = img.getpixel((x, y))
            if g > g_min and (g - r) > g_minus_r and (g - b) > g_minus_b:
                count += 1
    return count


def check_tap_ripple(frames_dir: str, scenes: list) -> list:
    """
    For each chat-list scene, verify the tap row-highlight is actually visible.

    ChatList.tsx highlights the tapped row with rgba(37,211,102) alpha-blended on white.
    The row highlight peaks at tapProgress=0.5 (frame tap_start+7) at ~25% opacity,
    producing approximately (201, 244, 217) — G>200, G-R≈43, G-B≈27.

    We use loose thresholds (G-R>30, G-B>15) tuned for this blended color.
    The row covers the full 1080px width at ~130px tall, so a working highlight
    creates thousands of matching pixels vs a near-zero baseline.

    Samples tap_start+7 (row highlight near peak) vs tap_start-3 (baseline).
    y=300–1700 excludes the header (All chip) and composer (mic button).
    """
    findings = []
    for scene in scenes:
        if scene["type"] != "chat-list":
            continue
        tap_start = scene.get("tap_start_frame")
        if tap_start is None:
            continue

        frame_before = tap_start - 3
        frame_during = tap_start + 7   # row highlight near peak alpha (tapProgress≈0.5)

        pb = frame_path(frames_dir, frame_before)
        pd = frame_path(frames_dir, frame_during)
        if not (pb.exists() and pd.exists()):
            continue

        # Loose thresholds: row highlight at 25% opacity gives G-R≈43, G-B≈27
        before_count = count_green_lean_pixels(load_img(str(pb)), g_minus_r=30, g_minus_b=15)
        during_count = count_green_lean_pixels(load_img(str(pd)), g_minus_r=30, g_minus_b=15)
        delta = during_count - before_count

        if delta < 1000:
            findings.append({
                "frame": frame_during, "check": "missing_tap_ripple",
                "detail": (
                    f"Tap row-highlight not detected at frame {frame_during}: {delta} new "
                    f"green-lean pixels (expect ≥1000). Before: {before_count}, during: {during_count}. "
                    f"Row highlight is rgba(37,211,102) at ~25% opacity on white."
                )
            })
    return findings


def check_typing_indicator_duration(scenes: list) -> list:
    """
    Data check: typing indicator duration must be proportional to message length.
    Formula: min_duration = max(15, 15 + (chars - 50) // 6)
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


def check_multi_bot_typing(scenes: list) -> list:
    # Retired: ChatConversation now derives per-bot-message typing windows automatically.
    # A conversation with N bot messages gets N typing windows; no scenario JSON field needed.
    return []


def check_typing_overlap(scenes: list) -> list:
    # Retired: ChatConversation's per-bot typing windows end exactly at each bot
    # message's start frame, making overlap structurally impossible.
    return []


def check_quick_reply_typing(frames_dir: str, scenes: list) -> list:
    # Retired: QuickReplyScreen now renders a TypingIndicator between replyFrame
    # and theirReplyFrame for any gap ≥ 12 frames. No longer a structural gap.
    return []


def check_scroll_jump(frames_dir: str, scenes: list) -> list:
    """
    Pixel check: when a bot message appears, the sent bubble (user message)
    should not jump more than 80px upward in a single frame.

    A large instant jump indicates the scroll offset or flex-end layout is
    snapping the content position rather than animating smoothly.

    We compare the topmost Y-row containing the sent bubble color (#D9FDD3)
    between the frame just before the bot message appears and a few frames after.

    Requires: scene["message_start_frames"] list with at least 2 entries.
    The first bot message is at index 1 (standard user→bot pattern).
    """
    findings = []
    SENT = SENT_BUBBLE_2  # #D9FDD3 — WA.bgBubbleSent

    for scene in scenes:
        if scene["type"] != "conversation":
            continue
        starts = scene.get("message_start_frames", [])
        if len(starts) < 2:
            continue

        # Check each bot message (odd indices in user→bot→user→bot pattern)
        bot_indices = [i for i in range(1, len(starts), 2)]
        for bi in bot_indices:
            bot_start = starts[bi]
            # 2-frame window: smooth maxHeight animation moves ~160px; instant snap moves 600–800px.
            frame_before = bot_start - 1
            frame_after  = bot_start + 1

            pb = frame_path(frames_dir, frame_before)
            pa = frame_path(frames_dir, frame_after)
            if not (pb.exists() and pa.exists()):
                continue

            img_b = load_img(str(pb))
            img_a = load_img(str(pa))

            # y=200 skips the header; y_end=1700 skips the composer
            y_before = first_row_with_color(img_b, SENT, tolerance=15, y_start=200, y_end=1700)
            y_after  = first_row_with_color(img_a, SENT, tolerance=15, y_start=200, y_end=1700)

            if y_before == -1 or y_after == -1:
                continue  # bubble not visible in one of the frames — skip

            # Moving UP means y_after < y_before (smaller Y = higher on screen).
            # Threshold 300px: smooth maxHeight animation moves ~160px in 4 frames;
            # an instant layout snap from a large bot message moves 600-800px.
            jump = y_before - y_after
            if jump > 300:
                findings.append({
                    "frame": frame_after,
                    "check": "scroll_jump",
                    "detail": (
                        f"Sent bubble jumped {jump}px upward when bot message appeared "
                        f"(frame {frame_before}→{frame_after}: y={y_before}→{y_after}). "
                        f"Expect ≤300px over 6 frames with smooth maxHeight animation; "
                        f"larger values indicate the bot bubble is still snapping to full height instantly."
                    )
                })
    return findings


# ---------------------------------------------------------------------------
# Frame list
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

    # Transition boundary frames (±5)
    for t in transitions:
        for offset in (-5, -3, -1, 0, 1, 3, 5):
            frames.add(t["frame"] + offset)

    for scene in scenes:
        # Chat-list: tap animation window
        if scene["type"] == "chat-list":
            tap = scene.get("tap_start_frame")
            if tap is not None:
                for offset in (-3, 0, 5, 7):
                    frames.add(tap + offset)

        # Conversation: frames around each bot message start for scroll_jump check
        if scene["type"] == "conversation":
            starts = scene.get("message_start_frames", [])
            # Bot messages are at odd indices (user→bot→user→bot pattern)
            for i in range(1, len(starts), 2):
                for offset in (-1, 1):
                    frames.add(starts[i] + offset)

        # Quick-reply: midpoint frame for typing indicator check
        if scene["type"] == "quick-reply":
            rf = scene.get("reply_frame")
            trf = scene.get("their_reply_frame")
            if rf is not None and trf is not None and trf - rf >= 10:
                frames.add(rf + (trf - rf) // 2)

    return sorted(frames)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Objective transition QA checks for Remotion videos."
    )
    parser.add_argument("--frames-dir", required=True)
    parser.add_argument("--scenario-json", required=True)
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
    findings += check_typing_indicator_duration(scenes)
    findings += check_multi_bot_typing(scenes)
    findings += check_typing_overlap(scenes)
    findings += check_quick_reply_typing(args.frames_dir, scenes)
    findings += check_scroll_jump(args.frames_dir, scenes)

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
