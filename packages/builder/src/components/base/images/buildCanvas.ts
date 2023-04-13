import { PixelCrop } from "react-image-crop";

export default function buildCanvas(
  image: HTMLImageElement,
  crop: PixelCrop,
  dimensions: { width: number; height: number }
) {
  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}
