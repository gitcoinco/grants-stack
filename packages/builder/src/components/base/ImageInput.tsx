import { useEffect, useRef, useState } from "react";
import { getConfig } from "common/src/config";
import PinataClient from "common/src/services/pinata";
import colors from "../../styles/colors";
import CloudUpload from "../icons/CloudUpload";
import ImageCrop from "./images/ImageCrop";
import Toast from "./Toast";

export type Dimensions = {
  width: number;
  height: number;
};

type Props = {
  label: string;
  dimensions: Dimensions;
  imageHash?: string;
  imageData?: Blob;
  circle?: Boolean;
  info?: string;
  imgHandler: (file: Blob) => void;
};

export default function ImageInput({
  label,
  dimensions,
  imageHash,
  imageData,
  circle,
  info,
  imgHandler,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [imgSrc, setImgSrc] = useState<string | undefined>();
  const [showCrop, setShowCrop] = useState(false);
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

  const loadCurrentImg = (ipfsCID?: string) => {
    if (ipfsCID === undefined) {
      return "";
    }

    // Fetch existing img path from Pinata for display
    const pinataClient = new PinataClient(getConfig());
    const imgUrl = pinataClient.fileUrl(ipfsCID);

    blobExistingImg(imgUrl);
    return imgUrl;
  };

  const onButtonClick = () => {
    if (typeof fileInput.current?.click === "function") {
      fileInput.current.click();
    }
  };

  useEffect(() => {
    if (imageData === undefined && imageHash !== undefined) {
      loadCurrentImg(imageHash);
    }
  }, [imageData, imageHash]);

  useEffect(() => {
    let unloaded = false;

    if (imageData !== undefined) {
      const fr = new FileReader();
      fr.onload = () => {
        if (!unloaded) {
          setImgSrc(fr.result as string);
        }
      };
      fr.readAsDataURL(imageData);
    } else {
      setImgSrc(undefined);
    }

    return () => {
      unloaded = true;
    };
  }, [imageData, imageHash]);

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
            accept=".png,.jpg,.jpeg"
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
              <p>Click to Upload or Drag and Drop</p>
              <p>PNG or JPG</p>
            </button>
          )}
          <div className="w-1/3">
            {imgSrc && (
              <img
                className={`max-h-28 ${circle && "rounded-full"}`}
                src={imgSrc}
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
          imgUrl.toBlob((blob) => blob && imgHandler(blob), "image/jpeg", 0.9);
        }}
      />
    </div>
  );
}
