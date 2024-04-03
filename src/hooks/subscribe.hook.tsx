import { useQueryClient } from "@tanstack/react-query";
import React from "react";

export const useQuerySubscription = () => {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const url: string = `ws://${
      process.env.FOG_SERVICES_URL ?? "127.0.0.1:8000"
    }`;

    const websocket = new WebSocket(url);

    websocket.onopen = () => {
      console.log("connected");
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      const queryKey = [...data.entity, data.id].filter(Boolean);
      queryClient.invalidateQueries({ queryKey });
    };

    return () => {
      websocket.close();
    };
  }, [queryClient]);
};
