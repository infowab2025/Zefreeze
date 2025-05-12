import React, { useRef, useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureChange: (signatureDataUrl: string | null) => void;
  width?: number;
  height?: number;
  label?: string;
  clearLabel?: string;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureChange,
  width = 400,
  height = 200,
  label = 'Signature',
  clearLabel = 'Effacer'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Set canvas style
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [width, height]);
  
  const getCoordinates = (event: MouseEvent | TouchEvent): { x: number, y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in event) {
      // Touch event
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  };
  
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    const coordinates = getCoordinates(event.nativeEvent);
    if (coordinates) {
      ctx.beginPath();
      ctx.moveTo(coordinates.x, coordinates.y);
    }
  };
  
  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const coordinates = getCoordinates(event.nativeEvent);
    if (coordinates) {
      ctx.lineTo(coordinates.x, coordinates.y);
      ctx.stroke();
      setHasSignature(true);
    }
  };
  
  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    setIsDrawing(false);
    
    if (hasSignature) {
      const signatureDataUrl = canvas.toDataURL('image/png');
      onSignatureChange(signatureDataUrl);
    }
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setHasSignature(false);
    onSignatureChange(null);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={clearSignature}
          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          {clearLabel}
        </button>
      </div>
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          className="touch-none w-full"
          style={{ height: `${height}px` }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <p className="text-xs text-gray-500">
        Signez dans la zone ci-dessus en utilisant votre souris ou votre doigt
      </p>
    </div>
  );
};

export default SignatureCanvas;