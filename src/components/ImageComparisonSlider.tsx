
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImageComparisonSliderProps {
  originalImage: string;
  processedImage: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  originalImage,
  processedImage,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isMobile = useIsMobile();

  // Reset slider position to the middle when images change
  useEffect(() => {
    setSliderPosition(50);
  }, [originalImage, processedImage]);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleStart = useCallback((clientX: number) => {
    isDragging.current = true;
    handleMove(clientX);
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  // Handle container clicks/touches for easier interaction
  const handleContainerInteraction = useCallback((clientX: number) => {
    if (!isDragging.current) {
      handleMove(clientX);
    }
  }, [handleMove]);

  useEffect(() => {
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleTouchMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none cursor-ew-resize"
      style={{ touchAction: 'none' }}
      onClick={(e) => handleContainerInteraction(e.clientX)}
      onTouchStart={(e) => handleContainerInteraction(e.touches[0].clientX)}
    >
      {/* Both images in identical containers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Original image - always visible */}
        <img
          src={originalImage}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        {/* Processed image - clipped to reveal only the right portion */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ 
            clipPath: `inset(0 0 0 ${sliderPosition}%)`
          }}
        >
          <img
            src={processedImage}
            alt="Processed"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </div>
      
      {/* Slider line and handle */}
      <div
        className="absolute top-0 bottom-0 cursor-ew-resize z-10"
        style={{ 
          left: `${sliderPosition}%`, 
          transform: 'translateX(-50%)', 
          width: isMobile ? '60px' : '30px'  // Increased touch area on mobile
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Larger invisible touch area for easier interaction on mobile */}
        <div className={`absolute inset-0 bg-transparent ${isMobile ? 'w-16 -ml-8' : ''}`}></div>
        
        {/* Visible slider line */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/70 shadow-lg left-1/2 transform -translate-x-1/2">
          {/* Enhanced handle with better visibility and touch area */}
          <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white font-mono text-xs shadow-lg ${
            isMobile ? 'w-8 h-8 rounded-full' : 'w-6 h-6 rounded'
          }`}>
            {isMobile ? '⟷' : '<>'}
          </div>
        </div>
      </div>
    </div>
  );
};
