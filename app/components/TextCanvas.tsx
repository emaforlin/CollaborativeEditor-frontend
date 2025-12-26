import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import { useWebSocket } from "~/hooks/useWebSocket";

export default function TextCanvas() {
  const [content, setContent] = useState<string>("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const WS_URL = token
    ? `ws://localhost:9001/ws/document/sandbox?token=${token}`
    : "ws://localhost:9001/ws/document/sandbox";

  const handleMessage = useCallback((event: MessageEvent) => {
    const raw = event.data as unknown;
    console.log("Received message:", raw);
    if (typeof raw === "string") {
      try {
        const data = JSON.parse(raw);
        if (data.type === "content-update" && data.content !== undefined) {
          setContent(data.content);
        }
      } catch (error) {
        console.error("Failed to parse text message:", error);
      }
      return;
    }

    if (raw instanceof Blob) {
      raw
        .text()
        .then((text) => {
          try {
            const data = JSON.parse(text);
            if (data.type === "content-update" && data.content !== undefined) {
              setContent(data.content);
            }
          } catch (error) {
            console.error("Failed to parse blob message:", error);
          }
        })
        .catch((err) => console.error("Failed to read blob:", err));
      return;
    }

    if (raw instanceof ArrayBuffer) {
      try {
        const text = new TextDecoder().decode(new Uint8Array(raw));
        const data = JSON.parse(text);
        if (data.type === "content-update" && data.content !== undefined) {
          setContent(data.content);
        }
      } catch (error) {
        console.error("Failed to parse arraybuffer message:", error);
      }
      return;
    }

    console.warn("Unsupported message data type", raw);
  }, []);

  const { isConnected, sendMessage, lastMessage } = useWebSocket({
    url: WS_URL,
    onMessage: handleMessage,
    onOpen: () => {
      console.log("Connected to collaborative editor");
    },
    onClose: () => {
      console.log("Disconnected from collaborative editor");
    },
    reconnect: true,
    reconnectInterval: 3000,
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Send the updated content to the WebSocket server
    if (isConnected) {
      sendMessage(
        JSON.stringify({
          type: "content-update",
          content: newContent,
          timestamp: Date.now(),
        })
      );
    }
  };

  return (
    <div className="border-2 w-[70%] h-full relative">
      {/* Connection status indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            isConnected
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          />
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      <textarea
        name="canvas"
        id="canvas"
        className={`w-full h-full bg-gray-800 p-2 
          ${!isConnected ? " text-gray-500" : ""}
          focus:outline-none resize-none`}
        onChange={handleContentChange}
        disabled={!isConnected}
        value={content}
      />
    </div>
  );
}
