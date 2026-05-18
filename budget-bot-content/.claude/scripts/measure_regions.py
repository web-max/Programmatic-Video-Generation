#!/usr/bin/env python3
"""
Measure specific UI component regions in a rendered WhatsApp frame.
Reports average color, dominant color, and region dimensions.

Usage:
  python3 measure_regions.py <image.png> [--component <name>] [--coords x y w h] [--find-color R G B]
"""
import sys
import argparse
import math


def load_image(path):
    try:
        from PIL import Image
        img = Image.open(path).convert('RGB')
        w, h = img.size
        return w, h, list(img.getdata())
    except ImportError:
        pass

    import zlib, struct
    with open(path, 'rb') as f:
        data = f.read()

    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError(f"Not a PNG: {path}")

    chunks = {}
    i = 8
    while i < len(data):
        ln = struct.unpack('>I', data[i:i+4])[0]
        ct = data[i+4:i+8].decode('ascii')
        cd = data[i+8:i+8+ln]
        chunks.setdefault(ct, []).append(cd)
        i += 12 + ln

    ihdr = chunks['IHDR'][0]
    width = struct.unpack('>I', ihdr[0:4])[0]
    height = struct.unpack('>I', ihdr[4:8])[0]
    color_type = ihdr[9]
    channels = {2: 3, 6: 4}.get(color_type, 3)

    raw = zlib.decompress(b''.join(chunks['IDAT']))
    stride = width * channels + 1
    flat = []

    prev_row = [0] * (width * channels)
    for y in range(height):
        fb = raw[y * stride]
        row = list(raw[y * stride + 1:(y + 1) * stride])
        if fb == 1:
            for x in range(channels, len(row)):
                row[x] = (row[x] + row[x - channels]) % 256
        elif fb == 2:
            row = [(row[x] + prev_row[x]) % 256 for x in range(len(row))]
        elif fb == 3:
            for x in range(len(row)):
                a = row[x - channels] if x >= channels else 0
                row[x] = (row[x] + (a + prev_row[x]) // 2) % 256
        elif fb == 4:
            new_row = list(row)
            for x in range(len(row)):
                a = new_row[x - channels] if x >= channels else 0
                b = prev_row[x]
                c = prev_row[x - channels] if x >= channels else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                new_row[x] = (row[x] + pr) % 256
            row = new_row
        prev_row = row
        for px in range(width):
            flat.append((row[px * channels], row[px * channels + 1], row[px * channels + 2]))

    return width, height, flat


def sample_region(pixels, img_w, x, y, w, h):
    """Sample all pixels in a region, return stats."""
    rs, gs, bs = [], [], []
    for py in range(y, min(y + h, len(pixels) // img_w)):
        for px in range(x, min(x + w, img_w)):
            r, g, b = pixels[py * img_w + px]
            rs.append(r)
            gs.append(g)
            bs.append(b)

    if not rs:
        return None

    avg_r = sum(rs) / len(rs)
    avg_g = sum(gs) / len(gs)
    avg_b = sum(bs) / len(bs)

    def std(vals, mean):
        return math.sqrt(sum((v - mean) ** 2 for v in vals) / len(vals))

    return {
        'avg': (round(avg_r), round(avg_g), round(avg_b)),
        'avg_hex': '#{:02x}{:02x}{:02x}'.format(round(avg_r), round(avg_g), round(avg_b)),
        'std': (round(std(rs, avg_r), 1), round(std(gs, avg_g), 1), round(std(bs, avg_b), 1)),
        'sample_count': len(rs),
    }


def find_color_in_image(pixels, img_w, img_h, target_r, target_g, target_b, tolerance=15):
    """Find where a specific color appears in the image, return bounding box."""
    matches = []
    for idx, (r, g, b) in enumerate(pixels):
        dist = math.sqrt((r - target_r)**2 + (g - target_g)**2 + (b - target_b)**2)
        if dist <= tolerance:
            x = idx % img_w
            y = idx // img_w
            matches.append((x, y))

    if not matches:
        return None

    xs = [m[0] for m in matches]
    ys = [m[1] for m in matches]
    return {
        'match_count': len(matches),
        'bbox': (min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys)),
        'centroid': (sum(xs) // len(xs), sum(ys) // len(ys)),
    }


COMPONENTS = {
    'status-bar':   (0,    0,    1080, 80),
    'header':       (0,    80,   1080, 130),
    'header-avatar':(24,   95,   60,   60),
    'header-title': (100,  95,   300,  60),
    'search-bar':   (20,   220,  1040, 80),
    'chat-row':     (0,    310,  1080, 650),
    'chat-row-1':   (0,    310,  1080, 130),
    'chat-row-name':(100,  320,  400,  40),
    'chat-row-2':   (0,    440,  1080, 130),
    'bottom-tabs':  (0,    1750, 1080, 170),
    'bubble':       (560,  700,  480,  200),
    'composer':     (0,    1630, 1080, 120),
    'wallpaper':    (0,    420,  1080, 1200),
    'all':          None,
}

WHATSAPP_EXPECTED = {
    'header':       '#1f2c34',
    'search-bar':   '#2a3942',
    'bottom-tabs':  '#1f2c34',
    'composer':     '#1f2c34',
    'bubble-out':   '#005c4b',
    'bubble-in':    '#202c33',
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('image', help='Image path')
    parser.add_argument('--component', default='all', help='Component name or "all"')
    parser.add_argument('--coords', nargs=4, type=int, metavar=('X', 'Y', 'W', 'H'))
    parser.add_argument('--find-color', nargs=3, type=int, metavar=('R', 'G', 'B'),
                        help='Find where a specific RGB color appears')
    parser.add_argument('--tolerance', type=int, default=15)
    args = parser.parse_args()

    img_w, img_h, pixels = load_image(args.image)
    print(f"\nImage: {args.image} ({img_w}x{img_h})")

    if args.find_color:
        r, g, b = args.find_color
        result = find_color_in_image(pixels, img_w, img_h, r, g, b, args.tolerance)
        if result:
            bbox = result['bbox']
            cx, cy = result['centroid']
            print(f"\nColor RGB({r},{g},{b}) found:")
            print(f"  Matches: {result['match_count']} pixels")
            print(f"  Bounding box: x={bbox[0]} y={bbox[1]} w={bbox[2]} h={bbox[3]}")
            print(f"  Centroid: ({cx}, {cy})")
        else:
            print(f"\nColor RGB({r},{g},{b}) NOT FOUND (tolerance={args.tolerance})")
        return

    if args.coords:
        x, y, w, h = args.coords
        result = sample_region(pixels, img_w, x, y, w, h)
        if result:
            print(f"\nCustom region ({x},{y},{w}x{h}):")
            print(f"  avg color: {result['avg_hex']} = RGB{result['avg']}")
            print(f"  std dev:   R={result['std'][0]} G={result['std'][1]} B={result['std'][2]}")
        return

    components_to_check = COMPONENTS.items() if args.component == 'all' else [
        (args.component, COMPONENTS.get(args.component))
    ]

    print()
    for name, coords in components_to_check:
        if coords is None:
            continue
        x, y, w, h = coords
        if x + w > img_w or y + h > img_h:
            print(f"  {name:<20s}  SKIP (out of bounds for {img_w}x{img_h})")
            continue

        result = sample_region(pixels, img_w, x, y, w, h)
        if not result:
            continue

        expected = WHATSAPP_EXPECTED.get(name)
        delta_str = ''
        if expected:
            er = int(expected[1:3], 16)
            eg = int(expected[3:5], 16)
            eb = int(expected[5:7], 16)
            ar, ag, ab = result['avg']
            delta = math.sqrt((ar - er)**2 + (ag - eg)**2 + (ab - eb)**2)
            status = 'OK' if delta < 10 else ('WARN' if delta < 25 else 'FAIL')
            delta_str = f"  expected={expected} delta={delta:.1f} [{status}]"

        print(f"  {name:<20s}  avg={result['avg_hex']}  std=({result['std'][0]},{result['std'][1]},{result['std'][2]}){delta_str}")


if __name__ == '__main__':
    main()
