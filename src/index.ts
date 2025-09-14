import { WebSocketServer, WebSocket } from 'ws';
import { randomBytes } from 'crypto';

interface User {
  socket: WebSocket;
  room: string | null;
  id: string;
  messageTimestamps: number[];
}

const wss = new WebSocketServer({ port: 8080 });
let allSockets: User[] = [];

function generateRoomCode(): string {
  return randomBytes(3).toString('hex');
}


const MAX_MESSAGES = 10;
const TIME_WINDOW = 10_000;

function isRateLimited(user: User): boolean {
  const now = Date.now();
  user.messageTimestamps = user.messageTimestamps.filter((t) => now - t < TIME_WINDOW);
  if (user.messageTimestamps.length >= MAX_MESSAGES) return true;
  user.messageTimestamps.push(now);
  return false;
}

function broadcastRoomCount(roomId: string) {
  const count = allSockets.filter((u) => u.room === roomId).length;
  for (const user of allSockets) {
    if (user.room === roomId) {
      user.socket.send(
        JSON.stringify({
          type: 'roomCount',
          payload: { roomId, count },
        })
      );
    }
  }
}

wss.on('connection', (socket: WebSocket) => {
  const userId = randomBytes(4).toString('hex');
  let currentUser: User = { socket, room: null, id: userId, messageTimestamps: [] };
  allSockets.push(currentUser);

  socket.send(JSON.stringify({ type: 'init', payload: { userId } }));

  socket.on('message', (rawMessage: string) => {
    if (isRateLimited(currentUser)) {
      socket.send(JSON.stringify({ type: 'error', payload: { message: '⚠️ Too many messages, slow down.' } }));
      return;
    }

    let parsedMessage;
    try {
      parsedMessage = JSON.parse(rawMessage);
    } catch {
      return;
    }

    if (parsedMessage.type === 'create') {
      const newRoomCode = generateRoomCode();
      currentUser.room = newRoomCode;
      socket.send(JSON.stringify({ type: 'roomCreated', payload: { roomId: newRoomCode } }));
      broadcastRoomCount(newRoomCode);
    }

    if (parsedMessage.type === 'join') {
      currentUser.room = parsedMessage.payload.roomId;
      socket.send(JSON.stringify({ type: 'roomJoined', payload: { roomId: parsedMessage.payload.roomId } }));
      broadcastRoomCount(parsedMessage.payload.roomId);
    }

    if (parsedMessage.type === 'chat') {
      if (!currentUser.room) return;
      for (const user of allSockets) {
        if (user.room === currentUser.room) {
          user.socket.send(
            JSON.stringify({
              type: 'chat',
              payload: { message: parsedMessage.payload.message, senderId: currentUser.id },
            })
          );
        }
      }
    }
  });

  socket.on('close', () => {
    if (currentUser.room) {
      broadcastRoomCount(currentUser.room);
    }
    allSockets = allSockets.filter((u) => u.socket !== socket);
  });
});
