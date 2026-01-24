"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hook/useSocket";

function ChatRoomClient({ messages, id }: { messages: {message:string}[], id: string }) {
  const { socket, loading } = useSocket()
  const [currentMessage, setCurrentMessage] = useState("")
  const [chat, setChat] = useState(messages)

  useEffect(() => {
    if (socket && !loading) {
      // Join room once when socket connects
      socket.send(JSON.stringify({ type: "join_room", roomId: id }))
      
      // Handle incoming messages
      socket.onmessage = (event) => {
        const ParsedData = JSON.parse(event.data)
        if (ParsedData.type === "chat") {
          setChat((prevChats) => [...prevChats, { message: ParsedData.message }])
        }
      }
    }
  }, [socket, loading, id])

  const sendMessage = () => {
    if (socket && currentMessage.trim()) {
      // Send message to WebSocket
      socket.send(JSON.stringify({ 
        type: "chat", 
        message: currentMessage, 
        roomId: id 
      }))
      
      // Clear the input immediately (no optimistic update)
      setCurrentMessage("")
    }
  }

  return (
    <div>
      {chat.map((msg, index) => (
        <div key={index}>
          {msg.message}
        </div>
      ))}

      <input 
        type="text" 
        value={currentMessage} 
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={()=> { 
        socket?.send(JSON.stringify({ type: "chat", message: currentMessage, roomId: id })) 
        setCurrentMessage("")
      }}>
        Send
      </button>
    </div>
  )
}

export default ChatRoomClient
