#!/bin/bash

# Advanced approach: Reduce image by 15%, then expand back to original size
# using sophisticated content-aware scaling and seamless background extension

# Function to process a single splash screen image
process_splash_image_advanced() {
    local input_file="$1"
    local output_file="$2"
    
    echo "Processing $input_file with advanced approach..."
    
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
    
    # Step 2: Create a sophisticated background extraction
    # Use edge detection to identify the main circular feature
    magick temp_reduced.png \
        -canny 0x1+10%+30% \
        -morphology Close Disk:3 \
        -fill black -colorize 100% \
        -fill white \
        -fuzz 15% \
        -draw "color $((new_width/2)),$((new_height/2)) floodfill" \
        -morphology Open Disk:2 \
        temp_feature_mask.png
    
    # Step 3: Extract the background using the inverse of the feature mask
    magick temp_feature_mask.png \
        -negate \
        temp_background_mask.png
    
    magick temp_reduced.png temp_background_mask.png \
        -compose CopyOpacity -composite \
        temp_background.png
    
    # Step 4: Create seamless background extension using advanced techniques
    # Use the background as a tile pattern for seamless extension
    magick temp_background.png \
        -resize "${width}x${height}" \
        -gravity center \
        -extent "${width}x${height}" \
        -quality 100 \
        temp_expanded_background.png
    
    # Step 5: Apply subtle blur and noise reduction to the expanded background
    # to ensure seamless integration
    magick temp_expanded_background.png \
        -gaussian-blur 0x0.5 \
        -unsharp 0x1+0.5+0.05 \
        temp_smooth_background.png
    
    # Step 6: Composite the reduced image onto the expanded background
    # Calculate the offset to center the reduced image
    local offset_x=$(( (width - new_width) / 2 ))
    local offset_y=$(( (height - new_height) / 2 ))
    
    # Use high-quality compositing with proper blending
    magick temp_smooth_background.png temp_reduced.png \
        -geometry +${offset_x}+${offset_y} \
        -compose Over \
        -composite \
        -quality 100 \
        "$output_file"
    
    # Clean up temporary files
    rm -f temp_reduced.png temp_feature_mask.png temp_background_mask.png \
          temp_background.png temp_expanded_background.png temp_smooth_background.png
    
    echo "Completed processing $input_file -> $output_file"
}

# Check if bc is available for calculations
if ! command -v bc &> /dev/null; then
    echo "Error: 'bc' command not found. Please install it or use a different calculation method."
    exit 1
fi

# Process each splash screen image
echo "Starting advanced splash screen modification approach..."

# Process 1x image
process_splash_image_advanced "pico-fermi-bagel-splash.png" "pico-fermi-bagel-splash-advanced.png"

# Process 2x image  
process_splash_image_advanced "pico-fermi-bagel-splash@2x.png" "pico-fermi-bagel-splash@2x-advanced.png"

# Process 3x image
process_splash_image_advanced "pico-fermi-bagel-splash@3x.png" "pico-fermi-bagel-splash@3x-advanced.png"

echo "All splash screen images processed successfully with advanced approach!"
echo "Advanced modified files:"
echo "  - pico-fermi-bagel-splash-advanced.png"
echo "  - pico-fermi-bagel-splash@2x-advanced.png" 
echo "  - pico-fermi-bagel-splash@3x-advanced.png" 