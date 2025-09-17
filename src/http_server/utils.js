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

export function createRoom() {
    const room = {
        roomId: crypto.randomUUID(),
        roomUsers: []
    };
    rooms.push(room);
    return room;
}

export function addUserToRoom(user, id) {
    rooms.forEach(room => {
        if (room.roomId === id) {
            room.roomUsers.push({ name: user.name, index: user.index })
        }
    })
    // const room = {
    //     roomId: crypto.randomUUID(),
    //     roomUsers: [{ name: user.name, index: user.index }]
    // };
    // rooms.push(room);
    // return room;
}
