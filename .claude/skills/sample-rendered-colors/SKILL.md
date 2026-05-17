---
name: sample-rendered-colors
description: Precisely extract and match colors from rendered PNG images using only Python stdlib. Covers interior patch sampling, CSS hex ↔ RGB conversion, rgba() compositing reverse-calculation, tolerance-based color search, and common gotchas (ICC profiles, scale artifacts, anti-aliasing). Use when you need exact color values from a render, want to verify a color appears where expected, or need to find where a specific color lives in an image.
---

# Sample Rendered Colors

Extract exact color values from rendered images and verify color correctness — using only Python stdlib, no PIL or external packages.

## When to use

- You need the exact RGB value of a rendered element to match it in CSS
- Verifying a color token change produced the right output
- Finding where a specific color lives in a render (searching, not just sampling)
- Debugging why a rendered color doesn't match its CSS value
- Confirming a color doesn't appear somewhere it shouldn't

---

## Core utilities

Paste this block at the top of any inline Python script:

```python
import struct, zlib, collections

# ── PNG loader ────────────────────────────────────────────────────────────────

def load_png(path: str) -> tuple[int, int, list[list[tuple[int,int,int]]]]:
    """
    Return (width, height, pixels) where pixels[y][x] = (R, G, B).
    Reads raw bytes — no ICC profile or gamma correction applied.
    Supports RGB (color_type=2) and RGBA (color_type=6) PNGs.
    Does NOT support interlaced PNGs (rare in programmatic renders).
    """
    data = open(path, 'rb').read()
    pos = 8
    ihdr = None
    raw_idat = b''
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        ctype  = data[pos+4:pos+8].decode('ascii')
        cdata  = data[pos+8:pos+8+length]
        if ctype == 'IHDR': ihdr = cdata
        elif ctype == 'IDAT': raw_idat += cdata
        pos += 12 + length
    w   = struct.unpack('>I', ihdr[0:4])[0]
    h   = struct.unpack('>I', ihdr[4:8])[0]
    bpp = 3 if ihdr[9] == 2 else 4
    raw = zlib.decompress(raw_idat)
    stride = 1 + w * bpp
    pixels = []
    for y in range(h):
        row = raw[y*stride:(y+1)*stride]
        pixels.append([(row[1+x*bpp], row[1+x*bpp+1], row[1+x*bpp+2]) for x in range(w)])
    return w, h, pixels

# ── Color utilities ───────────────────────────────────────────────────────────

def hex_to_rgb(css_hex: str) -> tuple[int,int,int]:
    """'#25D366' or '25D366' → (37, 211, 102)"""
    h = css_hex.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))

def rgb_to_hex(r: int, g: int, b: int) -> str:
    """(37, 211, 102) → '#25d366'"""
    return f'#{r:02x}{g:02x}{b:02x}'

def color_distance(a: tuple, b: tuple) -> float:
    """Euclidean distance between two RGB colors. ≤5 is effectively identical."""
    return sum((a[i]-b[i])**2 for i in range(3)) ** 0.5
```

---

## Operations

### Sample a single pixel

```python
w, h, pixels = load_png('out/render.png')
r, g, b = pixels[960][540]      # y=960, x=540
print(rgb_to_hex(r, g, b))      # '#25d366'
```

> **Gotcha:** Never sample a pixel on or near a visible edge — anti-aliasing blends it with the background. Move at least 3–4px inward from any border, rounded corner, or shadow.

---

### Sample a patch (recommended for solid elements)

Takes the most-frequent color (mode) across an N×N region. Eliminates single-pixel noise from subpixel rendering or minor compression artifacts.

```python
def sample_patch(pixels, cx: int, cy: int, size: int = 10) -> tuple[int,int,int]:
    """
    Sample the dominant color in a (size × size) patch centered at (cx, cy).
    Use for solid-color regions: buttons, bubble backgrounds, icons.
    """
    half = size // 2
    patch = [
        pixels[y][x]
        for y in range(cy - half, cy + half)
        for x in range(cx - half, cx + half)
    ]
    return collections.Counter(patch).most_common(1)[0][0]

w, h, pixels = load_png('out/render.png')
color = sample_patch(pixels, cx=200, cy=800)
print(f"Dominant color: {rgb_to_hex(*color)}  {color}")
```

---

### Verify a color at a location

```python
def assert_color(pixels, cx, cy, expected_hex, tolerance=5, patch_size=10):
    """
    Assert the rendered color at (cx, cy) matches expected_hex within tolerance.
    Raises AssertionError with a clear diff message if it doesn't.
    """
    actual  = sample_patch(pixels, cx, cy, patch_size)
    target  = hex_to_rgb(expected_hex)
    dist    = color_distance(actual, target)
    if dist > tolerance:
        raise AssertionError(
            f"Color mismatch at ({cx},{cy}):\n"
            f"  expected: {expected_hex}  {target}\n"
            f"  actual:   {rgb_to_hex(*actual)}  {actual}\n"
            f"  distance: {dist:.1f}  (tolerance: {tolerance})"
        )
    print(f"✓ ({cx},{cy}): {rgb_to_hex(*actual)} matches {expected_hex}  (dist={dist:.1f})")

w, h, pixels = load_png('out/render.png')
assert_color(pixels, cx=200, cy=800, expected_hex='#25D366')   # WhatsApp green
assert_color(pixels, cx=540, cy=400, expected_hex='#FFFFFF')   # white bubble
```

---

### Search: find where a color lives

Scans the entire image (or a sub-region) for pixels matching a target color within tolerance. Useful when you don't know the coordinates of an element.

```python
def find_color(pixels, target_hex: str, tolerance: float = 10,
               y_range: range = None, x_range: range = None):
    """
    Return list of (y, x) coordinates where the color matches target_hex.
    Restrict search to y_range/x_range to speed up large images.
    """
    target = hex_to_rgb(target_hex)
    h = len(pixels); w = len(pixels[0])
    ys = y_range or range(h)
    xs = x_range or range(w)
    hits = []
    for y in ys:
        for x in xs:
            if color_distance(pixels[y][x], target) <= tolerance:
                hits.append((y, x))
    return hits

w, h, pixels = load_png('out/render.png')

# Find all pixels matching WhatsApp green (sent bubble border, avatar, etc.)
hits = find_color(pixels, '#25D366', tolerance=8)
print(f"Found {len(hits)} matching pixels")

# Find bounding box of all matches
if hits:
    ys = [y for y,x in hits]; xs = [x for y,x in hits]
    print(f"Bounding box: y={min(ys)}..{max(ys)}  x={min(xs)}..{max(xs)}")
```

> **Performance note:** Full-image search on a 1080×1920 PNG is ~2M pixel checks — takes ~1–2s in pure Python. Restrict `y_range` and `x_range` when you have a rough idea of where the element is.

---

### Verify a color does NOT appear in a region

```python
def assert_color_absent(pixels, target_hex, y_range, x_range, tolerance=10):
    """Assert a color is absent from a region — e.g. no red error indicators."""
    hits = find_color(pixels, target_hex, tolerance, y_range, x_range)
    if hits:
        raise AssertionError(
            f"Expected {target_hex} to be absent, but found {len(hits)} pixels\n"
            f"First hit: y={hits[0][0]}, x={hits[0][1]}"
        )
    print(f"✓ {target_hex} is absent from the region")
```

---

### Reverse-calculate the CSS color behind an opacity

When a rendered pixel doesn't match your CSS `color` value, check if there's an `opacity` or `rgba()` in the ancestor chain. The renderer composites them together:

```
rendered = alpha × fg + (1 − alpha) × bg
```

Rearranged to recover the original `fg` CSS color:

```python
def recover_fg_color(rendered: tuple, bg_hex: str, alpha: float) -> tuple[int,int,int]:
    """
    Given a rendered pixel color, the background color, and the opacity,
    reverse-calculate the foreground CSS color before opacity was applied.

    Example: element has color='#D9FDD3', opacity=0.9, background='#EFEAE2'
    → the rendered pixel will be a blend; this recovers #D9FDD3 from it.
    """
    bg = hex_to_rgb(bg_hex)
    return tuple(
        round((rendered[i] - (1 - alpha) * bg[i]) / alpha)
        for i in range(3)
    )

# Example: sampled pixel is (218, 248, 210), bg=#EFEAE2, opacity=0.85
rendered = (218, 248, 210)
original = recover_fg_color(rendered, bg_hex='#EFEAE2', alpha=0.85)
print(rgb_to_hex(*original))   # → the original CSS color
```

---

## Common gotchas

### Anti-aliasing: edges are always blended

```
✗ pixels[borderY][borderX]          → blended with background
✓ pixels[borderY + 4][borderX + 4]  → true element color
```
Always sample the interior of a solid-color region, not its edges.

### ICC color profiles: raw bytes vs display-corrected values

Our `load_png` reads raw bytes with no color correction. This matches what the renderer wrote — which is what you need to compare against CSS values. If you open the same PNG in Preview, Photoshop, or Chrome (which applies ICC correction), you may see slightly different colors. The raw byte values are authoritative for CSS matching.

### CSS `transform: scale()` resamples pixels

When a parent has `transform: scale(0.703)`, the renderer resamples child pixels. Fine lines (1–2px borders, 1px separators) will have anti-aliased colors. Large solid-color regions (bubble backgrounds, avatar fills) will be accurate. Always sample from large solid areas, never hairlines.

### Emoji colors cannot be predicted from CSS

Emoji are rendered by the OS/platform emoji font. Their colors are baked into the font and vary by platform. The only reliable source of emoji colors is pixel sampling the rendered output.

### JPEG vs PNG

JPEG uses lossy compression — pixel values are approximate. Always use PNG output from your render tool when you need exact color matching.

### Tolerance guidelines

| Situation | Recommended tolerance |
|---|---|
| Same renderer, same machine | ≤ 3 |
| Same renderer, comparing builds | ≤ 5 |
| Scaled/transformed elements | ≤ 10 |
| Emoji or anti-aliased text | ≤ 15 |
| Cross-platform comparison | ≤ 20 |

---

## Full example: audit a rendered frame for color correctness

```python
import struct, zlib, collections

# --- paste core utilities here ---

w, h, pixels = load_png('out/check-f500.png')

# Verify specific element colors
assert_color(pixels, cx=540,  cy=162,  expected_hex='#075E54')  # header bg
assert_color(pixels, cx=100,  cy=600,  expected_hex='#FFFFFF')  # bot bubble bg
assert_color(pixels, cx=980,  cy=900,  expected_hex='#D9FDD3')  # user bubble bg
assert_color(pixels, cx=540,  cy=1820, expected_hex='#F0F2F5')  # composer bg

# Confirm no error-red anywhere in the messages area
assert_color_absent(pixels, '#FF0000', y_range=range(162, 1716), x_range=range(0, 1080))

print("All color checks passed.")
```
