/**
 * Resizes an image file client-side using HTML5 Canvas.
 * Ensures the maximum dimension (width or height) does not exceed maxDim.
 */
export const resizeImageFile = (file, maxDim = 1024) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions if necessary
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert back to Blob/File (forcing JPEG for consistency/compression)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas to Blob failed."));
            return;
          }
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          URL.revokeObjectURL(objectUrl); // Clean up memory
          resolve({ file: newFile, url: URL.createObjectURL(newFile) });
        },
        'image/jpeg',
        0.95 // High quality compression
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for resizing."));
    };
  });
};