"""ddanghnl-site: copy the projects that run live inside their pop-up into public/embed/.

Each is a snapshot of that project as it stands: re-run this after changing one, then rebuild the site.
  - aina-moana:        static files as they are (index.html, src/, data/, assets/)
  - my-personal-shelf: built first (npm run build), then its dist/ copied
  - say-when:          static files as they are (index.html, src/), from Projects/hanging-book

usage:  python scripts/embed_projects.py        (from Projects/ddanghnl-site)
needs:  Node/npm for the shelf's build; nothing else.
"""
import shutil
import subprocess
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
PROJECTS = SITE.parent
EMBED = SITE / "public" / "embed"


def replace(dest: Path, copy) -> None:
    """Copy into a fresh temporary folder, then swap it in, so a failed copy never leaves half a project."""
    tmp = dest.with_name(dest.name + ".tmp")
    if tmp.exists():
        shutil.rmtree(tmp)
    copy(tmp)
    if dest.exists():
        shutil.rmtree(dest)
    tmp.rename(dest)
    print("embedded", dest.relative_to(SITE))


def aina(tmp: Path) -> None:
    src = PROJECTS / "aina-moana"
    tmp.mkdir(parents=True)
    shutil.copy2(src / "index.html", tmp / "index.html")
    for part in ("src", "data", "assets"):
        shutil.copytree(src / part, tmp / part)


def shelf(tmp: Path) -> None:
    src = PROJECTS / "my-personal-shelf"
    npm = "npm.cmd" if sys.platform == "win32" else "npm"
    subprocess.run([npm, "run", "build"], cwd=src, check=True, timeout=300)
    shutil.copytree(src / "dist", tmp)


def say_when(tmp: Path) -> None:
    src = PROJECTS / "hanging-book"   # the project's folder keeps its first name; the piece is Say When
    tmp.mkdir(parents=True)
    shutil.copy2(src / "index.html", tmp / "index.html")
    shutil.copytree(src / "src", tmp / "src")


if __name__ == "__main__":
    EMBED.mkdir(parents=True, exist_ok=True)
    replace(EMBED / "aina-moana", aina)
    replace(EMBED / "my-personal-shelf", shelf)
    replace(EMBED / "say-when", say_when)
