"""Set width/height on every <img>/<source> that points at assets/img, from the real files. Run from the project root."""
import re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
pat = re.compile(r'<(img|source)\b[^>]*?(?:src|srcset)="(assets/img/[^"]+)"[^>]*>')

def fix(tag, path):
    w, h = Image.open(ROOT / path).size
    tag = re.sub(r'\swidth="\d+"', f' width="{w}"', tag)
    tag = re.sub(r'\sheight="\d+"', f' height="{h}"', tag)
    return tag

for name in sys.argv[1:] or ["index.html"]:
    p = ROOT / name
    html = p.read_text(encoding="utf-8")
    new = pat.sub(lambda m: fix(m.group(0), m.group(2)), html)
    p.write_text(new, encoding="utf-8")
    print(name, "updated" if new != html else "unchanged")
