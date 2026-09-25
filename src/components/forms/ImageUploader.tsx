import React, { useRef } from 'react';

export interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  multiple = false,
  accept = 'image/*',
  maxFiles = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, maxFiles);
      onUpload(filesArray);
    }
  };

  return (
    <div className="image-uploader-dropzone" onClick={() => fileInputRef.current?.click()}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <p>Drag and drop images here, or click to browse</p>
    </div>
  );
};

export default ImageUploader;
