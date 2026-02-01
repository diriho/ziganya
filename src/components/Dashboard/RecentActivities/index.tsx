import { useState, useRef } from "react";
import { MoreHorizontal, Receipt, Smartphone, Upload, X, Check } from "lucide-react";

interface ActivityItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    amount: string;
    category: string;
}

const ActivityItem = ({ icon, title, subtitle, amount, category }: ActivityItemProps) => {
    return (
        <div className="flex items-start gap-4 group">
            {/* Icon */}
            <div className="
                w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100
                flex items-center justify-center
                text-brand-green
                group-hover:bg-brand-green-light/10 group-hover:border-brand-green-light/20
                transition-all duration-200
                flex-shrink-0
            ">
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-zinc-900 mb-1 truncate">
                            {title}
                        </h4>
                        <p className="text-xs text-zinc-500 mb-2">
                            {subtitle}
                        </p>
                        <span className="inline-block text-xs font-medium text-zinc-400 uppercase tracking-wide">
                            {category}
                        </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-zinc-900">
                            {amount}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RecentActivities = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image (JPEG, PNG, WebP) or PDF file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);
        setIsUploading(true);
        setUploadSuccess(false);

        // Simulate upload process (replace with actual API call)
        try {
            // TODO: Replace with actual upload logic
            // const formData = new FormData();
            // formData.append('receipt', file);
            // await uploadReceipt(formData);
            
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setIsUploading(false);
            setUploadSuccess(true);
            
            // Reset after 3 seconds
            setTimeout(() => {
                setSelectedFile(null);
                setUploadSuccess(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 3000);
        } catch (error) {
            console.error('Upload failed:', error);
            setIsUploading(false);
            alert('Upload failed. Please try again.');
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadSuccess(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-brand-green">Recent Activities</h3>
                <button 
                    className="
                        text-zinc-400 hover:text-zinc-900
                        p-1.5 rounded-lg hover:bg-zinc-50
                        transition-all duration-200
                    "
                    aria-label="More options"
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Activity Items */}
            <div className="flex flex-col gap-6">
                {/* TODO: replace with database data */}
                <ActivityItem 
                    icon={<Receipt size={18} />} 
                    title="Starbucks Coffee" 
                    subtitle="Receipt parsed • 2m ago" 
                    amount="-$4.50"
                    category="Food & Drink"
                />
                <ActivityItem 
                    icon={<Smartphone size={18} />} 
                    title="Apple Music" 
                    subtitle="SMS detected • 1h ago" 
                    amount="-$10.99"
                    category="Entertainment"
                />
                <ActivityItem 
                    icon={<Receipt size={18} />} 
                    title="Uber Ride" 
                    subtitle="Screenshot • 4h ago" 
                    amount="-$24.20"
                    category="Transport"
                />
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Upload Button / File Status */}
            {!selectedFile && !uploadSuccess ? (
                <button 
                    onClick={handleFileSelect}
                    className="
                        w-full mt-8 py-4 
                        border-2 border-dashed border-zinc-200 
                        rounded-2xl 
                        text-zinc-400 font-bold 
                        hover:border-brand-green-light hover:text-brand-green
                        transition-all duration-200
                        flex items-center justify-center gap-2
                        group
                        cursor-pointer
                    "
                >
                    <Upload 
                        size={18} 
                        className="group-hover:translate-y-[-2px] transition-transform duration-200" 
                    />
                    Upload Receipt
                </button>
            ) : uploadSuccess ? (
                <div className="
                    w-full mt-8 py-4 
                    border-2 border-solid border-brand-green-light
                    bg-brand-green-light/10
                    rounded-2xl 
                    text-brand-green font-bold 
                    transition-all duration-200
                    flex items-center justify-center gap-2
                ">
                    <Check size={18} />
                    Receipt uploaded successfully!
                </div>
            ) : (
                <div className="
                    w-full mt-8 py-4 px-4
                    border-2 border-solid border-zinc-200
                    bg-zinc-50
                    rounded-2xl 
                    transition-all duration-200
                    flex items-center justify-between gap-4
                ">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {isUploading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-brand-green-light border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium text-zinc-700 truncate">
                                    Uploading {selectedFile?.name}...
                                </span>
                            </>
                        ) : (
                            <>
                                <Receipt size={18} className="text-brand-green flex-shrink-0" />
                                <span className="text-sm font-medium text-zinc-700 truncate">
                                    {selectedFile?.name}
                                </span>
                                <span className="text-xs text-zinc-500 flex-shrink-0">
                                    ({(selectedFile?.size ? (selectedFile.size / 1024).toFixed(1) : '0')} KB)
                                </span>
                            </>
                        )}
                    </div>
                    {!isUploading && (
                        <button
                            onClick={handleRemoveFile}
                            className="
                                p-1.5 rounded-lg
                                text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100
                                transition-all duration-200
                                flex-shrink-0
                            "
                            aria-label="Remove file"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
