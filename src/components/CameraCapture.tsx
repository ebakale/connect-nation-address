import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (file: File, dataUrl: string) => void;
  onClose?: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const start = async () => {
      setError("");
      try {
        const constraints: MediaStreamConstraints = {
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        console.error("Camera error", e);
        setError("Unable to access camera. Please check permissions or use Upload.");
        toast({
          title: "Camera unavailable",
          description: "We couldn't access your camera. You can still upload a photo.",
          variant: "destructive",
        });
      }
    };
    start();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [toast]);

  const capture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
      const reader = new FileReader();
      reader.onload = () => {
        onCapture(file, reader.result as string);
        onClose?.();
      };
      reader.readAsDataURL(file);
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full bg-muted rounded-lg overflow-hidden">
        <video ref={videoRef} playsInline className="w-full h-full object-cover" />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <div className="flex gap-2 justify-center">
        <Button type="button" onClick={capture}>Capture</Button>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        )}
      </div>
    </div>
  );
}
