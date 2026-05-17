---
name: measure-rendered-pixels
description: Measure the pixel dimensions and positions of visual elements in a rendered PNG image using only Python stdlib — no PIL or external packages needed. Use when verifying layout widths, debugging CSS rendering bugs, or confirming no visual regression after a refactor. Works with output from Remotion, Puppeteer, Playwright, or any screenshot tool.
---

# Measure Rendered Pixels

Precisely measure the pixel positions and widths of visual elements in a rendered image using only Python stdlib (`struct` + `zlib`). No `PIL`, `numpy`, or any other external package needed.

## When to use

- Verifying that a layout change produced the expected rendered width
- Diagnosing why a UI element renders narrower or wider than expected
- Confirming visual regression: before vs. after a refactor (widths should be identical)
- Any project that renders images programmatically (Remotion, Playwright, Puppeteer, etc.)

## Core snippet

Paste this into any Python inline (`python3 -c "..."`) or script:

```python
import struct, zlib

def read_png_row(path: str, y: int):
    """Return (canvas_width, list_of_RGB_tuples) for row y of a PNG file."""
    with open(path, 'rb') as f:
        data = f.read()
    pos = 8
    ihdr = None
    raw_idat = b''
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        ctype  = data[pos+4:pos+8].decode('ascii')
        cdata  = data[pos+8:pos+8+length]
        if ctype == 'IHDR':
            ihdr = cdata
        elif ctype == 'IDAT':
            raw_idat += cdata
        pos += 12 + length
    w          = struct.unpack('>I', ihdr[0:4])[0]
    color_type = ihdr[9]
    bpp        = 3 if color_type == 2 else 4          # RGB vs RGBA
    raw        = zlib.decompress(raw_idat)
    stride     = 1 + w * bpp                          # 1 filter byte + pixels
    row        = raw[y * stride : (y+1) * stride]
    return w, [(row[1 + x*bpp], row[1 + x*bpp+1], row[1 + x*bpp+2]) for x in range(w)]


def find_elements(path: str, ys: list[int], r_min=230, g_min=230, b_min=220):
    """
    Scan rows `ys` of the image at `path` for contiguous runs of pixels
    that pass the (r >= r_min, g >= g_min, b >= b_min) threshold.

    Adjust the threshold to match the element color you're hunting:
      - White chat bubbles:  r>230, g>230, b>220  (default)
      - Pure white:          r>250, g>250, b>250
      - Green WhatsApp sent: r>200, g>240, b>190
      - Dark backgrounds:    invert the logic (r<50, g<50, b<50)

    Prints: y=NNN: x=LEFT..RIGHT  widthXXXpx
    Skips rows where matching pixels span the full canvas width (background).
    """
    for y in ys:
        w, pixels = read_png_row(path, y)
        matching = [x for x, (r,g,b) in enumerate(pixels)
                    if r >= r_min and g >= g_min and b >= b_min]
        if not matching:
            continue
        left, right = matching[0], matching[-1]
        if right - left + 1 >= w - 5:    # skip full-width background bars
            continue
        print(f"  y={y:5d}: x={left:4d}..{right:4d}  width={right-left+1:4d}px  (canvas={w})")
```

## Workflow

### 1. Identify the image and the y-range to scan

You need to know roughly where in the image the element appears.

- For a 1080×1920 frame: the header occupies ~y=0..162, messages area y=162..1716, composer y=1716..1920.
- Scan at 30–60px intervals to locate the element, then tighten the range once found.
- If you don't know the y-range, do a coarse full scan first: `range(0, height, 50)`.

### 2. Choose the right color threshold

| Element type | Threshold to use |
|---|---|
| White/near-white (chat bubbles, cards) | `r>230, g>230, b>220` (default) |
| Pure white only | `r>250, g>250, b>250` |
| Light green (WhatsApp sent bubble, `#D9FDD3`) | `r>200, g>240, b>190` |
| Dark / inverted | negate: `r<50 and g<50 and b<50` |

The default threshold excludes beige/tan backgrounds (e.g. WhatsApp wallpaper `#EFEAE2`) — tweak if needed.

### 3. Run the scan

```bash
python3 - <<'EOF'
import struct, zlib

# --- paste read_png_row and find_elements here ---

find_elements('out/my-render.png', range(200, 1800, 40))
EOF
```

### 4. Interpret the results

- **Element right edge at x ≈ 918** (in a 1080px canvas): element is hitting its `maxWidth: 918px` ceiling.
- **Element right edge significantly less than ceiling**: element is content-driven (shrinks to its content width).
- **Full-width bar (x=0..1079)**: background or full-bleed panel — skipped automatically.
- **Inconsistent widths across two renders**: visual regression detected — the layout changed.

### 5. Compare before vs. after

To confirm a fix introduced no regressions, scan both renders at the same y-values and diff:

```python
before = {y: width for y, (_, _, width) in scan_results_before}
after  = {y: width for y, (_, _, width) in scan_results_after}
for y in sorted(before):
    if before[y] != after.get(y):
        print(f"REGRESSION at y={y}: was {before[y]}px, now {after.get(y)}px")
```

## Output example

```
  y=  460: x=   8.. 925  width= 918px  (canvas=1080)   ← at maxWidth ceiling
  y=  520: x=   8.. 925  width= 918px  (canvas=1080)
  y= 1400: x=   8.. 606  width= 599px  (canvas=1080)   ← content-driven (too narrow?)
  y= 1620: x=   9.. 289  width= 281px  (canvas=1080)   ← short single-line element
```

## Common pitfalls

- **PNG uses IDAT chunks split across multiple chunks** — the snippet accumulates all of them before decompressing, which handles this correctly.
- **Interlaced PNGs** — the snippet does not support interlaced PNGs (rare in programmatically generated images). If you get garbled results, check `ihdr[12]` — `0` = non-interlaced (safe), `1` = Adam7 interlaced (unsupported).
- **Image has a retina/2× scale** — if your tool renders at 2× for quality, all pixel measurements will be doubled. Divide by scale factor when comparing to CSS pixel values.
- **JPEG artifacts** — JPEGs use lossy compression; pixel values won't be exact. Use PNG output from your render tool when precision matters.
