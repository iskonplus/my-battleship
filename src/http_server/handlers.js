import { stamp, sendJson, createUser, createRoom, getRandomUUID, addUserToRoom, getPublicRooms } from './utils.js';
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

    const room = createRoom(user, ws);
    console.log(`[${stamp()}] -> Created room ${room.roomId} by ${user.name}`);

    const okRes = {
        type: "update_room",
        data: JSON.stringify(getPublicRooms()),
        id: 0,
    };

    console.log(`[${stamp()}] ->`, okRes);

    wss.clients?.forEach(client => sendJson(client, okRes));
}

export const handleAddUserToRoom = (wss, ws, msg) => {
    const { indexRoom } = JSON.parse(msg.data.toString()) || {};
    const room = rooms.find(room => room.roomId === indexRoom);
    const user = ws.user;

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
    let userInRoom = room.roomUsers.find(u => u.index === user.index);

    if (userInRoom) {
        errRes.data.errorText = 'User already in room';
        console.log(`[${stamp()}] ->  User already in room`, room);
        return sendJson(ws, errRes);
    }

    addUserToRoom(user, room.roomId, ws)
    const responseUpdateRoom = {
        type: "update_room",
        data: JSON.stringify(getPublicRooms()),
        id: 0,
    }

    console.log(`[${stamp()}] ->  User added to room`, responseUpdateRoom);
    sendJson(ws, responseUpdateRoom);

    let responseDataStartGame = {
        idGame,
        idPlayer: '',
    }

    const okRes = {
        type: "create_game",
        data: "",
        id: 0,
    }


    for (const player of room.roomUsers) {
        responseDataStartGame.idPlayer = getRandomUUID();
        okRes.data = JSON.stringify(responseDataStartGame);
        console.log(`[${stamp()}] -> ${player.name} in game`, okRes);
        sendJson(player.ws, okRes);
    }

    ;

    const actualRoomsResponse = {
        type: 'update_room',
        data: JSON.stringify(getPublicRooms()),
        id: 0
    };

    wss?.clients?.forEach(client => {
        sendJson(client, actualRoomsResponse);
    });

}

export const handleAddShips = ws => {

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