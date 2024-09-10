'use client';

import React, { useState, useEffect } from 'react';
import Peer from 'peerjs';

const Client = ({ serverId }) => {
    const [peer, setPeer] = useState(null);
    const [connection, setConnection] = useState(null);
    const [clientId, setClientId] = useState('');
    const [message, setMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [clientList, setClientList] = useState([]);

    const handleConnect = () => {
        if (clientId.trim() === '') {
            alert('Please enter a name or ID');
            return;
        }

        const newPeer = new Peer(clientId);

        newPeer.on('open', (id) => {
            console.log('Client connected with ID:', id);
            setPeer(newPeer);

            console.log(' serverId : ', serverId)
            // this client start connecting with the server
            const conn = newPeer.connect(serverId);
            setConnection(conn);

            conn.on('open', () => {
                console.log('Connected to server');
                setIsConnected(true);
            });

            conn.on('data', (data) => {
                console.log('Received data:', data);
                if (data.type === 'clientList') {
                    setClientList(data.data);
                } else if (data.type === 'message') {
                    setMessages(prevMessages => [...prevMessages, data.data]);
                }
            });
        });

        newPeer.on('error', (error) => {
            console.error('PeerJS error:', error);
            alert('Failed to connect. The ID might be taken or there was a network error.');
        });
    };

    const sendMessage = () => {
        if (connection && message.trim() !== '') {
            const messageData = {
                message: message
            };
            connection.send(messageData);
            setMessage('');
        }
    };

    return (
        <div>
            <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Client</h1>
            {!isConnected ? (
                <div>
                    <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Enter your name or ID"
                    />
                    <button onClick={handleConnect}>Connect</button>
                </div>
            ) : (
                <div>
                    <p>Connected as: {clientId}</p>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                    />
                    <button onClick={sendMessage}>Send</button>
                    <div>
                        <h3>Client List:</h3>
                        <ul>
                            {clientList.map(client => (
                                <li key={client.id}>
                                    {client.id} - {client.isConnected ? 'Connected' : 'Disconnected'}
                                    {client.disabled ? ' (Disabled)' : ''}
                                </li>
                            ))}
                        </ul>
                        <h3>Messages:</h3>
                        <ul>
                            {messages.map((msg, index) => (
                                <li key={index}>{msg.clientId}: {msg.message}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Client;