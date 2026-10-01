# Prospectify mark

- `prospectify-logo-official.jpg` is the official logo exactly as supplied by the founder (1029×1029, on black).
- `prospectify-mark.png` is a transparent cut of that file, 465×469 RGBA, cropped to the mark with 12 px padding.
  - Every interior pixel keeps its original RGB value, so the gradient is untouched.
  - Only the black background was removed. Anti-aliased edge pixels were un-premultiplied over black, so the
    edges composite cleanly on any background.
  - The mark was not redrawn, re-proportioned or recoloured.
  - A higher-resolution vector or PNG master would be a drop-in replacement: same filename, same aspect ratio.
