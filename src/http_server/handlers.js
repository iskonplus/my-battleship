import { stamp, sendJson, createUser, createRoom, getRandomUUID } from './utils.js';
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

export const handleSinglePlay = ws => {
    const idGame = getRandomUUID();
    const idPlayer = getRandomUUID();
    const idBot = getRandomUUID();

    const okRes = {
        type: "create_game",
        data: JSON.stringify({ idGame, idPlayer }),
        id: 0,
    };

    console.log(`[${stamp()}] ->`, okRes);
    sendJson(ws, okRes);
}

export const handleAddUserToRoom = (ws, msg) => {
    const { indexRoom } = JSON.parse(msg.data.toString()) || {};
    const room = rooms.find(room => room.roomId === indexRoom);

    const errRes = {
        type: 'error',
        data: { error: true, errorText: '' },
        id: 0,
    };

    if (!room) {
        errRes.data.errorText = 'Room not found';
        console.log(`[${stamp()}] => `, errRes);
        return sendJson(ws, errRes);
    }

    if (room.roomUsers.length >= 2) {
        errRes.data.errorText = 'Room is full';
        return sendJson(ws, errRes);
    }


    const idGame = getRandomUUID();

    console.log('>>>ws.activeUser.index>>>>', ws.user.index);
    console.log('>>>>room>>>>>', room);

    let responseDataStartGame = {
        idGame,
        idPlayer: ws.user.index,
    }

    let responseDataWaitingOpponent = { type: "waiting_for_opponent", data: { roomId: room.roomId }, "id": 0 }

    const okRes = {
        type: "create_game",
        data: JSON.stringify(room.roomUsers.length === 1 ? responseDataWaitingOpponent : responseDataStartGame),
        id: 0,
    }

    console.log(`[${stamp()}] =>  User in game`, okRes);
    sendJson(ws, okRes);

}

export const handleAddShips = ws => {

}