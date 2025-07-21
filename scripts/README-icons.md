# App Icon Generation

This directory contains scripts for generating iOS app icons for the PicoFermiBagel app.

## Overview

The app uses a custom PFB logo featuring:
- **Circular brushed metallic disc** as the background
- **Three colorful letters**: F (purple), P (blue), and B (orange)
- **Angled positioning** with letters pointing toward the center
- **Professional metallic texture** with gradients and shading

## Icon Generation Script

### Usage

```bash
# Generate all iOS app icons from scratch (creates new design)
npm run generate-icons

# Regenerate icons from original 1024x1024 design (preserves original look)
npm run regenerate-icons

# Or run directly
node scripts/generate-app-icons.js
node scripts/regenerate-icons-from-original.js
```

### What It Does

#### Generate Icons (New Design)
1. **Backs up existing icons** to a timestamped backup directory
2. **Generates 18 different icon sizes** for iPhone, iPad, and iOS marketing
3. **Creates high-quality PNG files** using the Sharp image processing library
4. **Places icons in the correct location** for iOS builds

#### Regenerate Icons (Preserve Original)
1. **Uses original 1024x1024 icon** as the source design
2. **Resizes to all required sizes** using high-quality Lanczos resampling
3. **Preserves exact original design** across all icon sizes
4. **Ensures consistency** between all icon variants

### Generated Icon Sizes

#### iPhone Icons
- `icon-20@2x.png` (40x40) - Settings, Spotlight
- `icon-20@3x.png` (60x60) - Settings, Spotlight (3x)
- `icon-29@2x.png` (58x58) - Settings
- `icon-29@3x.png` (87x87) - Settings (3x)
- `icon-40@2x.png` (80x80) - Spotlight
- `icon-40@3x.png` (120x120) - Spotlight (3x)
- `icon-60@2x.png` (120x120) - App Store, Home Screen
- `icon-60@3x.png` (180x180) - App Store, Home Screen (3x)

#### iPad Icons
- `icon-20.png` (20x20) - Settings
- `icon-20@2x.png` (40x40) - Settings (2x)
- `icon-29.png` (29x29) - Settings
- `icon-29@2x.png` (58x58) - Settings (2x)
- `icon-40.png` (40x40) - Spotlight
- `icon-40@2x.png` (80x80) - Spotlight (2x)
- `Icon-76.png` (76x76) - App Store, Home Screen
- `Icon-76@2x.png` (152x152) - App Store, Home Screen (2x)
- `icon-83.5@2x.png` (167x167) - App Store, Home Screen (Pro)

#### iOS Marketing
- `icon-1024.png` (1024x1024) - App Store

## Technical Details

### Dependencies
- **Sharp**: High-performance image processing library
- **Node.js**: Runtime environment

### SVG Generation
The script generates SVG content programmatically with:
- **Radial gradients** for metallic disc effect
- **Linear gradients** for brushed metal texture
- **Precise positioning** of letters with rotations
- **Responsive sizing** that scales with icon dimensions

### Color Scheme
- **F (Purple)**: `#8b5cf6` - Top position
- **P (Blue)**: `#3b82f6` - Bottom-left, 15° rotation
- **B (Orange)**: `#f97316` - Bottom-right, -15° rotation
- **Metallic disc**: Gray gradients from `#e5e7eb` to `#9ca3af`

## File Locations

### Generated Icons
```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
├── icon-20.png
├── icon-20@2x.png
├── icon-20@3x.png
├── icon-29.png
├── icon-29@2x.png
├── icon-29@3x.png
├── icon-40.png
├── icon-40@2x.png
├── icon-40@3x.png
├── icon-60@2x.png
├── icon-60@3x.png
├── Icon-76.png
├── Icon-76@2x.png
├── icon-83.5@2x.png
├── icon-1024.png
└── Contents.json
```

### Backup Location
```
ios/App/App/Assets.xcassets/AppIcon.appiconset/backup_[timestamp]/
```

## Customization

To modify the icon design:

1. **Edit the SVG generation function** in `scripts/generate-app-icons.js`
2. **Adjust colors, positioning, or effects** in the `generatePFBLogoSVG()` function
3. **Run the generation script** to create new icons
4. **Test on device** to ensure proper display

## Troubleshooting

### Common Issues
- **Sharp installation**: Ensure `npm install sharp` has completed successfully
- **Permission errors**: Check write permissions for the iOS assets directory
- **Icon not updating**: Clear Xcode cache and rebuild the project

### Verification
After generation, verify:
1. All PNG files are created in the correct directory
2. File sizes are appropriate for their dimensions
3. Icons display correctly in iOS Simulator
4. App Store Connect accepts the 1024x1024 icon

## Future Enhancements

Potential improvements:
- **Animation support** for dynamic icons
- **Dark mode variants** with different color schemes
- **Alternative designs** for different app states
- **Automated testing** of icon display across devices 