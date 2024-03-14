import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<string | null>(null); // New state variable

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
    setUploading(true);
    try {
      const response = await fetch(
        "https://ittyekb4bb.execute-api.ap-southeast-1.amazonaws.com/dev/sortwise-new-images/image.png",
        {
          method: "PUT",
          body: imageBlob,
          headers: {
            "Content-Type": "image/png",
          },
        }
      );
      console.log("File upload response:", response);
      const responseDetails = {
        ok: response.ok,
        redirected: response.redirected,
        status: response.status,
        statusText: response.statusText,
        type: response.type,
      };
      setUploadResponse(JSON.stringify(responseDetails)); // Set the response
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResponse(error.message); // Set the error
    } finally {
      setUploading(false);
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
    <div className="flex justify-center items-center">
      <div className="flex flex-col items-center">
        {uploading ? (
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12 mb-4"></div>
        ) : (
          <div>{uploadResponse}</div> // Show the response or the error
        )}
        <style jsx>{`
          .loader {
            border-top-color: #3498db;
            animation: spinner 1.5s linear infinite;
          }

          @keyframes spinner {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
        <video ref={videoRef} autoPlay playsInline muted className="mb-4" />
        <canvas ref={canvasRef} className="hidden" />
        <button
          onClick={takePhoto}
          className="mb-4 bg-blue-500 text-white p-2 rounded"
        >
          Recycle Item
        </button>
      </div>
    </div>
  );
};

export default CameraFeed;