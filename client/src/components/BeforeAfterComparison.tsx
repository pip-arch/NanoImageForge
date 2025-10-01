import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface BeforeAfterComparisonProps {
  originalImage: string;
  editedImage: string | null;
  showComparison: boolean;
}

// Helper function to fetch signed proxy URL for object paths
async function getProxyUrl(objectPath: string): Promise<string> {
  if (!objectPath || !objectPath.startsWith('/objects/')) {
    return objectPath; // Return as-is if not an object path
  }
  
  try {
    const response = await fetch('/api/proxy-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ objectPath }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch proxy URL');
    }
    
    const data = await response.json();
    return data.proxyUrl;
  } catch (error) {
    console.error('Error fetching proxy URL:', error);
    return objectPath; // Fallback to original path
  }
}

export default function BeforeAfterComparison({ 
  originalImage, 
  editedImage, 
  showComparison 
}: BeforeAfterComparisonProps) {
  const [displayOriginalImage, setDisplayOriginalImage] = useState<string>('');
  const [displayEditedImage, setDisplayEditedImage] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch signed proxy URL for original image
  useEffect(() => {
    if (originalImage) {
      getProxyUrl(originalImage).then(setDisplayOriginalImage);
    }
  }, [originalImage]);

  // Fetch signed proxy URL for edited image
  useEffect(() => {
    if (editedImage) {
      getProxyUrl(editedImage).then(setDisplayEditedImage);
    } else {
      setDisplayEditedImage(null);
    }
  }, [editedImage]);

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
