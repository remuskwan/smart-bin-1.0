import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const CameraFeed: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<React.ReactNode | null>(
    null
  );
  const [buttonText, setButtonText] = useState("Recycle Item");
  const [countdown, setCountdown] = useState<number | null>(null);

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
        status: response.status,
      };

      setButtonText("Recycle Another Item");
      setCountdown(10);
      setUploadResponse(
        <>
          <p className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-gray-900">
            Item Successfully Recycled
          </p>
          <pre>{JSON.stringify(responseDetails, null, 2)}</pre>
        </>
      ); // Set the response
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResponse((error as Error).message); // Set the error
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
            uploadImage(blob);
          }
        }, "image/png");
      }
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      router.push("/");
    } else {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId); // Clean up the timer
    }
  }, [countdown]);

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
        {countdown !== null && (
          <p className="mt-5 text-center text-3xl leading-9 tracking-tight text-gray-900">
            Returning to Main Screen in {countdown} ...
          </p>
        )}
        <button
          onClick={takePhoto}
          className="mt-5 rounded-md bg-blue-500 px-20 py-5 text-2xl font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default CameraFeed;
