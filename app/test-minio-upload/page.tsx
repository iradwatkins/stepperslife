"use client";

import { useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";

export default function TestMinIOUploadPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleImageChange = (storageId: string | null, url: string | null) => {
    console.log("Image changed:", { storageId, url });
    setImageUrl(url);
    if (url) {
      setUploadStatus(`✅ Image uploaded successfully to MinIO!`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Test MinIO Image Upload</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <ImageUploadField
          value={imageUrl || undefined}
          onChange={handleImageChange}
          label="Upload Test Image"
        />
        
        {uploadStatus && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
            {uploadStatus}
          </div>
        )}
        
        {imageUrl && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Uploaded Image:</h2>
            <div className="border rounded overflow-hidden">
              <img 
                src={imageUrl} 
                alt="Uploaded to MinIO" 
                className="w-full h-auto"
              />
            </div>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs break-all">
              <strong>MinIO URL:</strong> {imageUrl}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">MinIO Server Info:</h3>
        <ul className="text-sm space-y-1">
          <li>🖥️ Server: 72.60.28.175</li>
          <li>🪣 Bucket: stepperslife</li>
          <li>🔌 API Port: 9000</li>
          <li>🎛️ Console Port: 9001</li>
          <li>🔐 Access: minioadmin / minioadmin</li>
          <li>🌐 Console URL: <a href="http://72.60.28.175:9001" target="_blank" className="text-blue-600 hover:underline">http://72.60.28.175:9001</a></li>
        </ul>
      </div>
    </div>
  );
}