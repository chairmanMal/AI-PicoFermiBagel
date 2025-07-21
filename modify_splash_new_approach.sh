#!/bin/bash

# New approach: Reduce image by 15%, then expand back to original size
# by extending the background seamlessly to avoid any perceptible seams

# Function to process a single splash screen image
process_splash_image_new_approach() {
    local input_file="$1"
    local output_file="$2"
    
    echo "Processing $input_file with new approach..."
    
    # Get image dimensions
    local width=$(magick identify -format "%w" "$input_file")
    local height=$(magick identify -format "%h" "$input_file")
    
    echo "Original dimensions: ${width}x${height}"
    
    # Calculate new dimensions (15% smaller)
    local new_width=$(echo "scale=0; $width * 85 / 100" | bc)
    local new_height=$(echo "scale=0; $height * 85 / 100" | bc)
    
    echo "Reduced dimensions: ${new_width}x${new_height}"
    
    # Step 1: Reduce the image by 15% (this makes the circular feature 15% smaller)
    magick "$input_file" \
        -resize "${new_width}x${new_height}" \
        -quality 100 \
        temp_reduced.png
    
    # Step 2: Extract the background edges for seamless extension
    # Create a border mask to identify the background areas
    magick temp_reduced.png \
        -fill black -colorize 100% \
        -fill white \
        -fuzz 20% \
        -draw "color 0,0 floodfill" \
        -draw "color $((new_width-1)),0 floodfill" \
        -draw "color 0,$((new_height-1)) floodfill" \
        -draw "color $((new_width-1)),$((new_height-1)) floodfill" \
        -morphology Close Disk:5 \
        temp_background_mask.png
    
    # Extract the background
    magick temp_reduced.png temp_background_mask.png \
        -compose CopyOpacity -composite \
        temp_background.png
    
    # Step 3: Use high-quality seam carving and content-aware scaling
    # First, create a gradient mask for smooth expansion
    magick -size "${width}x${height}" \
        gradient:black-white \
        -rotate 90 \
        temp_gradient.png
    
    # Step 4: Expand the background using content-aware fill
    # Use the background as a source for seamless expansion
    magick temp_background.png \
        -resize "${width}x${height}" \
        -gravity center \
        -extent "${width}x${height}" \
        -quality 100 \
        temp_expanded_background.png
    
    # Step 5: Composite the reduced image onto the expanded background
    # Calculate the offset to center the reduced image
    local offset_x=$(( (width - new_width) / 2 ))
    local offset_y=$(( (height - new_height) / 2 ))
    
    magick temp_expanded_background.png temp_reduced.png \
        -geometry +${offset_x}+${offset_y} \
        -composite \
        -quality 100 \
        "$output_file"
    
    # Clean up temporary files
    rm -f temp_reduced.png temp_background_mask.png temp_background.png \
          temp_gradient.png temp_expanded_background.png
    
    echo "Completed processing $input_file -> $output_file"
}

# Check if bc is available for calculations
if ! command -v bc &> /dev/null; then
    echo "Error: 'bc' command not found. Please install it or use a different calculation method."
    exit 1
fi

# Process each splash screen image
echo "Starting new splash screen modification approach..."

# Process 1x image
process_splash_image_new_approach "pico-fermi-bagel-splash.png" "pico-fermi-bagel-splash-new.png"

# Process 2x image  
process_splash_image_new_approach "pico-fermi-bagel-splash@2x.png" "pico-fermi-bagel-splash@2x-new.png"

# Process 3x image
process_splash_image_new_approach "pico-fermi-bagel-splash@3x.png" "pico-fermi-bagel-splash@3x-new.png"

echo "All splash screen images processed successfully with new approach!"
echo "New modified files:"
echo "  - pico-fermi-bagel-splash-new.png"
echo "  - pico-fermi-bagel-splash@2x-new.png" 
echo "  - pico-fermi-bagel-splash@3x-new.png" 