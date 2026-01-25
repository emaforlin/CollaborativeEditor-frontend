import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router";
import { useWebSocket } from "@/hooks/useWebSocket";
import * as Y from "yjs";
import { useAuthContext } from "@/context/AuthContext";

// Sync protocol message types
const MSG_TYPE_SYNC_REQUEST = "sync_request";
const MSG_TYPE_SYNC_RESPONSE = "sync_response";
const MSG_TYPE_SYNC_INIT = "sync_init";
const MSG_TYPE_SYNC_ACK = "sync_ack";
const MSG_TYPE_YJS_UPDATE = "yjs_update";

interface SyncRequestPayload {
  type: string;
  requester_id: string;
}

interface SyncInitPayload {
  type: string;
  source: "db" | "peer";
  state: string; // Base64 encoded Yjs state
}

export default function TextCanvas() {
  const [content, setContent] = useState<string>("");
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const { token, user } = useAuthContext();

  // A Yjs document holds the shared data - use ref to persist across renders
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);

  // Unique client ID to identify own messages
  const sub = user?.sub ?? "";
  const clientIdRef = useRef(sub);

  // Update ref when user loads
  useEffect(() => {
    clientIdRef.current = sub;
  }, [sub]);

  if (!ydocRef.current) {
    ydocRef.current = new Y.Doc();
    ytextRef.current = ydocRef.current.getText("quill");
  }

  const ydoc = ydocRef.current;
  const ytext = ytextRef.current;

  const WS_URL = token
    ? `ws://localhost:9001/ws/document/sandbox?token=${token}`
    : "ws://localhost:9001/ws/document/sandbox";

  // Use ref to break circular dependency between handleMessage and useWebSocket's sendMessage
  const sendMessageRef = useRef<
    ((data: string | ArrayBuffer, messageType: string) => void) | null
  >(null);

  // Helper to encode Yjs state to base64
  const encodeYjsState = (state: Uint8Array): string => {
    // Convert Uint8Array to base64 string
    let binary = "";
    for (let i = 0; i < state.length; i++) {
      binary += String.fromCharCode(state[i]);
    }
    return btoa(binary);
  };

  // Helper to decode base64 to Yjs state
  const decodeYjsState = (base64: string): Uint8Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  // Handle sync_request: existing client responds with their Yjs state
  const handleSyncRequest = useCallback((payload: SyncRequestPayload) => {
    console.log("📤 Received sync_request from new collaborator:", payload.requester_id);

    if (!ydoc) {
      console.warn("Cannot respond to sync_request: Yjs doc not initialized");
      return;
    }

    // Encode the full Yjs document state
    const state = Y.encodeStateAsUpdate(ydoc);
    const stateBase64 = encodeYjsState(state);

    console.log("📦 Sending sync_response with state size:", state.byteLength);

    // Send sync_response with our state
    const response = {
      type: MSG_TYPE_SYNC_RESPONSE,
      target_id: payload.requester_id,
      state: stateBase64,
    };

    sendMessageRef.current?.(JSON.stringify(response), MSG_TYPE_SYNC_RESPONSE);
  }, [ydoc]);

  // Handle sync_init: new client receives initial state
  const handleSyncInit = useCallback((payload: SyncInitPayload) => {
    console.log("📥 Received sync_init, source:", payload.source);

    if (!ydoc) {
      console.warn("Cannot apply sync_init: Yjs doc not initialized");
      return;
    }

    if (payload.source === "peer" && payload.state) {
      // Received state from existing collaborator
      try {
        const state = decodeYjsState(payload.state);
        Y.applyUpdate(ydoc, state, 'remote');
        console.log("✅ Applied peer sync state, size:", state.byteLength);
      } catch (error) {
        console.error("Failed to apply peer sync state:", error);
      }
    } else if (payload.source === "db") {
      // First collaborator - should fetch from documents service
      // For now, the document is empty (initial state)
      // TODO: Fetch document content from API if needed
      console.log("📄 First collaborator - using empty/local state");
    }

    // Mark as synced
    setIsSynced(true);

    // Send sync_ack to confirm sync is complete
    sendMessageRef.current?.("", MSG_TYPE_SYNC_ACK);
    console.log("✅ Sent sync_ack");
  }, [ydoc]);

  // Handle Yjs updates from other clients
  const handleYjsUpdate = useCallback((content: string | Uint8Array) => {
    if (!ydoc) return;

    try {
      let update: Uint8Array;

      if (typeof content === "string") {
        // Base64 encoded update
        update = decodeYjsState(content);
      } else {
        update = content;
      }

      Y.applyUpdate(ydoc, update, 'remote');
      console.log("✅ Applied remote Yjs update, size:", update.byteLength);
    } catch (error) {
      console.error("Failed to apply Yjs update:", error);
    }
  }, [ydoc]);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const { data } = event;
      console.log("Received message from Realtime Gateway", data);

      // Handle Blob (binary) messages
      if (data instanceof Blob) {
        console.log("Received Blob message, size:", data.size);
        // Convert Blob to ArrayBuffer for Yjs updates
        data.arrayBuffer().then((buffer) => {
          handleYjsUpdate(new Uint8Array(buffer));
        });
        return;
      }

      // Handle string messages
      if (typeof data === "string") {
        try {
          const parsedMessage = JSON.parse(data);

          if (parsedMessage === null) {
            console.warn("Received null message from Realtime Gateway");
            return;
          }

          switch (parsedMessage.type) {
            case MSG_TYPE_SYNC_REQUEST:
              handleSyncRequest(parsedMessage as SyncRequestPayload);
              break;

            case MSG_TYPE_SYNC_INIT:
              handleSyncInit(parsedMessage as SyncInitPayload);
              break;

            case MSG_TYPE_YJS_UPDATE:
              // Yjs update from another client (via NATS broadcast)
              if (parsedMessage.content) {
                console.log("parsed message", parsedMessage)
                handleYjsUpdate(parsedMessage.content);
              }
              break;

            default:
              console.log("Parsed Message:", parsedMessage);
              console.warn("Unsupported message type received:", parsedMessage.type);
          }
        } catch (error) {
          console.error("Error parsing JSON message:", error);
        }
      }
    },
    [handleSyncRequest, handleSyncInit, handleYjsUpdate]
  );

  const { isConnected, sendMessage, lastMessage } = useWebSocket({
    url: WS_URL,
    onMessage: handleMessage,
    onOpen: () => {
      console.log("Connected to collaborative editor");
      // The server will automatically send sync_init or request sync from peers
      // No need to manually send sync_request from client anymore
    },
    onClose: () => {
      console.log("Disconnected from collaborative editor");
      setIsSynced(false);
    },
    reconnect: true,
    reconnectInterval: 3000,
  });

  // Update the ref so callbacks can use it
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Listen to Yjs document updates and send differential updates via WebSocket
  useEffect(() => {
    if (!ydoc) return;

    const handleUpdate = (update: Uint8Array, origin: any) => {
      // Only send updates that originated locally (not from remote) and after we're synced
      if (origin !== "remote" && sendMessageRef.current && isSynced) {
        console.log("Sending Yjs update, size:", update.byteLength);
        // Encode as base64 and send
        const stateBase64 = encodeYjsState(update);
        sendMessageRef.current(stateBase64, MSG_TYPE_YJS_UPDATE);
      }
    };

    ydoc.on("update", handleUpdate);

    return () => {
      ydoc.off("update", handleUpdate);
    };
  }, [ydoc, isSynced]);

  // Sync React state with Yjs text content
  useEffect(() => {
    if (!ytext) return;

    const handleTextChange = () => {
      setContent(ytext.toString());
    };

    ytext.observe(handleTextChange);
    // Set initial content
    setContent(ytext.toString());

    return () => {
      ytext.unobserve(handleTextChange);
    };
  }, [ytext]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;

    if (!ytext || !isConnected || !isSynced) return;

    // Update Yjs text - this will trigger the 'update' event which sends the diff
    ydoc.transact(() => {
      ytext.delete(0, ytext.length);
      ytext.insert(0, newContent);
    });
  };

  // Determine the connection status for display
  const getStatusDisplay = () => {
    if (!isConnected) {
      return { text: "Disconnected", color: "bg-red-500/20 text-red-400", dot: "bg-red-400" };
    }
    if (!isSynced) {
      return { text: "Syncing...", color: "bg-yellow-500/20 text-yellow-400", dot: "bg-yellow-400" };
    }
    return { text: "Connected", color: "bg-green-500/20 text-green-400", dot: "bg-green-400" };
  };

  const status = getStatusDisplay();

  return (
    <div className="border-2 w-[70%] h-full relative">
      {/* Connection status indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${status.color}`}>
          <div className={`w-2 h-2 rounded-full ${status.dot}`} />
          {status.text}
        </div>
      </div>
      <textarea
        name="canvas"
        id="canvas"
        className={`w-full h-full bg-gray-800 p-2 text-white
          ${!isConnected || !isSynced ? " text-gray-500" : ""}
          focus:outline-none resize-none`}
        onChange={handleContentChange}
        disabled={!isConnected || !isSynced}
        value={content}
      />

    </div>
  );
}
