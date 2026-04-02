import React, { useState, useRef } from 'react';
import { ProjectImage } from '../types';

interface PortfolioUploaderProps {
    images: ProjectImage[];
    onImagesChange: (images: ProjectImage[]) => void;
    maxImages?: number;
}

export const PortfolioUploader: React.FC<PortfolioUploaderProps> = ({
    images,
    onImagesChange,
    maxImages = 6,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        // Convert file to base64 for demo (in production, upload to Firebase Storage)
        const file = files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            const newImage: ProjectImage = {
                url: reader.result as string,
                type: type,
            };

            if (images.length < maxImages) {
                onImagesChange([...images, newImage]);
            }
            setUploading(false);
        };

        reader.readAsDataURL(file);
        e.target.value = ''; // Reset input
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const beforeImages = images.filter(img => img.type === 'before');
    const afterImages = images.filter(img => img.type === 'after');

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">📸 Ảnh Trước & Sau</h3>
            <p className="text-sm text-gray-500">Thêm ảnh để chứng minh tay nghề của bạn</p>

            <div className="grid grid-cols-2 gap-4">
                {/* Before Column */}
                <div className="space-y-2">
                    <div className="text-center text-sm font-medium text-red-600 bg-red-50 py-1 rounded">
                        TRƯỚC
                    </div>
                    {beforeImages.map((img, idx) => (
                        <div key={`before-${idx}`} className="relative">
                            <img
                                src={img.url}
                                alt={`Before ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-red-200"
                            />
                            <button
                                onClick={() => removeImage(images.indexOf(img))}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {beforeImages.length < 3 && (
                        <label className="block cursor-pointer">
                            <div className="w-full h-24 border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-xs mt-1">Thêm ảnh</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'before')}
                                disabled={uploading}
                            />
                        </label>
                    )}
                </div>

                {/* After Column */}
                <div className="space-y-2">
                    <div className="text-center text-sm font-medium text-green-600 bg-green-50 py-1 rounded">
                        SAU
                    </div>
                    {afterImages.map((img, idx) => (
                        <div key={`after-${idx}`} className="relative">
                            <img
                                src={img.url}
                                alt={`After ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-green-200"
                            />
                            <button
                                onClick={() => removeImage(images.indexOf(img))}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {afterImages.length < 3 && (
                        <label className="block cursor-pointer">
                            <div className="w-full h-24 border-2 border-dashed border-green-300 rounded-lg flex flex-col items-center justify-center text-green-400 hover:bg-green-50 transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-xs mt-1">Thêm ảnh</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'after')}
                                disabled={uploading}
                            />
                        </label>
                    )}
                </div>
            </div>

            {uploading && (
                <div className="text-center text-sm text-blue-500">
                    Đang tải ảnh...
                </div>
            )}
        </div>
    );
};
