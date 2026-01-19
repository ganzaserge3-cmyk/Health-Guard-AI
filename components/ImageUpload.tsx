"use client";

type ImageUploadProps = {
  onImageUpload: (file: File) => void;
  onRemove: () => void;
  previewUrl: string;
  isLoading: boolean;
};

export default function ImageUpload({ onImageUpload, onRemove, previewUrl, isLoading }: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-purple-400 transition-colors">
      {previewUrl ? (
        <div className="relative">
          <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
          <button
            type="button"
            onClick={onRemove}
            disabled={isLoading}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="text-gray-600">
              <div className="text-4xl mb-2">📷</div>
              <div>Click to upload medical image</div>
              <div className="text-sm text-gray-500 mt-2">Supports JPG, PNG, etc.</div>
            </div>
          </label>
        </>
      )}
    </div>
  );
}