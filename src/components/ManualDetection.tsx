import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Undo, RotateCcw, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Point {
  x: number;
  y: number;
}

interface ManualDetectionProps {
  imageUrl: string;
  onMaskCreated: (maskData: ImageData) => void;
  onCancel: () => void;
}

export const ManualDetection: React.FC<ManualDetectionProps> = ({
  imageUrl,
  onMaskCreated,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const isMobile = useIsMobile();

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      setImageDimensions({ width: img.width, height: img.height });

      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Set up drawing style - thicker lines for mobile
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = isMobile ? 6 : 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    img.src = imageUrl;
  }, [imageUrl, isMobile]);

  React.useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  React.useEffect(() => {
    redrawCanvas();
  }, [points]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    setPoints(prev => [...prev, coords]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || points.length === 0) return;

    // Redraw everything to show existing lines
    redrawCanvas();

    // Draw preview line from last point to current mouse position
    const coords = getCanvasCoordinates(e);
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = isMobile ? 8 : 4; // Even thicker for preview on mobile
    ctx.setLineDash([5, 10]); // Dashed line for preview
    
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    ctx.setLineDash([]); // Reset line dash
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageRef.current) return;

    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);
      
    // --- Draw the polygon lines ---
    if (points.length > 1) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = isMobile ? 8 : 4; // Thicker lines for mobile
      
      // Enhanced shadow for better visibility on mobile
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = isMobile ? 8 : 5;
      ctx.shadowOffsetX = isMobile ? 3 : 2;
      ctx.shadowOffsetY = isMobile ? 3 : 2;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      
      // Reset shadow for other drawings
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // --- Draw the points (nodes) ---
    points.forEach((point) => {
        ctx.beginPath();
        // Larger points for mobile
        const pointSize = isMobile ? 10 : 6;
        ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = isMobile ? 4 : 2;
        ctx.stroke();
    });
  };

  const handleUndo = () => {
    setPoints(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPoints([]);
    initializeCanvas();
  };

  const handleComplete = () => {
    if (points.length < 3) {
      alert('Please draw at least 3 points to create a boundary');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use getImageData to get the raw pixel data of the drawing.
    // This is a more direct and reliable representation of what the user drew.
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.beginPath();
    maskCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      maskCtx.lineTo(points[i].x, points[i].y);
    }
    maskCtx.closePath();
    maskCtx.fillStyle = 'white';
    maskCtx.fill();

    const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    onMaskCreated(maskImageData);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Draw Floor Boundary</h3>
        <p className="text-sm text-muted-foreground">
          Tap on the corners of your driveway to create a boundary.
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        <Button onClick={handleUndo} variant="outline" size="sm">
          <Undo className="w-4 h-4 mr-1" />
          Undo
        </Button>
        <Button onClick={handleClear} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear
        </Button>
        <Button onClick={handleComplete} variant="default" size="sm">
          <Check className="w-4 h-4 mr-1" />
          Complete
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>

      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto mx-auto block cursor-crosshair"
          style={{ maxHeight: '500px' }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
        />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Points drawn: {points.length}
      </div>
    </div>
  );
};
