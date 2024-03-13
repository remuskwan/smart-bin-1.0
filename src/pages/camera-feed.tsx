import React, { useEffect, useRef, useState } from "react";

const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const getVideo = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    };

    getVideo();
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        const { videoWidth, videoHeight } = videoRef.current;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

        // Convert canvas to image
        const imageDataUrl = canvasRef.current.toDataURL("image/png");
        setImage(imageDataUrl);
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center">
        <video ref={videoRef} autoPlay playsInline muted className="mb-4" />
        <canvas ref={canvasRef} className="hidden" />
        <button
          onClick={takePhoto}
          className="mb-4 bg-blue-500 text-white p-2 rounded"
        >
          Take Photo
        </button>
        {image && <img src={image} alt="Captured frame" className="mt-4" />}
      </div>
    </div>
  );
};

export default CameraFeed;
