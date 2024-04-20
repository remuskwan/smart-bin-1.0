import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import sleep from "@/utils/sleep";
import { useInferenceSubscription } from "@/hooks/subscribe.hook";

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
  const [displayMessage, setDisplayMessage] = useState("Camera Feed");
  const [messageColor, setMessageColor] = useState("black");

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

      const urlToCall = `http://192.168.43.47:8000/image/generate-presigned-url?action=put&file_name=${id}.png&content_type=image/png${
        userId ? `&user_id=${userId}` : ""
      }`;

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
      setDisplayMessage("Camera Feed");
      setMessageColor("black");
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

  //Subscribe to the inference result
  //If null, dont display anything
  const subscribedResults = useInferenceSubscription();

  useEffect(() => {
    if (subscribedResults !== null) {
      setButtonText("Recycle Another Item");
      setCountdown(10);
      const { IsRecyclable, RecyclableComponents, NonRecyclableComponents } =
        subscribedResults;
      if (
        IsRecyclable === 0 &&
        RecyclableComponents.length === 0 &&
        NonRecyclableComponents.length === 0
      ) {
        setDisplayMessage("Item not detected");
        setMessageColor("red");
      } else if (
        IsRecyclable === 0 &&
        RecyclableComponents.length === 0 &&
        NonRecyclableComponents.length > 0
      ) {
        const material = NonRecyclableComponents[0].MateMaterialTyperial;
        const item = NonRecyclableComponents[0].ItemType;
        //if material is not null then diplay
        if (material && item) {
          setDisplayMessage(
            `${item} - ${material} is non-recyclable, it will be sorted into non-recyclable bin.`
          );
        } else {
          setDisplayMessage(
            `${item} is non-recyclable, it will be sorted into non-recyclable bin.`
          );
        }
        setMessageColor("green");
      } else if (
        IsRecyclable === 1 &&
        RecyclableComponents.length > 0 &&
        NonRecyclableComponents.length === 0
      ) {
        const material = RecyclableComponents[0].MateMaterialTyperial;
        const item = RecyclableComponents[0].ItemType;
        //if material is not null then diplay
        if (material && item) {
          setDisplayMessage(
            `${item} - ${material} is recyclable, it will be sorted into non-recyclable bin.`
          );
        } else {
          setDisplayMessage(
            `${item} is recyclable, it will be sorted into recyclable bin.`
          );
        }
        setMessageColor("green");
      }
    }
  }, [subscribedResults]);

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col items-center">
        <h1 className={`text-xl font-bold text-center text-${messageColor}`}>
          {displayMessage}
        </h1>
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
          <img alt={"Uploaded image"} src={imageUrl} className="mb-4" />
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
