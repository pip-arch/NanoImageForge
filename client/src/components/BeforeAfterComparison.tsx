import { useState, useRef, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface BeforeAfterComparisonProps {
  originalImage: string;
  editedImage: string | null;
  showComparison: boolean;
}

// Helper function to convert Google Cloud Storage URLs to proxy URLs
function getDisplayableImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // If it's already a relative path or proxy URL, return as is
  if (imageUrl.startsWith('/') || imageUrl.includes('/api/proxy-image')) {
    return imageUrl;
  }
  
  // If it's a Google Cloud Storage signed URL, extract the object path and use proxy
  if (imageUrl.includes('storage.googleapis.com') && imageUrl.includes('/.private/')) {
    try {
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/.private\/(.+)/);
      if (pathMatch) {
        const objectPath = `/objects/${pathMatch[1]}`;
        return `/api/proxy-image?path=${encodeURIComponent(objectPath)}`;
      }
    } catch (e) {
      console.error('Error parsing image URL:', e);
    }
  }
  
  // Return original URL as fallback
  return imageUrl;
}

export default function BeforeAfterComparison({ 
  originalImage, 
  editedImage, 
  showComparison 
}: BeforeAfterComparisonProps) {
  const displayOriginalImage = useMemo(() => getDisplayableImageUrl(originalImage), [originalImage]);
  const displayEditedImage = useMemo(() => editedImage ? getDisplayableImageUrl(editedImage) : null, [editedImage]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, [isDragging]);

  if (!originalImage) {
    return null;
  }

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="relative aspect-[4/3] overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Original Image */}
          <img 
            src={displayOriginalImage} 
            alt="Original image" 
            className="absolute inset-0 w-full h-full object-contain bg-black/5"
          />
          
          {/* Edited Image Overlay */}
          {displayEditedImage && showComparison && (
            <>
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)` }}
              >
                <img 
                  src={displayEditedImage} 
                  alt="Edited image" 
                  className="w-full h-full object-contain bg-black/5"
                />
              </div>
              
              {/* Comparison Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-10 flex items-center justify-center"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
              >
                <div className="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="flex space-x-0.5">
                    <div className="w-0.5 h-3 bg-white rounded-full"></div>
                    <div className="w-0.5 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Labels */}
              <div className="absolute top-4 left-4 bg-black/70 text-white text-sm px-2 py-1 rounded">
                Original
              </div>
              <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-2 py-1 rounded">
                Edited
              </div>
            </>
          )}
          
          {/* Single Image View */}
          {displayEditedImage && !showComparison && (
            <img 
              src={displayEditedImage} 
              alt="Edited image" 
              className="absolute inset-0 w-full h-full object-contain bg-black/5"
            />
          )}
        </div>
        
        {/* Image Info Bar */}
        <div className="bg-muted/50 px-4 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">
              Status: <span className="font-medium text-foreground">
                {editedImage ? 'Edited' : 'Original'}
              </span>
            </span>
          </div>
          {showComparison && editedImage && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Drag slider to compare</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
