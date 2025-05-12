import React, { useState } from 'react';
import { Upload, Camera, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReportPhotoUploaderProps {
  onPhotosSelected: (photos: File[]) => void;
  existingPhotos?: string[];
  onRemoveExistingPhoto?: (url: string) => void;
  maxPhotos?: number;
}

const ReportPhotoUploader: React.FC<ReportPhotoUploaderProps> = ({
  onPhotosSelected,
  existingPhotos = [],
  onRemoveExistingPhoto,
  maxPhotos = 10
}) => {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const totalPhotos = existingPhotos.length + selectedPhotos.length;
  const canAddMorePhotos = totalPhotos < maxPhotos;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    if (totalPhotos + files.length > maxPhotos) {
      toast.error(`Vous ne pouvez pas ajouter plus de ${maxPhotos} photos`);
      return;
    }
    
    setIsUploading(true);
    
    const newPhotos = Array.from(files);
    setSelectedPhotos(prev => [...prev, ...newPhotos]);
    
    // Create preview URLs
    const newPreviewUrls = newPhotos.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Notify parent component
    onPhotosSelected(newPhotos);
    
    setIsUploading(false);
    
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    const newSelectedPhotos = [...selectedPhotos];
    newSelectedPhotos.splice(index, 1);
    setSelectedPhotos(newSelectedPhotos);
    
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
    
    // Notify parent component
    onPhotosSelected(newSelectedPhotos);
  };

  const handleRemoveExistingPhoto = (url: string) => {
    onRemoveExistingPhoto && onRemoveExistingPhoto(url);
  };

  return (
    <div className="space-y-4">
      {/* Existing photos */}
      {existingPhotos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Photos existantes</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingPhotos.map((url, index) => (
              <div key={`existing-${index}`} className="relative">
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="h-32 w-full object-cover rounded-lg"
                />
                {onRemoveExistingPhoto && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingPhoto(url)}
                    className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* New photos */}
      {previewUrls.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Nouvelles photos</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div key={`new-${index}`} className="relative">
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="h-32 w-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload controls */}
      {canAddMorePhotos && (
        <div>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Télécharger des photos</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={isUploading || !canAddMorePhotos}
                  />
                </label>
                <p className="pl-1">ou glisser-déposer</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG jusqu'à 10MB ({totalPhotos}/{maxPhotos})
              </p>
            </div>
          </div>
          
          {/* Camera capture for mobile */}
          <div className="mt-4 text-center">
            <label
              htmlFor="camera-capture"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Camera className="h-4 w-4 mr-2" />
              Prendre une photo
              <input
                id="camera-capture"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleFileChange}
                disabled={isUploading || !canAddMorePhotos}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPhotoUploader;