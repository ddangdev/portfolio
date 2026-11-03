"""film_kope.py - Film the kope sample feed (a fictional café) for its preview on the wheel (work > kope).

The profile in a phone (Projects/ddanghnl/src/brand/instagram/sample-cafe/film.html) scrolls slowly down through the nine-post
grid, rests, and eases back up, so the film loops on itself. Shot frame by frame - each frame is
film.html at ?y=N, screenshotted - then joined at 30 fps into public/work/kope.mp4; the first
frame is the poster, public/work/kope.jpg.

Usage:  python scripts/film_kope.py            (from Projects/ddanghnl-site)
Needs:  playwright (python), and the ffmpeg that Scripts/video's venv carries.
"""
import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
SITE = HERE.parent
AI = SITE.parent.parent
PAGE = (AI / "Projects/ddanghnl/src/brand/instagram/sample-cafe/film.html").as_uri()
FFMPEG = AI / "Scripts/video/.venv/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe"
OUT_MP4 = SITE / "public/work/kope.mp4"
OUT_JPG = SITE / "public/work/kope.jpg"

FPS = 30
DOWN, HOLD, UP, REST = 8.0, 1.2, 7.0, 1.4   # seconds: down the feed, rest, back up, rest at the top
W, H = 1600, 1000


def ease(t):   # smooth both ends
    return 0.5 - 0.5 * math.cos(math.pi * t)


def y_at(sec, reach):
    if sec < DOWN:
        return reach * ease(sec / DOWN)
    if sec < DOWN + HOLD:
        return reach
    if sec < DOWN + HOLD + UP:
        return reach * (1 - ease((sec - DOWN - HOLD) / UP))
    return 0


def main():
    if not FFMPEG.exists():
        raise SystemExit(f"no ffmpeg at {FFMPEG}")
    total = DOWN + HOLD + UP + REST
    frames = int(total * FPS)
    tmp = Path(tempfile.mkdtemp(prefix="kope-film-"))
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            pg = b.new_page(viewport={"width": W, "height": H})
            pg.goto(PAGE, wait_until="networkidle")
            # how far the feed can scroll inside the screen
            reach = pg.evaluate("document.getElementById('feed').offsetHeight - (document.querySelector('.screen').clientHeight - 44)")
            print(f"feed scrolls {reach}px; {frames} frames at {FPS} fps")
            for i in range(frames):
                y = round(y_at(i / FPS, reach), 1)
                pg.evaluate("y => { document.getElementById('feed').style.marginTop = (44 - y) + 'px'; }", y)
                pg.screenshot(path=str(tmp / f"f{i:04d}.png"))
                if i % 60 == 0:
                    print(f"  {i}/{frames}", flush=True)
            b.close()
        subprocess.run([str(FFMPEG), "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(tmp / "f%04d.png"),
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "slow", "-movflags", "+faststart",
                        str(OUT_MP4)], check=True)
        subprocess.run([str(FFMPEG), "-y", "-loglevel", "error", "-i", str(tmp / "f0000.png"), "-q:v", "3", str(OUT_JPG)], check=True)
        print("wrote", OUT_MP4, OUT_MP4.stat().st_size // 1024, "KB;", OUT_JPG)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
