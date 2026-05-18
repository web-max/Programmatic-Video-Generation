#!/usr/bin/env python3
"""
Precision frame comparison tool for WhatsApp UI testing.
Compares reference frames against generated frames at pixel level.
"""

import sys
import json
import argparse
import numpy as np
from PIL import Image, ImageDraw
from pathlib import Path


def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_hex(r, g, b):
    return f'#{int(r):02x}{int(g):02x}{int(b):02x}'


def sample_pixel(img_array, x, y):
    """Get exact RGB at coordinate."""
    h, w = img_array.shape[:2]
    x, y = max(0, min(x, w-1)), max(0, min(y, h-1))
    r, g, b = img_array[y, x, :3]
    return {'x': x, 'y': y, 'hex': rgb_to_hex(r, g, b), 'rgb': [int(r), int(g), int(b)]}


def sample_region_avg(img_array, x, y, w, h, label=''):
    """Get average color of a rectangular region."""
    region = img_array[y:y+h, x:x+w, :3]
    avg = region.mean(axis=(0, 1))
    return {
        'label': label,
        'bounds': {'x': x, 'y': y, 'w': w, 'h': h},
        'avg_hex': rgb_to_hex(*avg),
        'avg_rgb': [float(avg[0]), float(avg[1]), float(avg[2])],
        'std_rgb': region.std(axis=(0, 1)).tolist(),
    }


def compare_regions(ref_array, gen_array, regions):
    """Compare specific named regions between two images."""
    results = []
    for label, (x, y, w, h) in regions.items():
        ref_r = ref_array[y:y+h, x:x+w, :3].astype(float)
        gen_r = gen_array[y:y+h, x:x+w, :3].astype(float)
        diff = np.abs(ref_r - gen_r)
        mae = diff.mean()
        max_diff = diff.max()
        ref_avg = ref_r.mean(axis=(0, 1))
        gen_avg = gen_r.mean(axis=(0, 1))
        results.append({
            'label': label,
            'bounds': {'x': x, 'y': y, 'w': w, 'h': h},
            'mae': round(float(mae), 2),
            'max_channel_diff': round(float(max_diff), 2),
            'ref_avg_color': rgb_to_hex(*ref_avg),
            'gen_avg_color': rgb_to_hex(*gen_avg),
            'color_delta_rgb': [round(float(gen_avg[i] - ref_avg[i]), 1) for i in range(3)],
        })
    results.sort(key=lambda r: r['mae'], reverse=True)
    return results


def generate_diff_image(ref_array, gen_array, output_path, amplify=4):
    """Generate amplified diff image highlighting differences."""
    diff = np.abs(ref_array[:, :, :3].astype(int) - gen_array[:, :, :3].astype(int))
    diff_amplified = np.clip(diff * amplify, 0, 255).astype(np.uint8)
    diff_img = Image.fromarray(diff_amplified)
    diff_img.save(output_path)
    return str(output_path)


def measure_element_bounds(img_array, target_color_hex, tolerance=20):
    """Find bounding box of pixels matching a target color."""
    tr, tg, tb = hex_to_rgb(target_color_hex)
    r, g, b = img_array[:, :, 0], img_array[:, :, 1], img_array[:, :, 2]
    mask = (
        (np.abs(r.astype(int) - tr) <= tolerance) &
        (np.abs(g.astype(int) - tg) <= tolerance) &
        (np.abs(b.astype(int) - tb) <= tolerance)
    )
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return None
    return {
        'x_min': int(xs.min()), 'x_max': int(xs.max()),
        'y_min': int(ys.min()), 'y_max': int(ys.max()),
        'width': int(xs.max() - xs.min()),
        'height': int(ys.max() - ys.min()),
        'pixel_count': int(len(xs)),
    }


def full_comparison(ref_path, gen_path, regions=None, diff_output=None):
    """Full comparison report between reference and generated images."""
    ref_img = Image.open(ref_path).convert('RGB')
    gen_img = Image.open(gen_path).convert('RGB')

    # Resize gen to match ref if needed
    if ref_img.size != gen_img.size:
        gen_img = gen_img.resize(ref_img.size, Image.LANCZOS)

    ref = np.array(ref_img)
    gen = np.array(gen_img)

    diff = np.abs(ref.astype(int) - gen.astype(int))
    overall_mae = float(diff.mean())
    overall_max = float(diff.max())

    # Find top-10 worst rows/cols
    row_mae = diff.mean(axis=(1, 2))
    col_mae = diff.mean(axis=(0, 2))
    worst_rows = np.argsort(row_mae)[-10:][::-1].tolist()
    worst_cols = np.argsort(col_mae)[-10:][::-1].tolist()

    result = {
        'ref_size': list(ref_img.size),
        'gen_size': list(gen_img.size),
        'overall_mae': round(overall_mae, 2),
        'overall_max_diff': round(overall_max, 2),
        'worst_rows_y': worst_rows,
        'worst_cols_x': worst_cols,
        'region_comparisons': [],
    }

    if regions:
        result['region_comparisons'] = compare_regions(ref, gen, regions)

    if diff_output:
        result['diff_image'] = generate_diff_image(ref, gen, diff_output)

    return result


def cmd_compare(args):
    regions = {}
    if args.regions:
        for r in args.regions:
            name, x, y, w, h = r.split(',')
            regions[name] = (int(x), int(y), int(w), int(h))

    diff_out = args.diff_output or (Path(args.gen).parent / 'diff.png')
    result = full_comparison(args.ref, args.gen, regions or None, diff_out)
    print(json.dumps(result, indent=2))


def cmd_sample(args):
    img = np.array(Image.open(args.image).convert('RGB'))
    results = []
    for coord in args.coords:
        x, y = map(int, coord.split(','))
        results.append(sample_pixel(img, x, y))
    print(json.dumps(results, indent=2))


def cmd_region(args):
    img = np.array(Image.open(args.image).convert('RGB'))
    regions = {}
    for r in args.regions:
        name, x, y, w, h = r.split(',')
        regions[name] = (int(x), int(y), int(w), int(h))
    results = []
    for label, (x, y, w, h) in regions.items():
        results.append(sample_region_avg(img, x, y, w, h, label))
    print(json.dumps(results, indent=2))


def cmd_find_color(args):
    img = np.array(Image.open(args.image).convert('RGB'))
    result = measure_element_bounds(img, args.color, args.tolerance)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Precision frame comparison tool')
    sub = parser.add_subparsers(dest='cmd')

    # compare: full image comparison
    p_compare = sub.add_parser('compare', help='Compare ref vs generated image')
    p_compare.add_argument('ref', help='Reference image path')
    p_compare.add_argument('gen', help='Generated image path')
    p_compare.add_argument('--regions', nargs='+', metavar='NAME,X,Y,W,H',
                           help='Named regions to compare (e.g. header,0,0,1080,120)')
    p_compare.add_argument('--diff-output', help='Path to save diff image')
    p_compare.set_defaults(func=cmd_compare)

    # sample: get exact pixel colors
    p_sample = sub.add_parser('sample', help='Sample pixel colors at coordinates')
    p_sample.add_argument('image', help='Image path')
    p_sample.add_argument('coords', nargs='+', metavar='X,Y', help='Pixel coordinates')
    p_sample.set_defaults(func=cmd_sample)

    # region: get average color of a region
    p_region = sub.add_parser('region', help='Get average color of named regions')
    p_region.add_argument('image', help='Image path')
    p_region.add_argument('regions', nargs='+', metavar='NAME,X,Y,W,H')
    p_region.set_defaults(func=cmd_region)

    # find-color: find bounds of a specific color in image
    p_find = sub.add_parser('find-color', help='Find bounds of a color in image')
    p_find.add_argument('image', help='Image path')
    p_find.add_argument('color', help='Target hex color (e.g. #25D366)')
    p_find.add_argument('--tolerance', type=int, default=20,
                        help='Per-channel tolerance (default 20)')
    p_find.set_defaults(func=cmd_find_color)

    args = parser.parse_args()
    if not args.cmd:
        parser.print_help()
        sys.exit(1)
    args.func(args)
