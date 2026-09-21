# Sprout Logo Motion Assets

## Recommended After Effects layers

1. `sprout-background-rounded-square.svg` or the 2048px PNG equivalent for the background.
2. `sprout-clover-textured-transparent-2048.png` for the original textured clover.
3. `sprout-clover-silhouette.svg` as a clean vector mask, matte, or shape-layer source.

## Complete logo variants

- `sprout-logo-faithful-2048.png`: deterministic upscale of the supplied 340px PNG. Geometry and pixels follow the source exactly; added detail is limited by the source resolution.
- `sprout-logo-ai-enhanced-2048.png`: restored high-resolution raster with clearer yarn detail. Use for large renders after confirming the small texture and stem differences are acceptable.
- `sprout-logo-flat-vector.svg`: true vector approximation with the rounded background and a simplified flat clover. Best for shape animation, not for preserving the yarn texture.

The SVG files contain actual paths and gradients. The embroidered texture remains raster because converting every fiber to paths would create an impractically heavy and unstable After Effects asset.
