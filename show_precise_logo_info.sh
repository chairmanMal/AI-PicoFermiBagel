#!/bin/bash

# Show information about precise logo extraction files

echo "🎨 Precise Circular Logo Extraction Results"
echo "==========================================="
echo ""

echo "📁 Directory: extracted_logo_precise"
echo "---------------------------------------------"

for file in extracted_logo_precise/*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        size=$(ls -lh "$file" | awk '{print $5}')
        dimensions=$(magick identify -format "%wx%h" "$file" 2>/dev/null || echo "Unknown")
        echo "   📄 $filename"
        echo "      Size: $size"
        echo "      Dimensions: $dimensions"
        echo ""
    fi
done

echo "🎯 Recommendations:"
echo "   • Best overall: circular_logo_color_precise.png (cleanest background removal)"
echo "   • For splash screens: circular_logo_4096.png (ultra high res)"
echo "   • For app icons: circular_logo_1024.png or circular_logo_2048.png"
echo "   • For web use: circular_logo_512.png"
echo ""
echo "💡 These files should have much cleaner background removal than the previous versions."
echo "   The color-based method specifically targets background colors for removal." 