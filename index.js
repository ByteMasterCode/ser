const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = {};
const users = {};

wss.on('connection', (socket) => {
    console.log('Client connected');

    // Генерируем уникальный id для подключившегося клиента
    socket.id = uuidv4();

    // Отправляем клиенту socketId
    socket.send(JSON.stringify({
        type: 'socketId',
        socketId: socket.id,
    }));

    socket.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received message:', data);

        if (data.type === 'join') {
            clients[socket.id] = socket;

            users[socket.id] = data.username;

            socket.send(JSON.stringify({
                type: 'users',
                users,
                userId: socket.id,
            }));
        } else if (data.type === 'getUsers') {
            socket.send(JSON.stringify({
                type: 'users',
                users,
                userId: socket.id,
            }));
        } else if (data.type === 'chat') {
            if (data.to && clients[data.to]) {
                 console.log(data.to)
                clients[data.to].send(JSON.stringify({
                    type: 'chat',
                    text: data.text,
                    from: socket.id,
                }));
            }

            // Отправляем сообщение и самому отправителю
            socket.send(JSON.stringify({
                type: 'chat',
                text: data.text,
                from: socket.id,
            }));
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
        delete clients[socket.id];
        delete users[socket.id];
    });
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
