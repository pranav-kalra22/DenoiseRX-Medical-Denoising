import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

export default function UploadZone({ onFileSelect }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      // Create a local URL so we can preview it immediately
      const file = acceptedFiles[0];
      const previewUrl = URL.createObjectURL(file);
      onFileSelect(file, previewUrl);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  return (
    <div 
      {...getRootProps()} 
      className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragActive 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800'
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud className={`w-10 h-10 mx-auto mb-4 ${isDragActive ? 'text-blue-500' : 'text-zinc-500'}`} />
      <p className="text-sm font-medium text-zinc-300">
        {isDragActive ? "Drop the radiograph here" : "Drag & drop your own X-ray"}
      </p>
      <p className="text-xs text-zinc-500 mt-2">
        Supports PNG, JPG up to 5MB
      </p>
    </div>
  );
}