import crypto from 'crypto';
import { users, rooms } from './db.js';

export const createUser = (user) => {
    const newUser = { ...user, index: crypto.randomUUID() };
    users.push(newUser);
    return newUser;
}

export const stamp = () => new Date().toISOString();

export const sendJson = (ws, payload) => {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(payload));
    }
};

export function createRoom(user) {
  const room = {
    roomId: crypto.randomUUID(), 
    roomUsers: [{ name: user.name, index: user.index }]
  };
  rooms.push(room);
  return room;
}
