
import { useEffect, useRef, useState } from 'react';
import './App.css';

interface ChatMessage {
  message: string;
  senderId: string;
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCount, setRoomCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'init') setUserId(data.payload.userId);
      if (data.type === 'roomCreated') {
        setRoomId(data.payload.roomId);
        alert(`Room created! Share this code: ${data.payload.roomId}`);
      }
      if (data.type === 'roomJoined') {
        setRoomId(data.payload.roomId);
        alert(`Joined room: ${data.payload.roomId}`);
      }
      if (data.type === 'chat') {
        setMessages((prev) => [...prev, { message: data.payload.message, senderId: data.payload.senderId }]);
      }
      if (data.type === 'error') alert(data.payload.message);
      if (data.type === 'roomCount') {
        setRoomCount(data.payload.count);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleCreateRoom = () => {
    wsRef.current?.send(JSON.stringify({ type: 'create' }));
  };

  const handleJoinRoom = () => {
    const input = prompt("Enter room code:");
    if (input) {
      wsRef.current?.send(JSON.stringify({ type: 'join', payload: { roomId: input } }));
    }
  };

  const handleSendMessage = () => {
    const input = document.getElementById("message") as HTMLInputElement;
    const message = input?.value;
    if (message && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "chat", payload: { message } }));
      input.value = "";
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("⚠️ Are you sure? Once deleted, chat history cannot be recovered!")) {
      setMessages([]);
    }
  };

  return (
    <div className='h-screen bg-black flex flex-col'>
      {/* Chat area */}
      <div className='flex-1 bg-blue-100 overflow-y-auto p-3'>
        {messages.map((msg, index) => {
          const isMine = msg.senderId === userId;
          return (
            <div key={index} className={`flex w-full mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-2 rounded-lg max-w-[60%] break-words shadow ${
                  isMine ? "bg-purple-600 text-white text-right" : "bg-white text-black text-left"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="w-full bg-gray-200 p-2 flex justify-between items-center">
        <div className="flex gap-4">
          <button onClick={handleCreateRoom} className='bg-green-600 text-white p-2 rounded'>
            Create Room
          </button>
          <button onClick={handleJoinRoom} className='bg-blue-600 text-white p-2 rounded'>
            Join Room
          </button>
        </div>
        <button onClick={handleClearHistory} className='bg-red-600 text-white p-2 rounded'>
          Clear History
        </button>
        {roomId && (
          <span className="ml-2 text-black">
            Room: {roomId} | Users: {roomCount}
          </span>
        )}
      </div>

      {/* Input */}
      <div className='w-full bg-white flex'>
        <input
          id="message"
          className='flex-1 p-2 border border-gray-300'
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage} className='bg-purple-600 text-white p-4'>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
