import { stamp, sendJson, createUser, createRoom } from './utils.js';
import { users, rooms } from './db.js';



export const handleReg = (ws, msg) => {
    const { name, password } = JSON.parse(msg.data.toString()) || {};

    let activeUser = users.find(user => user.name === name && user.password === password);

    if (!activeUser) activeUser = createUser({ name, password });

    let responseData = {
        name: activeUser.name, index: activeUser.index, error: false, errorText: ""
    };

    const okRes = {
        type: "reg",
        data: JSON.stringify(responseData),
        id: 0
    };

    ws.user = activeUser;

    console.log(`[${stamp()}] ->`, okRes);
    sendJson(ws, okRes);

}

export const handleCreateRoom = (ws, wss) => {
    const user = ws.user;

    if (!user) {
        console.log(`[${stamp()}] ->`, 'User is not authorized');
        return sendJson(ws, {
            type: 'error',
            data: JSON.stringify({ error: true, errorText: 'Not authorized (reg required)' }),
            id: 0,
        });
    }

    const room = createRoom(user);
    console.log(`[${stamp()}] Created room ${room.roomId} by ${user.name}`);

    const okRes = {
        type: "update_room",
        data: JSON.stringify(rooms),
        id: 0,
    };

    console.log(`[${stamp()}] ->`, okRes);

    wss.clients?.forEach(client => sendJson(client, okRes));
}