"use client";

import { useState } from 'react';

export default function TestUpload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Simulate upload process
      setUploadStatus('uploading');
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadStatus('success');
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  const handleUpload = () => {
    if (uploadedFile) {
      setUploadStatus('uploading');
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadStatus('success');
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">📤</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Test File Upload</h3>
            <p className="text-sm text-gray-600">Test medical file upload functionality</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
            {!uploadedFile ? (
              <>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="test-upload"
                />
                <label htmlFor="test-upload" className="cursor-pointer block">
                  <div className="text-gray-600">
                    <div className="text-4xl mb-2">📁</div>
                    <div className="font-medium text-gray-700">Click to upload files</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Supports images, PDFs, documents
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Max file size: 10MB
                    </div>
                  </div>
                </label>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600">
                        {uploadedFile.type.includes('image') ? '🖼️' : '📄'}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 text-sm truncate max-w-[200px]">
                        {uploadedFile.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-600 p-2"
                  >
                    Remove
                  </button>
                </div>

                {/* Progress Bar */}
                {uploadStatus === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-purple-600 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {uploadStatus === 'idle' && (
                  <button
                    onClick={handleUpload}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    Upload File
                  </button>
                )}

                {/* Success Message */}
                {uploadStatus === 'success' && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                        <span>✅</span>
                      </div>
                      <div>
                        <div className="font-medium text-green-800">Upload Successful!</div>
                        <div className="text-sm text-green-600">
                          File has been uploaded successfully
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Types Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/50 border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🖼️</div>
              <div className="text-xs font-medium text-gray-700">Images</div>
              <div className="text-xs text-gray-500">JPG, PNG, GIF</div>
            </div>
            <div className="bg-white/50 border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">📄</div>
              <div className="text-xs font-medium text-gray-700">Documents</div>
              <div className="text-xs text-gray-500">PDF, DOC, TXT</div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                uploadStatus === 'idle' ? 'bg-gray-400' :
                uploadStatus === 'uploading' ? 'bg-yellow-500 animate-pulse' :
                uploadStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-600">
                {uploadStatus === 'idle' ? 'Ready to upload' :
                 uploadStatus === 'uploading' ? 'Uploading...' :
                 uploadStatus === 'success' ? 'Upload complete' : 'Upload failed'}
              </span>
            </div>
            {uploadedFile && (
              <button
                onClick={handleRemoveFile}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Test Upload Footer */}
      <div className="bg-gradient-to-r from-purple-100/50 to-pink-100/50 border-t border-purple-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <span>Test upload component for health records</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-white border border-gray-300 rounded-lg">Test</span>
            <span className="px-2 py-1 bg-white border border-gray-300 rounded-lg">Medical</span>
          </div>
        </div>
      </div>
    </div>
  );
}