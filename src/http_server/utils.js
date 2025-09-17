import crypto from 'crypto';
import { users, rooms } from './db.js';

export const getRandomUUID = _ => crypto.randomUUID();

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

export function createRoom(user, ws) {
    const room = {
        roomId: crypto.randomUUID(),
        roomUsers: [{ name: user.name, index: user.index, ws }]
    };
    rooms.push(room);
    return room;
}

export function addUserToRoom(user, id, ws) {
    rooms.forEach(room => {
        if (room.roomId === id) {
            room.roomUsers.push({ name: user.name, index: user.index, ws })
        }
    })
}

export function getPublicRooms(rooms) {
    return rooms.map(room => ({
    roomId: room.roomId,
    roomUsers: room.roomUsers.map(user => ({ name: user.name, index: user.index }))
  }))
    
}
