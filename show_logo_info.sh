#!/bin/bash

# Show information about extracted logo files

echo "🎨 Extracted Circular Logo Files Information"
echo "============================================="
echo ""

# Check both directories
for DIR in "extracted_logo" "extracted_logo_improved"; do
    if [ -d "$DIR" ]; then
        echo "📁 Directory: $DIR"
        echo "---------------------------------------------"
        
        for file in "$DIR"/*.png; do
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
    fi
done

echo "🎯 Recommendations:"
echo "   • For app icons: Use circular_logo_1024.png or circular_logo_2048.png"
echo "   • For splash screens: Use circular_logo_4096.png (ultra high res)"
echo "   • For web use: Use circular_logo_512.png"
echo "   • For general use: Use circular_logo_method3.png (original extracted size)"
echo ""
echo "💡 All files have transparent backgrounds and can be used as splash screen elements." 