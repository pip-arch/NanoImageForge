import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  'data-testid'?: string;
}

export default function ImageUploader({ onImageUploaded, 'data-testid': testId }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    // Get upload URL from backend
    const uploadResponse = await fetch('/api/objects/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to get upload URL');
    }
    
    const { uploadURL } = await uploadResponse.json();
    
    // Upload file directly to object storage
    const uploadFileResponse = await fetch(uploadURL, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    if (!uploadFileResponse.ok) {
      throw new Error('Failed to upload file');
    }
    
    // Convert upload URL to object path
    const url = new URL(uploadURL);
    const objectPath = `/objects${url.pathname.split('/').slice(2).join('/')}`;
    
    return objectPath;
  }, []);

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadFile(file);
      onImageUploaded(imageUrl);
      toast({
        title: "Image uploaded successfully",
        description: "Ready to start editing!",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, onImageUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <Card 
      {...getRootProps()} 
      className={`cursor-pointer transition-all duration-200 ${
        isDragActive 
          ? 'border-primary bg-primary/5 scale-105' 
          : 'hover:border-primary/50 hover:bg-muted/50'
      } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      data-testid={testId}
    >
      <CardContent className="flex flex-col items-center justify-center py-8 px-6">
        <input {...getInputProps()} />
        
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : (
              <span className="text-2xl text-muted-foreground">☁️</span>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">
              {isUploading 
                ? "Uploading..." 
                : isDragActive 
                ? "Drop your image here" 
                : "Drop your image here"
              }
            </p>
            {!isUploading && (
              <p className="text-xs text-muted-foreground">or click to browse files</p>
            )}
          </div>
          
          {!isUploading && (
            <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
