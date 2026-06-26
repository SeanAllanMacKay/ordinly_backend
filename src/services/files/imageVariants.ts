import sharp from "sharp";

import { IMAGE_VARIANT_WEBP_QUALITY } from "./constants.js";

export type ImageVariantFit = "cover" | "inside";

export type BuildImageVariantsArgs = {
  buffer: Buffer;
  sizes: readonly number[];
  // "cover" -> square crop (avatars); "inside" -> width-bounded, aspect kept (logos)
  fit: ImageVariantFit;
};

export type ImageVariant = {
  size: number;
  buffer: Buffer;
};

/**
 * Resizes a source image buffer into one WebP variant per requested size.
 *
 * Avatars use fit="cover" (centre square crop). Logos use fit="inside" so the
 * brand mark's aspect ratio is preserved and only the bounding box is capped.
 * Variants are never upscaled past the source.
 *
 * @returns one { size, buffer } per requested size
 */
export const buildImageVariants = async ({
  buffer,
  sizes,
  fit,
}: BuildImageVariantsArgs): Promise<ImageVariant[]> => {
  return Promise.all(
    sizes.map(async (size) => ({
      size,
      buffer: await sharp(buffer)
        // Honour EXIF orientation before stripping metadata on encode.
        .rotate()
        .resize(size, fit === "cover" ? size : undefined, {
          fit,
          position: "centre",
          withoutEnlargement: true,
        })
        .webp({ quality: IMAGE_VARIANT_WEBP_QUALITY })
        .toBuffer(),
    })),
  );
};
