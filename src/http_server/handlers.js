import { stamp, sendJson, createUser } from './utils.js';
import { users } from './db.js';



export const handleReg = (ws, data) => {
    const { name, password } = data || {};

    let activeUser = users.find(user => user.name === name && user.password === password);

    if (!activeUser) activeUser = createUser({ name, password });
    
    let responseData = JSON.stringify({
        name: activeUser.name, index: activeUser.index, error: false, errorText: ""
    });

    const okRes = {
        type: "reg",
        data: responseData,
        id: 0
    };

    console.log(`[${stamp()}] ->`, okRes);
    sendJson(ws, okRes);

}