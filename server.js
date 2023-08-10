wss.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received message:', data);

        if (data.type === 'join') {
            clients[socket.id] = socket;
            users[socket.id] = data.username;

            socket.send(JSON.stringify({
                type: 'users',
                users,
                userId: socket.id, // Отправляем клиенту его socket.id
            }));
        } else if (data.type === 'getUsers') {
            socket.send(JSON.stringify({
                type: 'users',
                users,
            }));
        } else if (data.type === 'chat') {
            if (data.to && clients[data.to]) {
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
