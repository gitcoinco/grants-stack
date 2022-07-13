import { useRef, useState } from "react";
import colors from "../../styles/colors";
import { Metadata } from "../../types";
import { getProjectImage } from "../../utils/components";
import CloudUpload from "../icons/CloudUpload";
import Toast from "./Toast";

export default function ImageInput({
  label,
  currentProject,
  imgHandler,
}: {
  label: string;
  currentProject?: Metadata;
  imgHandler: (file: Blob) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [tempImg, setTempImg] = useState("");
  const [show, showToast] = useState(false);

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

      // ensure image is < 2mb
      if (files[0].size > 2000000) {
        showToast(true);
        return;
      }
      // remove validation message
      showToast(false);

      const img: HTMLImageElement = document.createElement("img");
      img.src = URL.createObjectURL(files[0]);

      setTempImg(URL.createObjectURL(files[0]));

      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result;
        if (res) {
          // const  = window.Buffer.from(bufferResult);
          imgHandler(files[0]);
        }
      };

      reader.readAsArrayBuffer(files[0]);
    }
  };

  const currentImg = () => {
    if (tempImg) return tempImg;
    if (!currentProject) return "";
    return getProjectImage(false, currentProject);
  };

  const onButtonClick = () => {
    if (typeof fileInput.current?.click === "function") {
      fileInput.current.click();
    }
  };

  return (
    <>
      <div className="mt-6 w-11/12">
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
              className="w-full border border-dashed rounded flex flex-col py-6 items-center mr-2"
              type="button"
              onClick={onButtonClick}
              onDrop={(e) => saveImage(e)}
              onDragOver={(e) => handleDragOver(e)}
              onDragEnter={(e) => handleDragEnter(e)}
              onDragLeave={(e) => handleDragLeave(e)}
            >
              <CloudUpload color={colors["secondary-text"]} />
              <p>Click to Upload or drag and drop</p>
              <p>PNG or JPG (Recommended: 1044x600px)</p>
            </button>
          )}
          <div className="w-1/4">
            {currentImg().length > 0 && (
              <img src={currentImg()} alt="Project Logo Preview" />
            )}
          </div>
        </div>
      </div>
      <Toast show={show} onClose={() => showToast(false)} error>
        <p className="font-semibold text-quaternary-text mr-2 mt-1">
          Image must be less than 2mb
        </p>
      </Toast>
    </>
  );
}
