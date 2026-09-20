#!/bin/bash
set -euo pipefail

# This script enforces D5 and D7 of the unification project.
# It runs in CI to ensure code quality and security.

THEME_ROOT=$(dirname "$0")/..
FAILED=0

echo "Linting theme..."

# 1. No inline JavaScript in templates
echo "Checking for inline JavaScript in templates..."
while read -r template; do
    # Check for onclick, onmouseover etc.
    # We exclude 'content=' which is used in meta tags and 'action=' which is used in forms.
    if grep -Ei "\bon[a-z]+=" "$template" | grep -vEi "gallery-exempt: inline-js|content=|action=" > /dev/null; then
        # Double check to see if it's really an event handler
        if grep -Ei "\b(onclick|onfocus|onblur|onload|onmouseover|onsubmit|onkeydown|onkeypress|onkeyup)=" "$template" | grep -v "gallery-exempt: inline-js" > /dev/null; then
            echo "FAIL: Inline event handler found in $template"
            grep -Ei "\b(onclick|onfocus|onblur|onload|onmouseover|onsubmit|onkeydown|onkeypress|onkeyup)=" "$template"
            FAILED=1
        fi
    fi

    if grep -q "| safeJS" "$template"; then
        echo "FAIL: '| safeJS' found in $template"
        FAILED=1
    fi

    if grep -q "javascript:" "$template"; then
        echo "FAIL: 'javascript:' URL found in $template"
        FAILED=1
    fi

    if grep -Pz "(?s)<script(?![^>]*type=[\"']application/ld\+json[\"'])[^>]*>.*?</script>" "$template" | grep -v "src=" | tr -d '\0' | grep -v "gallery-exempt: inline-js" > /dev/null; then
         if ! grep -q "src=" "$template" && grep -q "<script" "$template" && ! grep -q "application/ld+json" "$template"; then
            echo "FAIL: Potential inline <script> tag found in $template"
            FAILED=1
         fi
    fi
done < <(find "$THEME_ROOT/layouts" -name "*.html")

# 2. No string-to-DOM sinks in JS
echo "Checking for string-to-DOM sinks in JS..."
if [ -d "$THEME_ROOT/assets/js" ]; then
    while read -r js_file; do
        if grep -Eq "innerHTML|insertAdjacentHTML|outerHTML|document\.write|eval\(|new Function\(" "$js_file"; then
            echo "FAIL: Forbidden DOM sink or eval found in $js_file"
            grep -En "innerHTML|insertAdjacentHTML|outerHTML|document\.write|eval\(|new Function\(" "$js_file"
            FAILED=1
        fi
    done < <(find "$THEME_ROOT/assets/js" -name "*.js")
fi

# 3. No non-SVG icons
echo "Checking for non-SVG icons..."
if [ -d "$THEME_ROOT/assets/icons" ]; then
    while read -r icon; do
        echo "FAIL: Non-SVG icon found: $icon"
        FAILED=1
    done < <(find "$THEME_ROOT/assets/icons" -type f ! -name "*.svg")
fi

# 4. No raw hex colours outside allowed CSS files
echo "Checking for raw hex colours outside allowed CSS files..."
while read -r file; do
    if grep -qI . "$file"; then
        if grep -Eq "#([0-9a-fA-F]{3}){1,2}\b|#([0-9a-fA-F]{4}){1,2}\b" "$file"; then
            if [[ "$file" == *"hugo.yml" ]] || [[ "$file" == *".md" ]]; then continue; fi
            
            if grep -Eq "#([0-9a-fA-F]{3}){1,2}\b" "$file"; then
                echo "FAIL: Raw hex colour found in $file"
                grep -Eno "#([0-9a-fA-F]{3}){1,2}\b" "$file"
                FAILED=1
            fi
        fi
    fi
done < <(find "$THEME_ROOT" -type f \
    ! -path "$THEME_ROOT/assets/css/main.css" \
    ! -path "$THEME_ROOT/assets/css/chroma.css" \
    ! -path "*/node_modules/*" \
    ! -path "*/public/*" \
    ! -path "*/resources/*" \
    ! -path "*/.hugo_build.lock" \
    ! -path "$THEME_ROOT/static/assets/logo/favicon.ico" \
    ! -path "*/.git/*")

# 5. Warn on unused partials
echo "Checking for unused partials (warning only)..."
while read -r partial_path; do
    rel_path=$(echo "$partial_path" | sed "s|.*layouts/partials/||")
    partial_name="${rel_path%.html}"
    
    if ! grep -r "partial \"$partial_name\"" "$THEME_ROOT/layouts" "$THEME_ROOT/exampleSite/layouts" | grep -v "$partial_path" > /dev/null; then
        echo "WARN: Partial '$partial_name' seems unused."
    fi
done < <(find "$THEME_ROOT/layouts/partials/sv" -name "*.html")

if [ $FAILED -eq 1 ]; then
    echo "Lint failed."
    exit 1
else
    echo "Lint passed."
fi
