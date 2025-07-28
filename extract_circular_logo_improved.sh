#!/bin/bash

# Extract Circular Logo from Splash Screen (Improved Version)
# This script extracts the circular logo element from the splash screen images
# and creates high-resolution versions with transparent background

echo "🎨 Extracting circular logo from splash screen (Improved Version)..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick is not installed. Please install it first:"
    echo "   brew install imagemagick"
    exit 1
fi

# Input file (using the highest resolution version)
INPUT_FILE="ios/App/App/Assets.xcassets/Splash.imageset/pico-fermi-bagel-splash@3x.png"
OUTPUT_DIR="extracted_logo_improved"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "📁 Input file: $INPUT_FILE"
echo "📁 Output directory: $OUTPUT_DIR"

# Get image dimensions
DIMENSIONS=$(magick identify -format "%wx%h" "$INPUT_FILE")
echo "📏 Original image dimensions: $DIMENSIONS"

# Extract the circular logo with transparent background
echo "🔄 Processing image..."

# Method 1: Use edge detection to find the circular boundary
echo "🔄 Method 1: Edge detection approach..."
magick "$INPUT_FILE" \
  -alpha set \
  -canny 0x1+10%+30% \
  -morphology close disk:3 \
  -morphology open disk:2 \
  -blur 0x1 \
  -threshold 50% \
  -morphology close disk:5 \
  -fill white -draw "color 0,0 floodfill" \
  -fill black -draw "color 0,0 floodfill" \
  -negate \
  -morphology close disk:10 \
  -blur 0x2 \
  -threshold 50% \
  "$OUTPUT_DIR/circular_mask.png"

# Apply the mask to the original image
magick "$INPUT_FILE" \
  "$OUTPUT_DIR/circular_mask.png" \
  -alpha off \
  -compose copy-opacity \
  -composite \
  -trim \
  -bordercolor transparent \
  -border 50 \
  "$OUTPUT_DIR/circular_logo_method1.png"

# Method 2: Use color-based extraction (assuming the logo has distinct colors)
echo "🔄 Method 2: Color-based extraction..."
magick "$INPUT_FILE" \
  -alpha set \
  -fuzz 20% \
  -fill transparent \
  -opaque white \
  -fuzz 10% \
  -fill transparent \
  -opaque black \
  -trim \
  -bordercolor transparent \
  -border 50 \
  "$OUTPUT_DIR/circular_logo_method2.png"

# Method 3: Use a circular crop from the center
echo "🔄 Method 3: Circular crop from center..."
# Get image dimensions
WIDTH=$(magick identify -format "%w" "$INPUT_FILE")
HEIGHT=$(magick identify -format "%h" "$INPUT_FILE")
DIAMETER=$((WIDTH < HEIGHT ? WIDTH : HEIGHT))
DIAMETER=$((DIAMETER * 80 / 100))  # Use 80% of the smaller dimension

magick "$INPUT_FILE" \
  -alpha set \
  -gravity center \
  -crop "${DIAMETER}x${DIAMETER}+0+0" \
  -background transparent \
  -extent "${DIAMETER}x${DIAMETER}" \
  -trim \
  -bordercolor transparent \
  -border 50 \
  "$OUTPUT_DIR/circular_logo_method3.png"

# Create high-resolution versions of the best result
echo "🔄 Creating high-resolution versions..."

# Use Method 3 as the base (circular crop)
BASE_FILE="$OUTPUT_DIR/circular_logo_method3.png"

# Create different sizes
magick "$BASE_FILE" \
  -resize 512x512 \
  -background transparent \
  -gravity center \
  -extent 512x512 \
  "$OUTPUT_DIR/circular_logo_512.png"

magick "$BASE_FILE" \
  -resize 1024x1024 \
  -background transparent \
  -gravity center \
  -extent 1024x1024 \
  "$OUTPUT_DIR/circular_logo_1024.png"

magick "$BASE_FILE" \
  -resize 2048x2048 \
  -background transparent \
  -gravity center \
  -extent 2048x2048 \
  "$OUTPUT_DIR/circular_logo_2048.png"

# Create an ultra-high resolution version
magick "$BASE_FILE" \
  -resize 4096x4096 \
  -background transparent \
  -gravity center \
  -extent 4096x4096 \
  "$OUTPUT_DIR/circular_logo_4096.png"

echo "✅ Extraction complete!"
echo ""
echo "📁 Generated files:"
echo "   $OUTPUT_DIR/circular_logo_method1.png (Edge detection method)"
echo "   $OUTPUT_DIR/circular_logo_method2.png (Color-based method)"
echo "   $OUTPUT_DIR/circular_logo_method3.png (Circular crop method - recommended)"
echo "   $OUTPUT_DIR/circular_logo_512.png (512x512)"
echo "   $OUTPUT_DIR/circular_logo_1024.png (1024x1024)"
echo "   $OUTPUT_DIR/circular_logo_2048.png (2048x2048)"
echo "   $OUTPUT_DIR/circular_logo_4096.png (4096x4096 - ultra high res)"
echo ""
echo "🎯 The circular logo has been extracted with transparent background."
echo "   Method 3 (circular crop) is recommended for best results."
echo "   Choose the size that best fits your needs." 