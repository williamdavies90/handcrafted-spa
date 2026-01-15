# Ballerina Product Images

All images have been optimized for web use.

## Processing Details

- **Format**: WebP (85% quality)
- **Max Width**: 1900px (maintains aspect ratio)
- **File Size Reduction**: ~95-96% smaller than original PNGs

## Directory Structure

```
products/ballerina/
├── chrome-plated/     (84 images)
├── polished-brass/   (84 images)
└── polished-nickel/  (84 images)
```

## Image Naming Convention

Images are named using the format:
`{width}x{height}x{depth}-{joint-type}-{fuel-type}-{finish}.webp`

Example: `675x825x135-og-dl-chrome-plated.webp`

### Dimensions
- Width × Height × Depth (in mm)

### Joint Types
- `lg` - LG joint
- `og` - OG joint  
- `pj` - PJ joint

### Fuel Types
- `dl` - Dual Fuel
- `eo` - Electric Only
- `he` - HE (High Efficiency)
- `ho` - HO (High Output)

### Finishes
- `chrome-plated`
- `polished-brass`
- `polished-nickel`

## Usage

To reprocess images (if source images change):

```bash
npm run process-ballerina
```

## Total Images

- **Total Processed**: 252 images
- **Average File Size**: ~50KB per image (down from ~1.2MB)
- **Total Space Saved**: ~290MB


