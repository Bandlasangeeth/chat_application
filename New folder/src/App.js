import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// import { useEffect,useRef,useState} from 'react';
// import './App.css'
// const ws=new WebSocket("http://localhost:3000");
// function App() {
//   const [Messages,setMessages]=useState(["hi there","hello"]);
//   const wsRef=useRef();
//   useEffect(()=>{
//     const ws=new WebSocket("http://localhost:3000");
//     ws.onmessage=(event)=>{
//       setMessages(m=>[...m,event.data])
//       wsRef.current=ws;
//       ws.onopen=()=>{
//         ws.send((JSON.stringify{
//           type:"join",
//           payload:{
//             roomId:"red"
//           }
//         }))
//     }
//   },[])
//   return(
//     <div className='h-screen bg-black '>
//       <div className='h-[90vh] bg-blue-100'>
//         <br/><br/>
//         {Messages.map(message=><div className='m-5'>
//           <span className='bg-white text-black rounded p-2 m-3'>
//             {message}
//           </span>
//         </div>)}
//       </div>
//       <div className='w-full bg-white flex '>
//         <input id="message" className='flex-1'></input>
//         <button onClick={()=>{
//           const message=document.getElementById("message")?.value;
//           wsRef.current.send(JSON.stringify({
//             type:"chat",
//             payload:{
//               message:message
//             }
//           }))
//         }}
//         className='bg-purple-600 text-white p-4'>send message</button>
//       </div>
//     </div>
//   )
// }
// export default App
import { useEffect, useRef, useState } from 'react';
import './App.css';
function App() {
    const [messages, setMessages] = useState(["hi there", "hello"]);
    const wsRef = useRef(null);
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:3000"); // Use ws:// not http:// for WebSocket
        wsRef.current = ws;
        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: "join",
                payload: {
                    roomId: "red"
                }
            }));
        };
        ws.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };
        ws.onerror = (err) => {
            console.error("WebSocket error:", err);
        };
        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };
        return () => {
            ws.close();
        };
    }, []);
    const handleSendMessage = () => {
        const input = document.getElementById("message");
        const message = input?.value;
        if (message && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "chat",
                payload: {
                    message: message
                }
            }));
            input.value = ""; // Clear input after sending
        }
    };
    return (_jsxs("div", { className: 'h-screen bg-black', children: [_jsxs("div", { className: 'h-[90vh] bg-blue-100 overflow-y-auto', children: [_jsx("br", {}), _jsx("br", {}), messages.map((message, index) => (_jsx("div", { className: 'm-5', children: _jsx("span", { className: 'bg-white text-black rounded p-2 m-3', children: message }) }, index)))] }), _jsxs("div", { className: 'w-full bg-white flex', children: [_jsx("input", { id: "message", className: 'flex-1 p-2 border border-gray-300', placeholder: "Type your message..." }), _jsx("button", { onClick: handleSendMessage, className: 'bg-purple-600 text-white p-4', children: "Send Message" })] })] }));
}
export default App;
//# sourceMappingURL=App.js.map