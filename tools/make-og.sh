#!/bin/sh
# Renders tools/og.html to og-image.jpg (1200x630). Needs the local server from .claude/launch.json running on port 5193.
set -e
cd "$(dirname "$0")/.."
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1200,630 --virtual-time-budget=8000 --screenshot="$(pwd -W)/og-render.png" "http://localhost:5193/tools/og.html"
python -I -c "from PIL import Image; Image.open('og-render.png').convert('RGB').crop((0,0,1200,630)).save('og-image.jpg', quality=86, optimize=True, progressive=True)"
rm og-render.png
