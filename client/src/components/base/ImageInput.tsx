import { useRef, useState } from "react";
import colors from "../../styles/colors";
import CloudUpload from "../icons/CloudUpload";

export default function ImageInput({
  label,
  imgHandler,
}: {
  label: string;
  imgHandler: (event: Buffer) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [tempImg, setTempImg] = useState("");

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
      const img: HTMLImageElement = document.createElement("img");
      img.src = URL.createObjectURL(files[0]);
      setTempImg(URL.createObjectURL(files[0]));

      const reader = new FileReader();
      reader.onloadend = function () {
        const bufferResult = reader.result as ArrayBuffer;
        if (bufferResult) {
          const buf = window.Buffer.from(bufferResult);
          imgHandler(buf);
        }
      };

      reader.readAsArrayBuffer(files[0]);
    }
  };

  const onButtonClick = () => {
    if (typeof fileInput.current?.click === "function") {
      fileInput.current.click();
    }
  };

  return (
    <div className="mt-6 w-11/12">
      <label className="block text-xs mb-2" htmlFor={label}>
        {label}
      </label>
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
          {tempImg && <img src={tempImg} alt="Project Logo Preview" />}
        </div>
      </div>
    </div>
  );
}
