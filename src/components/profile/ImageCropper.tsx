import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { NeonButton } from "@/components/ui/neon-button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCw, Check, X, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  fileName: string;
  fileSize: number;
  onCropComplete: (croppedImage: Blob) => void;
}

// Helper function to create cropped image
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size to the crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      },
      "image/jpeg",
      0.95
    );
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const ImageCropper: React.FC<ImageCropperProps> = ({
  open,
  onClose,
  imageSrc,
  fileName,
  fileSize,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5 text-primary" />
            Ajustar foto de perfil
          </DialogTitle>
        </DialogHeader>

        {/* File info */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 text-sm">
          <span className="text-muted-foreground truncate max-w-[200px]">
            {fileName}
          </span>
          <span className="font-medium text-primary">
            {formatFileSize(fileSize)}
          </span>
        </div>

        {/* Cropper area */}
        <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-black/50">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Zoom control */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-2">
            <NeonButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="w-4 h-4 mr-1" />
              Rotar
            </NeonButton>
            <NeonButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetCrop}
            >
              Restablecer
            </NeonButton>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <NeonButton
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </NeonButton>
          <NeonButton
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 sm:flex-none"
          >
            {isProcessing ? (
              "Procesando..."
            ) : (
              <>
                <Check className="w-4 h-4 mr-1" />
                Guardar
              </>
            )}
          </NeonButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
