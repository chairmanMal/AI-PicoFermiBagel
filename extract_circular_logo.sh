#!/bin/bash

# Extract Circular Logo from Splash Screen
# This script extracts the circular logo element from the splash screen images
# and creates a high-resolution version with transparent background

echo "🎨 Extracting circular logo from splash screen..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed. Please install it first:"
    echo "   brew install imagemagick"
    exit 1
fi

# Input file (using the highest resolution version)
INPUT_FILE="ios/App/App/Assets.xcassets/Splash.imageset/pico-fermi-bagel-splash@3x.png"
OUTPUT_DIR="extracted_logo"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "📁 Input file: $INPUT_FILE"
echo "📁 Output directory: $OUTPUT_DIR"

# Extract the circular logo with transparent background
# We'll use a circular mask to extract just the logo area
echo "🔄 Processing image..."

# Step 1: Create a circular mask
convert "$INPUT_FILE" \
  -alpha set \
  \( +clone -distort DePolar 0 -virtual-pixel HorizontalTile -background None -distort Polar 0 \) \
  -compose Dst_In -composite \
  -trim \
  -bordercolor transparent -border 20 \
  "$OUTPUT_DIR/circular_logo_transparent.png"

# Step 2: Create a higher resolution version (2x the original)
echo "🔄 Creating high-resolution version..."
convert "$OUTPUT_DIR/circular_logo_transparent.png" \
  -resize 200% \
  "$OUTPUT_DIR/circular_logo_high_res.png"

# Step 3: Create different sizes for various use cases
echo "🔄 Creating multiple sizes..."

# Small version (512x512)
convert "$OUTPUT_DIR/circular_logo_transparent.png" \
  -resize 512x512 \
  -background transparent \
  -gravity center \
  -extent 512x512 \
  "$OUTPUT_DIR/circular_logo_512.png"

# Medium version (1024x1024)
convert "$OUTPUT_DIR/circular_logo_transparent.png" \
  -resize 1024x1024 \
  -background transparent \
  -gravity center \
  -extent 1024x1024 \
  "$OUTPUT_DIR/circular_logo_1024.png"

# Large version (2048x2048)
convert "$OUTPUT_DIR/circular_logo_transparent.png" \
  -resize 2048x2048 \
  -background transparent \
  -gravity center \
  -extent 2048x2048 \
  "$OUTPUT_DIR/circular_logo_2048.png"

echo "✅ Extraction complete!"
echo ""
echo "📁 Generated files:"
echo "   $OUTPUT_DIR/circular_logo_transparent.png (original size)"
echo "   $OUTPUT_DIR/circular_logo_high_res.png (2x resolution)"
echo "   $OUTPUT_DIR/circular_logo_512.png (512x512)"
echo "   $OUTPUT_DIR/circular_logo_1024.png (1024x1024)"
echo "   $OUTPUT_DIR/circular_logo_2048.png (2048x2048)"
echo ""
echo "🎯 The circular logo has been extracted with transparent background."
echo "   You can use any of these files as a splash screen element." 