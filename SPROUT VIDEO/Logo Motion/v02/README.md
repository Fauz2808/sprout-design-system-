# Sprout Leaf Bloom v02

Rendered preview: `Sprout Leaf Bloom v02.mp4`.
Editable project: `Sprout Leaf Bloom v02.aep`.

1080 × 1080, 30 fps, 4.4 seconds, silent. Four leaves and the stem are separate masked precompositions, with native editable transform keyframes. No generative video was used.

## Sequence

- Frame 0: upper-right leaf visible.
- Frame 24: lower-right leaf starts opening.
- Frame 29: lower-left leaf follows.
- Frame 34: upper-left leaf follows.
- Frame 45: stem opens.
- Frames 74–84: transition into the original uploaded PNG.
- Frame 84 onward: hold the original PNG.

Open `Sprout_Leaf_Bloom_v02`, then `Leaf bloom - open to edit timing` to adjust the leaf keyframes. Open each leaf precomposition to edit its mask. Keep the `Media` folder beside the project. The previous v01 composition remains in the project unchanged.

## Verification

The MP4 decodes successfully and contains 132 frames. Sampled frames are in `QC/Video Contact Sheet.png`. Native `QC/frame-120.png` matches the independently rendered source-only `QC/source-reference.png` with zero differing pixels. This check is before lossy H.264 encoding.

## Known limitations

The source PNG is only 340 × 340. The output resolution is 1080 × 1080, but it cannot recover missing embroidery detail. There is a slight card contour/color change during the transition into the original PNG. `polish-sprout-v02.jsx` is prepared to match the background silhouette using the original alpha, but has NOT been executed or validated because the Mac locked. The current MP4 and AEP do not include that pending refinement.

`Before v02 Backup.aep` preserves the project before this build. `build-sprout-v02.jsx` refuses to build if the v02 composition already exists. Run scripts only with the intended project open.
