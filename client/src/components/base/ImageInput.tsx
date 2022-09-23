import { useEffect, useRef, useState } from "react";
import PinataClient from "../../services/pinata";
import colors from "../../styles/colors";
import CloudUpload from "../icons/CloudUpload";
import ImageCrop from "./images/ImageCrop";
import Toast from "./Toast";

export type Dimensions = {
  width: number;
  height: number;
};

export default function ImageInput({
  label,
  dimensions,
  existingImg,
  circle,
  info,
  imgHandler,
}: {
  label: string;
  dimensions: Dimensions;
  existingImg?: string;
  circle?: Boolean;
  info?: string;
  imgHandler: (file: Blob) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [imgSrc, setImgSrc] = useState<string | undefined>();
  const [showCrop, setShowCrop] = useState(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>();
  const [validation, setValidation] = useState({
    error: false,
    msg: "",
  });

  const handleDragEnter = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const getFiles = (e: any) => {
    if (e.dataTransfer) {
      return e.dataTransfer.files;
    }
    return e.currentTarget?.files;
  };

  const saveImage = (
    e: React.DragEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const files = getFiles(e);

    if (files && files.length > 0) {
      // ensure image is < 2mb
      if (files[0].size > 2000000) {
        setValidation({
          error: true,
          msg: "Image must be less than 2mb",
        });
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        if (reader.result) {
          setImgSrc(reader.result.toString() || "");
          setShowCrop(true);
        }
      });
      reader.readAsDataURL(files[0]);
    }
  };

  const blobExistingImg = async (imgUrl: string) => {
    const img = await fetch(imgUrl);
    const blob = await img.blob();
    // Emit blob so that if image is not updated it will still be saved on the update
    imgHandler(blob);
  };

  const loadCurrentImg = (image?: string) => {
    if (!image) return "";

    // Fetch existing img path from Pinata for display
    const pinataClient = new PinataClient();
    const imgUrl = pinataClient.fileURL(image);

    blobExistingImg(imgUrl);
    return imgUrl;
  };

  const onButtonClick = () => {
    if (typeof fileInput.current?.click === "function") {
      fileInput.current.click();
    }
  };

  const [currentImg, setCurrentImg] = useState<string | undefined>(undefined);

  useEffect(() => {
    const i = loadCurrentImg(existingImg);
    setCurrentImg(i);
  }, [existingImg]);

  return (
    <div className="w-full">
      <div className="mt-6 w-full sm:w-3/4">
        <label className="text-sm" htmlFor={label}>
          {label}
        </label>
        <legend>{info}</legend>
        <div className="flex">
          <input
            ref={fileInput}
            onChange={(e) => saveImage(e)}
            className="hidden"
            type="file"
            name="file"
            accept=".png,.jpg"
          />
          {fileInput && (
            <button
              className="w-2/3 border border-dashed rounded flex flex-col py-6 items-center mr-2"
              type="button"
              onClick={onButtonClick}
              onDrop={(e) => saveImage(e)}
              onDragOver={(e) => handleDragOver(e)}
              onDragEnter={(e) => handleDragEnter(e)}
              onDragLeave={(e) => handleDragLeave(e)}
            >
              <CloudUpload color={colors["secondary-text"]} />
              <p>Click to Upload or drag and drop</p>
              <p>
                PNG or JPG (Required:{" "}
                {`${dimensions.width}px x ${dimensions.height}px`})
              </p>
            </button>
          )}
          <div className="w-1/3">
            {canvas && (
              <img
                className={`max-h-28 ${circle && "rounded-full"}`}
                src={canvas.toDataURL("image/jpeg", 1)}
                alt="Project Logo Preview"
              />
            )}
            {currentImg !== undefined &&
              currentImg !== "" &&
              canvas === undefined && (
                <img
                  className={`max-h-28 ${circle && "rounded-full"}`}
                  src={currentImg}
                  alt="Project Logo Preview"
                />
              )}
          </div>
        </div>
      </div>
      <Toast
        show={validation.error}
        error
        fadeOut
        onClose={() =>
          setValidation({
            error: false,
            msg: "",
          })
        }
      >
        <p className="font-semibold text-quaternary-text mr-2 mt-1">
          {validation.msg}
        </p>
      </Toast>
      <ImageCrop
        isOpen={showCrop}
        imgSrc={imgSrc ?? ""}
        dimensions={dimensions}
        onClose={() => setShowCrop(false)}
        saveCrop={(imgUrl) => {
          setCanvas(imgUrl);
          imgUrl.toBlob((blob) => blob && imgHandler(blob));
        }}
      />
    </div>
  );
}
