
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isProcessing?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, isProcessing }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
        isDragActive 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50",
        isProcessing && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-3">
        {isDragActive ? (
          <Upload className="w-12 h-12 text-blue-500 animate-bounce" />
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-400" />
        )}
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {isDragActive ? "Drop your image here" : "Upload house photo"}
          </h3>
          <p className="text-sm text-gray-500">
            {isDragActive 
              ? "Release to upload" 
              : "Drag & drop or click to select a photo of your house with driveway"
            }
          </p>
        </div>
        
        <div className="text-xs text-gray-400">
          Supports JPG, PNG, WebP up to 10MB
        </div>
      </div>
    </div>
  );
};
