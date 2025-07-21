#!/bin/bash

# Conservative approach: Preserve all original colors and details
# Only reduce the central circular feature by 15% and extend background naturally

# Function to process a single splash screen image
process_splash_image_conservative() {
    local input_file="$1"
    local output_file="$2"
    
    echo "Processing $input_file with conservative approach..."
    
    # Get image dimensions
    local width=$(magick identify -format "%w" "$input_file")
    local height=$(magick identify -format "%h" "$input_file")
    
    echo "Original dimensions: ${width}x${height}"
    
    # Estimate the circular feature radius (conservative estimate)
    local estimated_radius=$(echo "scale=0; $height / 3" | bc)
    local new_radius=$(echo "scale=0; $estimated_radius * 85 / 100" | bc)
    
    echo "Estimated original radius: $estimated_radius"
    echo "New radius (15% smaller): $new_radius"
    
    # Calculate center point
    local center_x=$((width / 2))
    local center_y=$((height / 2))
    
    # Step 1: Create a mask for the original circular feature
    magick -size "${width}x${height}" xc:black \
        -fill white \
        -draw "circle ${center_x},${center_y} ${center_x},$((center_y + estimated_radius))" \
        temp_original_mask.png
    
    # Step 2: Create a mask for the new smaller circular feature
    magick -size "${width}x${height}" xc:black \
        -fill white \
        -draw "circle ${center_x},${center_y} ${center_x},$((center_y + new_radius))" \
        temp_new_mask.png
    
    # Step 3: Extract the background (everything outside the original circle)
    magick temp_original_mask.png -negate temp_background_mask.png
    
    magick "$input_file" temp_background_mask.png \
        -compose CopyOpacity -composite \
        temp_background.png
    
    # Step 4: Extract the original circular content
    magick "$input_file" temp_original_mask.png \
        -compose CopyOpacity -composite \
        temp_circular_content.png
    
    # Step 5: Scale down the circular content to the new size
    # Calculate the scaling factor
    local scale_factor=$(echo "scale=3; $new_radius / $estimated_radius" | bc)
    local scaled_width=$(echo "scale=0; $width * $scale_factor" | bc)
    local scaled_height=$(echo "scale=0; $height * $scale_factor" | bc)
    
    echo "Scaling circular content by factor: $scale_factor"
    echo "Scaled dimensions: ${scaled_width}x${scaled_height}"
    
    magick temp_circular_content.png \
        -resize "${scaled_width}x${scaled_height}" \
        -quality 100 \
        temp_scaled_content.png
    
    # Step 6: Create the final image by compositing
    # Start with the background
    magick temp_background.png \
        -quality 100 \
        temp_final.png
    
    # Calculate the offset to center the scaled content
    local offset_x=$(( (width - scaled_width) / 2 ))
    local offset_y=$(( (height - scaled_height) / 2 ))
    
    # Composite the scaled content onto the background
    magick temp_final.png temp_scaled_content.png \
        -geometry +${offset_x}+${offset_y} \
        -compose Over \
        -composite \
        -quality 100 \
        "$output_file"
    
    # Clean up temporary files
    rm -f temp_original_mask.png temp_new_mask.png temp_background_mask.png \
          temp_background.png temp_circular_content.png temp_scaled_content.png temp_final.png
    
    echo "Completed processing $input_file -> $output_file"
}

# Check if bc is available for calculations
if ! command -v bc &> /dev/null; then
    echo "Error: 'bc' command not found. Please install it or use a different calculation method."
    exit 1
fi

# Process each splash screen image
echo "Starting conservative splash screen modification approach..."

# Process 1x image
process_splash_image_conservative "pico-fermi-bagel-splash.png" "pico-fermi-bagel-splash-conservative.png"

# Process 2x image  
process_splash_image_conservative "pico-fermi-bagel-splash@2x.png" "pico-fermi-bagel-splash@2x-conservative.png"

# Process 3x image
process_splash_image_conservative "pico-fermi-bagel-splash@3x.png" "pico-fermi-bagel-splash@3x-conservative.png"

echo "All splash screen images processed successfully with conservative approach!"
echo "Conservative modified files:"
echo "  - pico-fermi-bagel-splash-conservative.png"
echo "  - pico-fermi-bagel-splash@2x-conservative.png" 
echo "  - pico-fermi-bagel-splash@3x-conservative.png" 