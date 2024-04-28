import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface InferenceResult {
  IsRecyclable: number;
  RecyclableComponents: Component[];
  NonRecyclableComponents: Component[];
}

interface Component {
  MaterialType: string;
  AdditionalInfo: Notes;
  ItemType: string;
  Recyclable: boolean;
}

interface Notes {
  Notes: string;
}

/**
 *
 * @returns InferenceResult | null
 */
export const useInferenceSubscription = () => {
  const [subscribedResults, setSubscribedResults] =
    useState<InferenceResult | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const url: string = `${
      process.env.FOG_SERVICES_URL ?? "ws://127.0.0.1:5000"
    }/ws`;

    const websocket = new WebSocket(url);

    websocket.onopen = () => {
      console.log("connected");
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      setSubscribedResults(data);
    };

    return () => {
      websocket.close();
    };
  }, [queryClient]);

  return subscribedResults;
};
