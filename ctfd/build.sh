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

# Copy templates and configs from script directory
cp -r "$SCRIPT_DIR/templates" "$TEMP_BUILD/"
cp "$SCRIPT_DIR/theme.json" "$TEMP_BUILD/"
cp "$SCRIPT_DIR/package.json" "$TEMP_BUILD/"

# Copy static assets (resolving symlinks)
mkdir -p "$TEMP_BUILD/static"
cp -rL "$SCRIPT_DIR/static/"* "$TEMP_BUILD/static/"

# 3. Install dependencies and Run Build in temp dir
cd "$TEMP_BUILD"
npm install --silent
npm run build

# 4. Copy final assets to destination
echo "📦 Finalizing theme at $FINAL_DIR"
mkdir -p "$FINAL_DIR"
cp -r templates "$FINAL_DIR/"
cp theme.json "$FINAL_DIR/"
mkdir -p "$FINAL_DIR/static"

# Copy fonts, img, icons as is
if [ -d "static/fonts" ]; then cp -r static/fonts "$FINAL_DIR/static/"; fi
if [ -d "static/img" ]; then cp -r static/img "$FINAL_DIR/static/"; fi
if [ -d "static/icons" ]; then cp -r static/icons "$FINAL_DIR/static/"; fi

# Copy ONLY minified css and js
mkdir -p "$FINAL_DIR/static/css"
mkdir -p "$FINAL_DIR/static/js"
if ls static/css/*.min.css >/dev/null 2>&1; then cp static/css/*.min.css "$FINAL_DIR/static/css/"; fi
if ls static/js/*.min.js >/dev/null 2>&1; then cp static/js/*.min.js "$FINAL_DIR/static/js/"; fi

# 5. Cleanup
rm -rf "$TEMP_BUILD"

echo "✅ Theme build complete! Located at: $FINAL_DIR"
