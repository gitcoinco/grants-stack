import React, { useEffect, useRef, useState } from "react";

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  PixelCrop,
} from "react-image-crop";
import { Dimensions } from "../ImageInput";
import { BaseModal, ToggleModalProps } from "../BaseModal";
import buildCanvas from "./buildCanvas";

import "react-image-crop/dist/ReactCrop.css";
import Button, { ButtonVariants } from "../Button";

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier, so we use some helper functions.
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "px",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  ) as PixelCrop;
}

type ImageCropProps = ToggleModalProps & {
  imgSrc: string;
  dimensions: Dimensions;
  saveCrop: (imgUrl: HTMLCanvasElement) => void;
};

export default function ImageCrop({
  isOpen,
  imgSrc,
  dimensions,
  saveCrop,
  onClose,
}: ImageCropProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<PixelCrop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement>();

  function onImageLoad() {
    const { width, height } = dimensions;
    if (imgSrc) {
      setCrop(centerAspectCrop(width, height, width / height));
    }
  }

  useEffect(() => {
    const { width, height } = dimensions;
    setCrop(centerAspectCrop(width, height, width / height));
  }, [dimensions]);

  useEffect(() => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      // We use canvasPreview as it's much faster than imgPreview.
      const canvas = buildCanvas(imgRef.current, completedCrop, dimensions);
      setCroppedCanvas(canvas);
    }
  }, [completedCrop]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <>
        <div className="flex flex-col text-center m-3 ">
          <h4>Crop Image</h4>
          <p>
            Drag or adjust the box to crop your image to the right aspect ratio
          </p>
        </div>
        {Boolean(imgSrc) && (
          <ReactCrop
            crop={crop}
            onChange={(pixelCrop) => {
              setCrop(pixelCrop);
            }}
            onComplete={(c) => {
              setCompletedCrop(c);
            }}
            aspect={dimensions.width / dimensions.height}
            maxHeight={dimensions.height}
            maxWidth={dimensions.width}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imgSrc}
              style={{ transform: `scale(1) rotate(0deg)` }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        )}
        <div className="flex w-full" />
        Note: Transparent sections in images will default to black when
        uploaded. Please consider using a non-transparent background.
        <div className="flex w-full">
          <Button
            styles={["w-1/2 justify-center"]}
            variant={ButtonVariants.outline}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            styles={["w-1/2 justify-center"]}
            variant={ButtonVariants.primary}
            disabled={croppedCanvas === undefined}
            onClick={() => {
              if (croppedCanvas) {
                saveCrop(croppedCanvas);
                onClose();
              }
            }}
          >
            Use Image
          </Button>
        </div>
      </>
    </BaseModal>
  );
}
