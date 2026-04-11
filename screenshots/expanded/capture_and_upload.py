"""
Capture screenshots of design inspiration sites and upload to Miro board.
Sites chosen for: pastels, rounded UI, flat cartoon illustrations, smooth animations.
"""

import sys
import io
import os
import json
import time
import requests
from pathlib import Path
from playwright.sync_api import sync_playwright

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

MIRO_TOKEN = os.environ.get("MIRO_TOKEN", "")
BOARD_ID = "uXjVGmnqyQY="
SCREENSHOT_DIR = Path(__file__).parent
MIRO_BASE = "https://api.miro.com/v2"

SITES = [
    ("stripe.com", "https://stripe.com", "Stripe - Pastel gradients, smooth animations"),
    ("linear.app", "https://linear.app", "Linear - Modern UI, rounded, clean"),
    ("notion.so", "https://www.notion.so", "Notion - Pastel accents, illustrations"),
    ("dribbble-pastel", "https://dribbble.com/search/pastel-portfolio", "Dribbble - Pastel portfolio examples"),
    ("figma.com", "https://www.figma.com", "Figma - Rounded UI, pastel accents"),
    ("lottiefiles.com", "https://lottiefiles.com", "LottieFiles - Animation, colorful, illustrated"),
]

# Positions: Row 4 (y=1800) and Row 5 (y=2200), x at 500, 1200, 1900
POSITIONS = [
    (500, 1800),
    (1200, 1800),
    (1900, 1800),
    (500, 2200),
    (1200, 2200),
    (1900, 2200),
]


def capture_screenshots():
    """Take screenshots of all sites using Playwright."""
    screenshots = []
    print("=== PHASE 1: Capturing screenshots ===")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1,
        )
        page = context.new_page()

        for slug, url, title in SITES:
            filename = f"{slug}.png"
            filepath = SCREENSHOT_DIR / filename
            print(f"  Capturing {url} ... ", end="", flush=True)
            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
                # Extra wait for animations/lazy content
                page.wait_for_timeout(2000)
                page.screenshot(path=str(filepath), full_page=False)
                print(f"OK -> {filename}")
                screenshots.append((filepath, title))
            except Exception as e:
                print(f"FAILED ({e})")
                continue

        browser.close()

    print(f"  Captured {len(screenshots)}/{len(SITES)} screenshots\n")
    return screenshots


def find_references_frame():
    """Find the References & Inspiration frame on the board."""
    print("=== Finding References frame ===")
    headers = {"Authorization": f"Bearer {MIRO_TOKEN}"}

    # Paginate through items to find the frame
    cursor = None
    while True:
        params = {"type": "frame", "limit": 50}
        if cursor:
            params["cursor"] = cursor
        resp = requests.get(f"{MIRO_BASE}/boards/{BOARD_ID}/items", headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()

        for item in data.get("data", []):
            title = (item.get("data", {}).get("title", "") or "").lower()
            if "reference" in title or "inspiration" in title:
                frame_id = item["id"]
                print(f"  Found frame: '{item['data']['title']}' (ID: {frame_id})")
                return frame_id, item

        cursor = data.get("cursor")
        if not cursor:
            break

    print("  WARNING: References frame not found, uploading without frame context")
    return None, None


def upload_to_miro(screenshots):
    """Upload screenshots to Miro board."""
    print("=== PHASE 2: Uploading to Miro ===")
    headers = {"Authorization": f"Bearer {MIRO_TOKEN}"}
    uploaded = []

    for i, (filepath, title) in enumerate(screenshots):
        x, y = POSITIONS[i] if i < len(POSITIONS) else (500 + (i % 3) * 700, 2600)
        print(f"  Uploading {filepath.name} at ({x}, {y}) ... ", end="", flush=True)

        try:
            with open(filepath, "rb") as f:
                files = {
                    "resource": (filepath.name, f, "image/png"),
                    "data": (None, json.dumps({
                        "title": title,
                        "position": {"x": x, "y": y, "origin": "center"},
                    }), "application/json"),
                }
                resp = requests.post(
                    f"{MIRO_BASE}/boards/{BOARD_ID}/images",
                    headers=headers,
                    files=files,
                )

            if resp.status_code in (200, 201):
                item_id = resp.json().get("id", "?")
                print(f"OK (item {item_id})")
                uploaded.append(item_id)
            else:
                print(f"FAILED ({resp.status_code}: {resp.text[:200]})")
        except Exception as e:
            print(f"FAILED ({e})")

        time.sleep(0.5)  # Rate limiting

    print(f"  Uploaded {len(uploaded)}/{len(screenshots)} images\n")
    return uploaded


def resize_frame(frame_id, frame_item):
    """Resize the References frame to fit new content."""
    if not frame_id:
        print("=== Skipping frame resize (no frame found) ===")
        return

    print("=== PHASE 3: Resizing References frame ===")
    headers = {
        "Authorization": f"Bearer {MIRO_TOKEN}",
        "Content-Type": "application/json",
    }

    # Get current frame geometry
    current_geo = frame_item.get("geometry", {})
    current_height = current_geo.get("height", 2000)
    new_height = max(current_height, 2800)  # Ensure enough room for rows 4-5

    print(f"  Current height: {current_height}, new height: {new_height}")

    resp = requests.patch(
        f"{MIRO_BASE}/boards/{BOARD_ID}/frames/{frame_id}",
        headers=headers,
        json={"geometry": {"height": new_height}},
    )

    if resp.status_code in (200, 201):
        print("  Frame resized OK")
    else:
        print(f"  Frame resize failed ({resp.status_code}: {resp.text[:200]})")


def main():
    if not MIRO_TOKEN:
        print("ERROR: MIRO_TOKEN not set")
        sys.exit(1)

    print(f"Miro board: {BOARD_ID}")
    print(f"Screenshots dir: {SCREENSHOT_DIR}\n")

    # Step 1: Capture
    screenshots = capture_screenshots()
    if not screenshots:
        print("No screenshots captured, exiting.")
        sys.exit(1)

    # Step 2: Find frame
    frame_id, frame_item = find_references_frame()

    # Step 3: Upload
    uploaded = upload_to_miro(screenshots)

    # Step 4: Resize frame
    resize_frame(frame_id, frame_item)

    print("=== DONE ===")
    print(f"  Screenshots: {len(screenshots)}")
    print(f"  Uploaded: {len(uploaded)}")


if __name__ == "__main__":
    main()
