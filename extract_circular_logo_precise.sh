#!/bin/bash

# Extract Circular Logo with Precise Background Removal
# This script extracts ONLY the circular logo element with no background

echo "🎨 Extracting circular logo with precise background removal..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick is not installed. Please install it first:"
    echo "   brew install imagemagick"
    exit 1
fi

# Input file (using the highest resolution version)
INPUT_FILE="ios/App/App/Assets.xcassets/Splash.imageset/pico-fermi-bagel-splash@3x.png"
OUTPUT_DIR="extracted_logo_precise"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "📁 Input file: $INPUT_FILE"
echo "📁 Output directory: $OUTPUT_DIR"

# Get image dimensions
DIMENSIONS=$(magick identify -format "%wx%h" "$INPUT_FILE")
echo "📏 Original image dimensions: $DIMENSIONS"

echo "🔄 Processing image with precise background removal..."

# Step 1: Create a circular mask that matches the logo exactly
echo "🔄 Step 1: Creating precise circular mask..."
magick "$INPUT_FILE" \
  -alpha set \
  -fuzz 15% \
  -fill transparent \
  -opaque white \
  -fuzz 10% \
  -fill transparent \
  -opaque black \
  -morphology close disk:5 \
  -morphology open disk:3 \
  -blur 0x1 \
  -threshold 50% \
  -morphology close disk:10 \
  -fill white -draw "color 0,0 floodfill" \
  -fill black -draw "color 0,0 floodfill" \
  -negate \
  -morphology close disk:15 \
  -blur 0x2 \
  -threshold 50% \
  "$OUTPUT_DIR/precise_mask.png"

# Step 2: Apply the mask to get only the circular element
echo "🔄 Step 2: Applying mask to extract circular element..."
magick "$INPUT_FILE" \
  "$OUTPUT_DIR/precise_mask.png" \
  -alpha off \
  -compose copy-opacity \
  -composite \
  -trim \
  -bordercolor transparent \
  -border 20 \
  "$OUTPUT_DIR/circular_logo_precise.png"

# Step 3: Alternative method using color-based extraction with better precision
echo "🔄 Step 3: Color-based precise extraction..."
magick "$INPUT_FILE" \
  -alpha set \
  -fuzz 20% \
  -fill transparent \
  -opaque white \
  -fuzz 15% \
  -fill transparent \
  -opaque black \
  -fuzz 10% \
  -fill transparent \
  -opaque "#f0f0f0" \
  -fuzz 10% \
  -fill transparent \
  -opaque "#e0e0e0" \
  -morphology close disk:3 \
  -morphology open disk:2 \
  -trim \
  -bordercolor transparent \
  -border 20 \
  "$OUTPUT_DIR/circular_logo_color_precise.png"

# Step 4: Create a circular crop with background removal
echo "🔄 Step 4: Circular crop with background removal..."
# Get image dimensions
WIDTH=$(magick identify -format "%w" "$INPUT_FILE")
HEIGHT=$(magick identify -format "%h" "$INPUT_FILE")
DIAMETER=$((WIDTH < HEIGHT ? WIDTH : HEIGHT))
DIAMETER=$((DIAMETER * 70 / 100))  # Use 70% of the smaller dimension for tighter crop

magick "$INPUT_FILE" \
  -alpha set \
  -gravity center \
  -crop "${DIAMETER}x${DIAMETER}+0+0" \
  -background transparent \
  -extent "${DIAMETER}x${DIAMETER}" \
  -fuzz 20% \
  -fill transparent \
  -opaque white \
  -fuzz 15% \
  -fill transparent \
  -opaque black \
  -fuzz 10% \
  -fill transparent \
  -opaque "#f0f0f0" \
  -trim \
  -bordercolor transparent \
  -border 20 \
  "$OUTPUT_DIR/circular_logo_crop_precise.png"

# Step 5: Create high-resolution versions of the best result
echo "🔄 Step 5: Creating high-resolution versions..."

# Use the color-based precise extraction as the base
BASE_FILE="$OUTPUT_DIR/circular_logo_color_precise.png"

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

magick "$BASE_FILE" \
  -resize 4096x4096 \
  -background transparent \
  -gravity center \
  -extent 4096x4096 \
  "$OUTPUT_DIR/circular_logo_4096.png"

echo "✅ Precise extraction complete!"
echo ""
echo "📁 Generated files:"
echo "   $OUTPUT_DIR/circular_logo_precise.png (Mask-based method)"
echo "   $OUTPUT_DIR/circular_logo_color_precise.png (Color-based method - recommended)"
echo "   $OUTPUT_DIR/circular_logo_crop_precise.png (Crop with background removal)"
echo "   $OUTPUT_DIR/circular_logo_512.png (512x512)"
echo "   $OUTPUT_DIR/circular_logo_1024.png (1024x1024)"
echo "   $OUTPUT_DIR/circular_logo_2048.png (2048x2048)"
echo "   $OUTPUT_DIR/circular_logo_4096.png (4096x4096)"
echo ""
echo "🎯 The circular logo has been extracted with precise background removal."
echo "   Color-based method should have the cleanest background removal." 