import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

interface CameraFeedProps {
  userId?: string; // The '?' makes userId optional
}

const CameraFeed: React.FC<CameraFeedProps> = ({ userId: propUserId }) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<React.ReactNode | null>(
    null
  );
  const [buttonText, setButtonText] = useState("Recycle Item"); // Toggles between Recycle Item / Recycle Another Item
  const [countdown, setCountdown] = useState<number | null>(null); //Countdown to reset to main screen
  const [userId, setUserId] = useState(propUserId); //To be used for the userID logged in
  const [imageUrl, setImageUrl] = useState<string | null>(null); // State Variable for showing captured image

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

  //Helper function to sleep for a certain time
  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //Helper function to reset feed
  const restartVideo = async () => {
    if (videoRef.current) {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = mediaStream;
    }
  };

  //If the image is removed and hidden, restart the video
  useEffect(() => {
    if (imageUrl === null && videoRef.current) {
      restartVideo();
    }
  }, [imageUrl]);

  const uploadImage = async (imageBlob: Blob) => {
    setUploading(true);
    const id = Math.random().toString(36).substring(2); // Generate a random ID
    console.log(id);
    try {
      /* 1st API to generate link for upload */

      // First, get the pre-signed URL

      const urlToCall = userId
        ? `http://localhost:8000/image/generate-presigned-url?action=put&file_name=${id}.png&content_type=image/png&user_id=${userId}`
        : `http://localhost:8000/image/generate-presigned-url?action=put&file_name=${id}.png&content_type=image/png`;

      console.log(urlToCall);
      const presignedResponse = await fetch(urlToCall);

      if (!presignedResponse.ok) {
        throw new Error(
          `Error generating pre-signed URL: ${presignedResponse.status}`
        );
      }

      const { url: presignedUrl, objectName: objectName } =
        await presignedResponse.json();

      console.log(objectName);

      console.log(presignedUrl);

      /* 2nd API to upload it to AWS */

      // Then, upload the file using the pre-signed URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: imageBlob,
        headers: {
          "Content-Type": "image/png",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Error uploading file: ${uploadResponse.status}`);
      }

      console.log("File upload response:", uploadResponse);
      console.log("URL:", uploadResponse.url);

      const responseDetails = {
        ok: uploadResponse.ok,
        status: uploadResponse.status,
      };

      /* 3rd API to get the inference result after 30 seconds */

      const objectKey = objectName;
      const encodedObjectKey = encodeURIComponent(objectKey);
      const inferenceAPI = `http://localhost:8000/image/metadata/${encodedObjectKey}`;

      console.log("waiting 30 seconds");
      await sleep(30000); // 30 seconds
      console.log("calling inference");

      const inferenceResponse = await fetch(inferenceAPI);

      if (!inferenceResponse.ok) {
        throw new Error(
          `Error getting inference result: ${inferenceResponse.status}`
        );
      }
      const inferenceData = await inferenceResponse.json();

      // console.log("sleep");
      console.log(inferenceData);

      setButtonText("Recycle Another Item");

      if (inferenceData[0] && inferenceData[0].InferenceResults) {
        setUploadResponse(
          <>
            <p className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-green-900">
              Item Successfully Recycled
            </p>
            <pre>{JSON.stringify(inferenceData, null, 2)}</pre>
          </>
        );
      } else {
        setUploadResponse(
          <>
            <p className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-red-900">
              Unable to infer the object.
            </p>
            <pre>{JSON.stringify(inferenceData, null, 2)}</pre>
          </>
        );
      }

      // setCountdown(10);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResponse((error as Error).message); // Set the error
      setButtonText("Recycle Another Item");
    } finally {
      setUploading(false);
    }
  };

  //Button Function
  const takePhoto = () => {
    // If the button text is "Recycle Another Item", reset the state back to its initial (Hide previous photo captured and show the video again)
    if (buttonText === "Recycle Another Item") {
      setCountdown(null);
      setUploading(false);
      setUploadResponse(null);
      setButtonText("Recycle Item");
      setImageUrl(null);
      return;
    }

    //Eles if the button is "Recycle Item", it takes the photo and send it to server
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
            setImageUrl(objectUrl); // Set the image URL
            uploadImage(blob);
          }
        }, "image/png");
      }
    }
  };

  //Once countdown reaches 0, redirect back to home.
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
        {imageUrl ? (
          <img src={imageUrl} className="mb-4" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="mb-4" />
        )}
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
