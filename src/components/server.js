'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Peer from 'peerjs';

const Server = () => {
    //const [peerId, setPeerId] = useState('');
    const [connections, setConnections] = useState({});
    const [clientList, setClientList] = useState([]);
    const [messages, setMessages] = useState([]);
    const SERVER_ID = 'hcd-test';

    useEffect(() => {
        setTimeout(() => {
            initialiseServer();
        }, 300)
    }, []);


    const initialiseServer = () => {
        // open a connection session with id:"hcd-test"
        const peer = new Peer(SERVER_ID);

        peer.on('open', (id) => {
            //setPeerId(id);
            console.log('Server ID:', id);
        });

        peer.on('connection', (conn) => {
            console.log('New client connected:', conn.peer);

            conn.on('open', () => {
                // Add new client to the list
                setClientList(prevList => {
                    const newList = [...prevList, { id: conn.peer, isConnected: true, disabled: false }];
                    // Broadcast updated list to all clients, including the new one
                    broadcastClientList(newList, { ...connections, [conn.peer]: conn });
                    return newList;
                });

                // add new client to the clientList 'connections'
                setConnections(prevConnections => ({ ...prevConnections, [conn.peer]: conn }));
            });

            conn.on('data', (data) => {
                console.log('Received data:', data);
                const newMessage = { clientId: conn.peer, message: data.message };
                setMessages(prev => [...prev, newMessage]);
                broadcastMessage(newMessage);
            });

            conn.on('close', () => {
                // Remove client from the list when disconnected
                setClientList(prevList => {
                    const newList = prevList.filter(client => client.id !== conn.peer);
                    // Broadcast updated list to all remaining clients
                    broadcastClientList(newList, connections);
                    return newList;
                });

                setConnections(prevConnections => {
                    const newConnections = { ...prevConnections };
                    delete newConnections[conn.peer];
                    return newConnections;
                });
            });
        });
    }

    const broadcastClientList = (list, conns) => {
        Object.values(conns).forEach(conn => {
            conn.send({ type: 'clientList', data: list });
        });
    };

    const broadcastMessage = (message) => {
        Object.values(connections).forEach(conn => {
            conn.send({ type: 'message', data: message });
        });
    };

    return (
        <div>
            <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Server</h1>
            <p>Connected Clients: {Object.keys(connections).length}</p>
            <h2>Client List</h2>
            <ul>
                {clientList.map(client => (
                    <li key={client.id}>
                        {client.id} - {client.isConnected ? 'Connected' : 'Disconnected'}
                        {client.disabled ? ' (Disabled)' : ''}
                    </li>
                ))}
            </ul>
            <h2>Messages</h2>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>
                        {msg.clientId}: {msg.message}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Server;
