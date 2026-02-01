import { useEffect, useRef, useState } from "react";
import { logger } from "@/lib/logger";

interface UseWebSocketOptions {
  url: string;
  onMessage?: (event: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnect = true,
  reconnectInterval = 3000,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(reconnect);

  // Keep latest callbacks without forcing a reconnect when they change
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    shouldReconnectRef.current = reconnect;
  }, [reconnect]);

  const connect = () => {
    try {
      const ws = new WebSocket(url);
      // Ensure consistent message payload type across browsers
      ws.binaryType = "blob";
      wsRef.current = ws;

      ws.onopen = (event) => {
        logger.log("WebSocket connected");
        setIsConnected(true);
        onOpenRef.current?.(event);
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
        onMessageRef.current?.(event);
      };

      ws.onclose = (event) => {
        logger.log("WebSocket disconnected");
        setIsConnected(false);
        onCloseRef.current?.(event);

        // Attempt to reconnect if enabled
        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            logger.log("Attempting to reconnect...");
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        logger.error("WebSocket error:", event);
        onErrorRef.current?.(event);
      };

    } catch (error) {
      logger.error("Failed to create WebSocket:", error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  const sendMessage = (
    data: string | ArrayBuffer,
    messageType: string
  ) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(
        {
          type: messageType,
          content: data,
          timestamp: Date.now().valueOf()
        }
      )
      logger.log("Sending message:", message);
      wsRef.current.send(message)
    } else {
      logger.warn("WebSocket is not connected");
    }
  };

  const disconnect = () => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}
