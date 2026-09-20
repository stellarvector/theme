#!/bin/bash
set -euo pipefail

# This script fails if a theme export (partial or sv-* class) is missing from the gallery.
# It runs in CI to enforce "everything in the theme is on the example page".

THEME_ROOT=$(dirname "$0")/..
GALLERY_DIR="$THEME_ROOT/exampleSite/layouts"

FAILED=0

echo "Checking for missing theme exports in gallery..."

# 1. Check partials
# List every partial under layouts/partials/sv/ (recursive, .html stripped)
while read -r partial_path; do
    # Get the relative path from partials/ e.g. sv/icon.html
    rel_path=$(echo "$partial_path" | sed "s|.*layouts/partials/||")
    # Get the name used in 'partial' call e.g. sv/icon.html
    partial_name="${rel_path%.html}"
    
    # Check if partial_name is gallery-exempt
    if grep -q "gallery-exempt: $partial_name" "$partial_path"; then
        continue
    fi

    # Grep exampleSite/layouts/ for the partial name
    if ! grep -rq "partial \"$partial_name\"" "$GALLERY_DIR"; then
        echo "FAIL: Partial '$partial_name' is not used in the gallery."
        FAILED=1
    fi
done < <(find "$THEME_ROOT/layouts/partials/sv" -name "*.html")

# 2. Check sv-* classes
# List every .sv-* class defined in assets/css/main.css
while read -r class; do
    class_name="${class#.}"
    
    # Check for gallery-exempt comment in main.css on the same or previous line
    if grep -q "gallery-exempt: $class_name" "$THEME_ROOT/assets/css/main.css"; then
        continue
    fi

    # Grep exampleSite/layouts/ for the class name
    if ! grep -rq "$class_name" "$GALLERY_DIR"; then
        echo "FAIL: Class '$class_name' is not used in the gallery."
        FAILED=1
    fi
done < <(grep -o '\.sv-[a-z0-9-]*' "$THEME_ROOT/assets/css/main.css" | sort -u)

if [ $FAILED -eq 1 ]; then
    echo "Gallery check failed. Every theme export must appear in exampleSite."
    exit 1
else
    echo "Gallery check passed."
fi
