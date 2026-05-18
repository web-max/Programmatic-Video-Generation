# /pixel-measure — Precise pixel color and spatial measurement

Get exact RGB values, average region colors, element dimensions, and spacing measurements from any image.

## Usage
```
/pixel-measure <image_path> color <x> <y>
/pixel-measure <image_path> region <x> <y> <width> <height>
/pixel-measure <image_path> ui-audit
```

## Commands

### `color` — Single pixel RGB
```bash
python3 -c "
from PIL import Image
img = Image.open('<image_path>').convert('RGB')
r,g,b = img.getpixel((<x>, <y>))
print(f'RGB({r},{g},{b}) = #{r:02x}{g:02x}{b:02x}')
"
```

### `region` — Average color of a region
```bash
python3 -c "
import numpy as np
from PIL import Image
img = np.array(Image.open('<image_path>').convert('RGB'))
region = img[<y>:<y>+<height>, <x>:<x>+<width>]
avg = region.mean(axis=(0,1))
print(f'Avg RGB({avg[0]:.1f},{avg[1]:.1f},{avg[2]:.1f}) = #{int(avg[0]):02x}{int(avg[1]):02x}{int(avg[2]):02x}')
print(f'Std dev: R={region[:,:,0].std():.1f} G={region[:,:,1].std():.1f} B={region[:,:,2].std():.1f}')
"
```

### `ui-audit` — Measure all key WhatsApp UI regions automatically
Run the full audit script:
```bash
python3 .claude/scripts/measure_regions.py <image_path>
```
This samples every named UI zone (status bar, header, search bar, chat rows, bottom tabs) and reports:
- Average color per zone
- Dominant color per zone
- Zone height in pixels

## Coordinate reference for 1080×1920 WhatsApp UI

These are approximate coordinates for key elements — adjust based on actual rendered output:

| Element                  | X    | Y    | W    | H   |
|--------------------------|------|------|------|-----|
| Status bar               | 0    | 0    | 1080 | 80  |
| Header bar               | 0    | 80   | 1080 | 130 |
| Header avatar            | 24   | 95   | 60   | 60  |
| Header title             | 100  | 95   | 300  | 60  |
| Search bar               | 20   | 220  | 1040 | 80  |
| Chat row 1               | 0    | 310  | 1080 | 130 |
| Chat row name (row 1)    | 100  | 320  | 400  | 40  |
| Chat row preview (row 1) | 100  | 365  | 500  | 35  |
| Bottom tabs              | 0    | 1750 | 1080 | 170 |
| Outgoing bubble          | 600  | 800  | 420  | 100 |
| Input bar                | 0    | 1650 | 1080 | 100 |

## Comparing two values
After measuring both ref and generated images, report the delta:
- Color delta: compute per-channel difference and total Euclidean distance `sqrt(dR²+dG²+dB²)`
- A delta > 10 is visually noticeable; > 20 is clearly wrong; > 40 is a major mismatch
- Size delta: report in pixels and as % of dimension

## Notes
- All coordinates are in pixels for a 1080×1920 canvas
- If the image is a different size, scale coordinates proportionally
- For font/text color, sample the center of a letter, avoiding edges (anti-aliasing noise)
