import { useRef, useState } from "react";
import colors from "../../styles/colors";
import { Metadata } from "../../types";
import { getProjectImage, ImgTypes } from "../../utils/components";
import CloudUpload from "../icons/CloudUpload";
import Toast from "./Toast";

type Dimensions = {
  width: number;
  height: number;
};

const validateDimensions = (
  image: HTMLImageElement,
  dimensions: Dimensions
) => {
  const { naturalHeight, naturalWidth } = image;

  return (
    naturalHeight !== dimensions.height && naturalWidth !== dimensions.width
  );
};

export default function ImageInput({
  label,
  dimensions,
  currentProject,
  circle,
  imgHandler,
}: {
  label: string;
  dimensions: {
    width: number;
    height: number;
  };
  currentProject?: Metadata;
  circle?: Boolean;
  imgHandler: (file: Blob) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [tempImg, setTempImg] = useState("");
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
    if (e.currentTarget) {
      return e.currentTarget?.files;
    }

    return e.dataTransfer.files;
  };

  const saveImage = (
    e: React.DragEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const files = getFiles(e);
    if (files) {
      if (files.length === 0) {
        return;
      }
      const file = files[0];
      // ensure image is < 2mb
      if (file.size > 2000000) {
        setValidation({
          error: true,
          msg: "Image must be less than 2mb",
        });
        return;
      }
      // remove validation message
      setValidation({
        error: false,
        msg: "",
      });

      const img: HTMLImageElement = document.createElement("img");
      img.src = URL.createObjectURL(file);

      setTempImg(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result;
        if (validateDimensions(img, dimensions)) {
          setValidation({
            error: true,
            msg: `Image must be ${dimensions.width}px x ${dimensions.height}px`,
          });
          setTempImg("");
          return;
        }

        if (res) {
          imgHandler(file);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const currentImg = () => {
    if (tempImg) return tempImg;
    if (!currentProject) return "";
    return getProjectImage(false, ImgTypes.bannerImg, currentProject);
  };

  const onButtonClick = () => {
    if (typeof fileInput.current?.click === "function") {
      fileInput.current.click();
    }
  };

  return (
    <>
      <div className="mt-6 w-full">
        <label htmlFor={label}>{label}</label>
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
            {currentImg().length > 0 && (
              <img
                className={`max-h-28 ${circle && "rounded-full"}`}
                src={currentImg()}
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
    </>
  );
}
