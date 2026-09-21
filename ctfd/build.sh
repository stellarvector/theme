#!/bin/bash
set -e

# Get the absolute path of the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Usage: ./build.sh [output_dir]
# Default output_dir is current directory
OUT_DIR=$(realpath "${1:-"."}")
FINAL_DIR="$OUT_DIR/sv"

echo "🚀 Building Stellar Vector CTFd theme..."

# 1. Clean and Create final directory
rm -rf "$FINAL_DIR"
mkdir -p "$FINAL_DIR"

# 2. Copy source files to a temporary build directory to resolve symlinks
TEMP_BUILD=$(mktemp -d)
echo "📁 Preparing temporary build at $TEMP_BUILD"

# Copy templates and configs from script directory (resolving any symlinks)
cp -rL "$SCRIPT_DIR/templates" "$TEMP_BUILD/"
if [ -d "$SCRIPT_DIR/templatesExtra" ]; then
    cp -rL "$SCRIPT_DIR/templatesExtra" "$TEMP_BUILD/"
fi
cp -L "$SCRIPT_DIR/theme.json" "$TEMP_BUILD/"
cp -L "$SCRIPT_DIR/package.json" "$TEMP_BUILD/"
if [ -f "$SCRIPT_DIR/package-lock.json" ]; then
    cp -L "$SCRIPT_DIR/package-lock.json" "$TEMP_BUILD/"
fi

# Copy static assets (resolving symlinks)
mkdir -p "$TEMP_BUILD/static"
cp -rL "$SCRIPT_DIR/static/"* "$TEMP_BUILD/static/"

# 3. Install dependencies and Run Build in temp dir
cd "$TEMP_BUILD"
echo "🛠️ Installing dependencies and compiling assets..."
npm install --silent
npm run build

# 4. Copy final assets to destination
echo "📦 Finalizing theme at $FINAL_DIR"
mkdir -p "$FINAL_DIR"
cp -r templates "$FINAL_DIR/"
if [ -d "templatesExtra" ]; then
    cp -r templatesExtra "$FINAL_DIR/"
fi
cp theme.json "$FINAL_DIR/"
mkdir -p "$FINAL_DIR/static"

# Copy fonts, img, icons as is (they were already resolved in temp dir)
for dir in fonts img icons; do
    if [ -d "static/$dir" ]; then
        cp -r "static/$dir" "$FINAL_DIR/static/"
    fi
done

# Copy ONLY minified css and js to keep theme lean
mkdir -p "$FINAL_DIR/static/css"
mkdir -p "$FINAL_DIR/static/js"
find static/css -name "*.min.css" -exec cp {} "$FINAL_DIR/static/css/" \;
find static/js -name "*.min.js" -exec cp {} "$FINAL_DIR/static/js/" \;

# 5. Cleanup
rm -rf "$TEMP_BUILD"

echo "✨ Theme build complete! Located at: $FINAL_DIR"
