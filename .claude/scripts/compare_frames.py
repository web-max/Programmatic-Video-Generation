#!/usr/bin/env python3
"""
Pixel-level frame comparison tool.
Compares a reference image against a generated image and reports numerical differences.

Usage:
  python3 compare_frames.py <ref.png> <gen.png> [--output diff.png] [--region x y w h] [--report]
"""
import sys
import argparse
import json
import math

def load_image_raw(path):
    """Load PNG as raw pixel array without PIL — uses stdlib only."""
    import zlib, struct
    with open(path, 'rb') as f:
        data = f.read()

    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError(f"Not a PNG file: {path}")

    chunks = {}
    i = 8
    while i < len(data):
        length = struct.unpack('>I', data[i:i+4])[0]
        chunk_type = data[i+4:i+8].decode('ascii')
        chunk_data = data[i+8:i+8+length]
        if chunk_type not in chunks:
            chunks[chunk_type] = []
        chunks[chunk_type].append(chunk_data)
        i += 12 + length

    ihdr = chunks['IHDR'][0]
    width = struct.unpack('>I', ihdr[0:4])[0]
    height = struct.unpack('>I', ihdr[4:8])[0]
    bit_depth = ihdr[8]
    color_type = ihdr[9]

    raw = zlib.decompress(b''.join(chunks['IDAT']))

    if color_type == 2:  # RGB
        channels = 3
    elif color_type == 6:  # RGBA
        channels = 4
    else:
        raise ValueError(f"Unsupported color type: {color_type}")

    stride = width * channels + 1
    pixels = []

    for y in range(height):
        filter_byte = raw[y * stride]
        row_raw = list(raw[y * stride + 1: (y + 1) * stride])

        if filter_byte == 0:
            row = row_raw
        elif filter_byte == 1:  # Sub
            row = list(row_raw)
            for x in range(channels, len(row)):
                row[x] = (row[x] + row[x - channels]) % 256
        elif filter_byte == 2:  # Up
            if y == 0:
                row = row_raw
            else:
                prev = pixels[y - 1]
                row = [(row_raw[x] + prev[x]) % 256 for x in range(len(row_raw))]
        elif filter_byte == 3:  # Average
            row = list(row_raw)
            prev = pixels[y - 1] if y > 0 else [0] * len(row)
            for x in range(len(row)):
                a = row[x - channels] if x >= channels else 0
                b = prev[x]
                row[x] = (row_raw[x] + (a + b) // 2) % 256
        elif filter_byte == 4:  # Paeth
            row = list(row_raw)
            prev = pixels[y - 1] if y > 0 else [0] * len(row)
            for x in range(len(row)):
                a = row[x - channels] if x >= channels else 0
                b = prev[x]
                c = prev[x - channels] if x >= channels else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                row[x] = (row_raw[x] + pr) % 256
        else:
            row = row_raw

        pixels.append(row)

    return width, height, channels, pixels


def try_load_with_pil(path):
    """Try PIL first (faster), fall back to stdlib."""
    try:
        from PIL import Image
        import array
        img = Image.open(path).convert('RGB')
        w, h = img.size
        px = list(img.getdata())
        pixels = []
        for y in range(h):
            row = []
            for x in range(w):
                r, g, b = px[y * w + x]
                row.extend([r, g, b])
            pixels.append(row)
        return w, h, 3, pixels
    except ImportError:
        return load_image_raw(path)


def get_pixel(pixels, channels, x, y):
    row = pixels[y]
    i = x * channels
    return row[i], row[i+1], row[i+2]


def compare_region(ref_pixels, gen_pixels, ref_ch, gen_ch, x, y, w, h):
    total_delta = 0
    max_delta = 0
    count = 0
    channel_sums_ref = [0, 0, 0]
    channel_sums_gen = [0, 0, 0]

    for py in range(y, y + h):
        for px in range(x, x + w):
            rr, rg, rb = get_pixel(ref_pixels, ref_ch, px, py)
            gr, gg, gb = get_pixel(gen_pixels, gen_ch, px, py)

            dr, dg, db = abs(rr - gr), abs(rg - gg), abs(rb - gb)
            pixel_delta = (dr + dg + db) / 3.0
            euclidean = math.sqrt(dr**2 + dg**2 + db**2)

            total_delta += pixel_delta
            if euclidean > max_delta:
                max_delta = euclidean
            count += 1

            channel_sums_ref[0] += rr
            channel_sums_ref[1] += rg
            channel_sums_ref[2] += rb
            channel_sums_gen[0] += gr
            channel_sums_gen[1] += gg
            channel_sums_gen[2] += gb

    mae = total_delta / count if count > 0 else 0
    ref_avg = [s / count for s in channel_sums_ref]
    gen_avg = [s / count for s in channel_sums_gen]

    return {
        'mae': round(mae, 2),
        'max_delta_euclidean': round(max_delta, 2),
        'ref_avg_rgb': [round(v) for v in ref_avg],
        'gen_avg_rgb': [round(v) for v in gen_avg],
        'ref_avg_hex': '#{:02x}{:02x}{:02x}'.format(*[round(v) for v in ref_avg]),
        'gen_avg_hex': '#{:02x}{:02x}{:02x}'.format(*[round(v) for v in gen_avg]),
        'pixels_compared': count,
    }


def write_diff_image(ref_pixels, gen_pixels, ref_w, ref_h, ref_ch, gen_ch, output_path, region=None):
    """Write a diff image where bright colors = high error."""
    try:
        from PIL import Image
        import numpy as np

        ref_img = Image.open(ref_pixels if isinstance(ref_pixels, str) else '/tmp/_ref_tmp.png').convert('RGB')
        gen_img = Image.open(gen_pixels if isinstance(gen_pixels, str) else '/tmp/_gen_tmp.png').convert('RGB')

        ref_arr = np.array(ref_img).astype(int)
        gen_arr = np.array(gen_img).astype(int)

        diff = np.abs(ref_arr - gen_arr)
        diff_scaled = (diff * 3).clip(0, 255).astype('uint8')

        diff_img = Image.fromarray(diff_scaled)
        diff_img.save(output_path)
        return True
    except Exception as e:
        return False


WHATSAPP_REGIONS = {
    'status_bar':   (0,    0,    1080, 80),
    'header':       (0,    80,   1080, 130),
    'search_bar':   (20,   220,  1040, 80),
    'chat_row_1':   (0,    310,  1080, 130),
    'chat_row_2':   (0,    440,  1080, 130),
    'bottom_tabs':  (0,    1750, 1080, 170),
    'composer':     (0,    1630, 1080, 120),
    'wallpaper':    (0,    420,  1080, 1200),
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('ref', help='Reference image path')
    parser.add_argument('gen', help='Generated image path')
    parser.add_argument('--output', help='Output diff image path')
    parser.add_argument('--region', nargs=4, type=int, metavar=('X', 'Y', 'W', 'H'))
    parser.add_argument('--report', action='store_true', help='Print full region report')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    args = parser.parse_args()

    ref_w, ref_h, ref_ch, ref_px = try_load_with_pil(args.ref)
    gen_w, gen_h, gen_ch, gen_px = try_load_with_pil(args.gen)

    results = {}

    if args.region:
        x, y, w, h = args.region
        w = min(w, ref_w - x, gen_w - x)
        h = min(h, ref_h - y, gen_h - y)
        results['custom_region'] = compare_region(ref_px, gen_px, ref_ch, gen_ch, x, y, w, h)

    if args.report:
        for name, (x, y, w, h) in WHATSAPP_REGIONS.items():
            if x + w <= min(ref_w, gen_w) and y + h <= min(ref_h, gen_h):
                results[name] = compare_region(ref_px, gen_px, ref_ch, gen_ch, x, y, w, h)

    if not results:
        w = min(ref_w, gen_w)
        h = min(ref_h, gen_h)
        results['full_frame'] = compare_region(ref_px, gen_px, ref_ch, gen_ch, 0, 0, w, h)

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print(f"\nFRAME COMPARISON REPORT")
        print(f"Reference: {args.ref} ({ref_w}x{ref_h})")
        print(f"Generated: {args.gen} ({gen_w}x{gen_h})")
        print()

        sorted_regions = sorted(results.items(), key=lambda kv: kv[1]['mae'], reverse=True)

        for name, data in sorted_regions:
            mae = data['mae']
            severity = "PASS" if mae < 8 else ("WARN" if mae < 20 else "FAIL")
            bar = "#" * min(40, int(mae))
            print(f"  [{severity:4s}] {name:<20s} MAE={mae:6.2f}  {bar}")
            print(f"         ref={data['ref_avg_hex']}  gen={data['gen_avg_hex']}  "
                  f"max_delta={data['max_delta_euclidean']:.1f}")

        if sorted_regions:
            worst = sorted_regions[0]
            print(f"\nWorst region: {worst[0]} (MAE={worst[1]['mae']:.2f})")

    if args.output:
        try:
            from PIL import Image
            import numpy as np
            ref_img = Image.open(args.ref).convert('RGB')
            gen_img = Image.open(args.gen).convert('RGB')
            ref_arr = np.array(ref_img).astype(int)
            gen_arr = np.array(gen_img).astype(int)
            h_min = min(ref_arr.shape[0], gen_arr.shape[0])
            w_min = min(ref_arr.shape[1], gen_arr.shape[1])
            diff = np.abs(ref_arr[:h_min, :w_min] - gen_arr[:h_min, :w_min])
            diff_scaled = (diff * 3).clip(0, 255).astype('uint8')
            Image.fromarray(diff_scaled).save(args.output)
            print(f"\nDiff image saved: {args.output}")
        except ImportError:
            print("\n(PIL not available — diff image not written)")


if __name__ == '__main__':
    main()
