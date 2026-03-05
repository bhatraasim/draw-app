# WebSocket Protocol Documentation

This document describes the WebSocket protocol used in the Draw App for real-time communication.

---

## Table of Contents

1. [Connection](#connection)
2. [Authentication](#authentication)
3. [Message Format](#message-format)
4. [Message Types](#message-types)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Connection

### WebSocket Endpoint

```
wss://draw.rasim.online/ws
```

### Connection URL Format

```
wss://draw.rasim.online/ws?token=<jwt_token>
```

The JWT token must be passed as a query parameter.

---

## Authentication

### Token Validation

1. Client connects with JWT token in query parameter
2. Server validates token using `JWT_SECRET`
3. If invalid, connection is closed with code 1008

### JWT Token Structure

```javascript
// Payload
{
  userId: "user123",
  email: "user@example.com",
  exp: 1732413156  // Expiration timestamp
}
```

### Connection Flow

```
Client                          Server
   |                              |
   |---- Connect (ws?token=...)-->|  Validate JWT
   |<---- Connection Accepted -----|  or
   |                              |
   |<---- Close (1008) ------------|  Invalid token
```

---

## Message Format

### JSON Structure

All messages are JSON strings with the following structure:

```typescript
// Outgoing (Client -> Server)
{
  type: string,
  [key: string]: any
}

// Incoming (Server -> Client)
{
  type: string,
  [key: string]: any
}
```

---

## Message Types

### Client -> Server Messages

#### 1. Join Room

Join a room to receive updates and send messages.

```json
{
  "type": "join_room",
  "roomId": "room-123"
}
```

**Response**: Server adds user to room's broadcast list.

---

#### 2. Leave Room

Leave a room to stop receiving updates.

```json
{
  "type": "leave_room",
  "roomId": "room-123"
}
```

**Response**: Server removes user from room's broadcast list.

---

#### 3. Chat / Shape

Send a chat message or shape data to a room.

```json
{
  "type": "chat",
  "roomId": "room-123",
  "message": "{\"type\":\"rect\",\"x\":100,\"y\":100,\"width\":50,\"height\":50}",
  "tempId": "temp-shape-123"
}
```

**Parameters**:

- `roomId`: Target room ID
- `message`: JSON stringified shape/chat data
- `tempId`: Temporary ID for optimistic updates

**Response**: Server broadcasts to all users in room.

---

#### 4. Delete

Delete a shape from a room.

```json
{
  "type": "delete",
  "roomId": "room-123",
  "shapeId": "shape-123"
}
```

**Parameters**:

- `roomId`: Room containing the shape
- `shapeId`: ID of shape to delete

**Response**: Server broadcasts deletion to all users in room.

---

### Server -> Client Messages

#### 1. Chat / Shape Broadcast

```json
{
  "type": "chat",
  "tempId": "temp-shape-123",
  "message": "{\"type\":\"rect\",\"x\":100,\"y\":100,\"width\":50,\"height\":50,\"id\":\"actual-id-123\"}",
  "roomId": "room-123"
}
```

**Note**: The `message` contains the shape with its actual ID from the database.

---

#### 2. Delete Broadcast

```json
{
  "type": "delete",
  "shapeId": "shape-123",
  "roomId": "room-123"
}
```

---

## Error Handling

### WebSocket Close Codes

| Code | Name             | Description             |
| ---- | ---------------- | ----------------------- |
| 1000 | Normal Closure   | Clean disconnect        |
| 1001 | Going Away       | Server is shutting down |
| 1002 | Protocol Error   | Malformed data          |
| 1008 | Policy Violation | Invalid JWT token       |
| 1011 | Unexpected Error | Server crash            |

### Error Response Format

```typescript
// Server logs error but doesn't send JSON to client
ws.on("error", console.error);

// Use close codes
ws.close(1008, "Invalid token");
```

---

## Examples

### JavaScript Client Connection

```javascript
// Create WebSocket connection
const token = localStorage.getItem("token");
const ws = new WebSocket(`wss://draw.rasim.online/ws?token=${token}`);

// Connection opened
ws.onopen = () => {
  console.log("Connected to WebSocket");

  // Join a room
  ws.send(
    JSON.stringify({
      type: "join_room",
      roomId: "my-room",
    }),
  );
};

// Listen for messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "chat":
      handleChatMessage(data);
      break;
    case "delete":
      handleDeleteMessage(data);
      break;
  }
};

// Handle errors
ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

// Handle close
ws.onclose = (event) => {
  console.log("Disconnected:", event.code, event.reason);
};

// Send chat/shape
function sendShape(shape) {
  ws.send(
    JSON.stringify({
      type: "chat",
      roomId: "my-room",
      message: JSON.stringify(shape),
      tempId: shape.id,
    }),
  );
}

// Delete shape
function deleteShape(shapeId) {
  ws.send(
    JSON.stringify({
      type: "delete",
      roomId: "my-room",
      shapeId,
    }),
  );
}

// Leave room (before disconnecting)
function leaveRoom() {
  ws.send(
    JSON.stringify({
      type: "leave_room",
      roomId: "my-room",
    }),
  );
}
```

### React Hook Example

```typescript
import { useEffect, useRef, useState } from "react";

export function useWebSocket(token: string, roomId: string) {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    // Connect
    ws.current = new WebSocket(`wss://draw.rasim.online/ws?token=${token}`);

    ws.current.onopen = () => {
      setConnected(true);
      // Join room
      ws.current?.send(JSON.stringify({ type: "join_room", roomId }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      // Leave room on cleanup
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "leave_room", roomId }));
        ws.current.close();
      }
    };
  }, [token, roomId]);

  const sendMessage = (message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { connected, messages, sendMessage };
}
```

### Python Client Example

```python
import websocket
import json
import jwt

# Generate token
token = jwt.encode(
    {"userId": "user123"},
    "your-jwt-secret",
    algorithm="HS256"
)

# Connect
ws = websocket.create_connection(
    f"wss://draw.rasim.online/ws?token={token}"
)

# Join room
ws.send(json.dumps({
    "type": "join_room",
    "roomId": "my-room"
}))

# Receive message
result = ws.recv()
data = json.loads(result)
print(data)

# Send shape
ws.send(json.dumps({
    "type": "chat",
    "roomId": "my-room",
    "message": json.dumps({"type": "rect", "x": 100, "y": 100}),
    "tempId": "temp-1"
}))

# Close
ws.close()
```

---

## Best Practices

### 1. Reconnection Logic

Implement automatic reconnection:

```javascript
function connect() {
  ws = new WebSocket(url);

  ws.onclose = () => {
    // Retry after 5 seconds
    setTimeout(connect, 5000);
  };
}
```

### 2. Message Queue

Queue messages when disconnected:

```javascript
const messageQueue = [];

function send(data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    messageQueue.push(data);
  }
}

// On open, flush queue
ws.onopen = () => {
  while (messageQueue.length) {
    ws.send(messageQueue.shift());
  }
};
```

### 3. Heartbeat

Keep connection alive:

```javascript
// Send ping every 30 seconds
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "ping" }));
  }
}, 30000);
```

---

## Security Considerations

### Token Expiration

- JWT tokens should expire after reasonable time (e.g., 24 hours)
- Client should handle token refresh via HTTP API

### Connection Validation

- Always validate JWT on connection
- Reject connections with invalid/missing tokens

### Message Validation

- Validate all incoming message types
- Sanitize message content before processing

---

## Troubleshooting

### Common Issues

| Issue                | Solution                             |
| -------------------- | ------------------------------------ |
| Connection refused   | Check server is running on port 8080 |
| 401 Unauthorized     | Verify JWT token is valid            |
| 301 Redirect         | Use correct WebSocket URL (wss://)   |
| Message not received | Ensure user joined the room          |

### Debug Mode

```javascript
// Enable debug logging
ws.onmessage = (event) => {
  console.log("Received:", event.data);
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};
```

---

## Version History

| Version | Date       | Changes                     |
| ------- | ---------- | --------------------------- |
| 1.0.0   | 2026-02-11 | Initial protocol definition |

---

## References

- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [RFC 6455 - WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [JWT.io](https://jwt.io/)
