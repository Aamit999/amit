#!/usr/bin/env python3
"""Generate all PWA icon sizes from SVG/canvas data"""

import os
import struct
import zlib
import math

def create_png(size):
    """Create a gold star icon PNG at the given size"""
    # Create RGBA pixel data
    pixels = []
    cx, cy = size / 2, size / 2
    r = size * 0.45
    
    for y in range(size):
        for x in range(size):
            dx, dy = x - cx, y - cy
            dist = math.sqrt(dx*dx + dy*dy)
            
            # Background: warm cream #f0ede8 -> rgba(240,237,232)
            bg = (240, 237, 232, 255)
            
            # Gold star shape
            # Check if point is inside star
            angle = math.atan2(dy, dx) - math.pi/2
            # 6-pointed star (hexagram) or 4-pointed star
            # Using a rounded diamond/star shape
            
            # Normalize angle to 0..2pi
            norm_angle = angle % (2 * math.pi)
            # 4-point star: radius varies between r_inner and r_outer
            r_outer = r
            r_inner = r * 0.38
            # 4 points
            star_r = r_inner + (r_outer - r_inner) * abs(math.cos(2 * norm_angle))
            
            in_star = dist <= star_r
            
            # Rounded corners for background
            corner_r = size * 0.22
            in_bg = True
            if x < corner_r and y < corner_r:
                in_bg = math.sqrt((x - corner_r)**2 + (y - corner_r)**2) <= corner_r
            elif x > size - corner_r and y < corner_r:
                in_bg = math.sqrt((x - (size - corner_r))**2 + (y - corner_r)**2) <= corner_r
            elif x < corner_r and y > size - corner_r:
                in_bg = math.sqrt((x - corner_r)**2 + (y - (size - corner_r))**2) <= corner_r
            elif x > size - corner_r and y > size - corner_r:
                in_bg = math.sqrt((x - (size - corner_r))**2 + (y - (size - corner_r))**2) <= corner_r
            
            if not in_bg:
                pixels.extend([0, 0, 0, 0])
            elif in_star:
                # Gold gradient: #a07828 to #d4a843
                t = 1 - (dist / r_outer)
                gold_r = int(160 + t * 52)
                gold_g = int(120 + t * 48)
                gold_b = int(40 + t * 10)
                pixels.extend([gold_r, gold_g, gold_b, 255])
            else:
                pixels.extend(list(bg))
    
    return pixels_to_png(pixels, size)

def pixels_to_png(pixels, size):
    """Convert raw RGBA pixel array to PNG bytes"""
    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    # Using RGB (color type 2) — wait, we have alpha, use RGBA (color type 6)
    ihdr_data = struct.pack('>II', size, size) + bytes([8, 6, 0, 0, 0])
    ihdr = make_chunk(b'IHDR', ihdr_data)
    
    # IDAT chunk — compress scanlines
    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter type: None
        for x in range(size):
            idx = (y * size + x) * 4
            raw.extend(pixels[idx:idx+4])
    
    compressed = zlib.compress(bytes(raw), 9)
    idat = make_chunk(b'IDAT', compressed)
    
    # IEND chunk
    iend = make_chunk(b'IEND', b'')
    
    return sig + ihdr + idat + iend

def make_chunk(chunk_type, data):
    chunk = chunk_type + data
    crc = zlib.crc32(chunk) & 0xffffffff
    return struct.pack('>I', len(data)) + chunk + struct.pack('>I', crc)

sizes = [72, 96, 128, 144, 152, 192, 384, 512]
os.makedirs('icons', exist_ok=True)

for sz in sizes:
    png_data = create_png(sz)
    with open(f'icons/icon-{sz}.png', 'wb') as f:
        f.write(png_data)
    print(f'Created icons/icon-{sz}.png ({len(png_data)} bytes)')

print('All icons generated!')
