import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  const uploadImage = async (imageBlob: Blob) => {
    try {
      const response = await fetch(
        "https://ittyekb4bb.execute-api.ap-southeast-1.amazonaws.com/dev/sortwise-new-images/image.png",
        {
          method: "PUT",
          body: imageBlob,
          headers: {
            "Content-Type": "image/png", // or the specific type of your image
          },
        }
      );
      const data = await response;
      console.log("File upload response:", data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        const { videoWidth, videoHeight } = videoRef.current;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

        // Convert canvas to image and then to blob
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            setImage(objectUrl);
            uploadImage(blob);
          }
        }, "image/png");
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
        {image && (
          <Image
            src={image}
            alt="Captured frame"
            className="mt-4"
            width={500}
            height={300}
          />
        )}
      </div>
    </div>
  );
};

export default CameraFeed;
