// src/services/websocketService.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = {};
        this.connected = false;
        this.connecting = false;
        this.reconnectTimer = null;
        this.reconnectDelay = 5000; // Initial reconnect delay in ms
    }

    connect(onConnected, onError) {
        if (this.connected || this.connecting) {
            return;
        }

        this.connecting = true;

        const socket = new SockJS('http://localhost:8080/api/ws');
        this.stompClient = Stomp.over(socket);

        // Disable logging in production
        this.stompClient.debug = process.env.NODE_ENV === 'production' ? () => {} : console.log;

        this.stompClient.connect(
            {},
            () => {
                this.connected = true;
                this.connecting = false;
                this.reconnectDelay = 5000; // Reset reconnect delay on successful connection

                // Clear any pending reconnect timer
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }

                if (onConnected) onConnected();

                // Resubscribe to previously subscribed topics
                Object.entries(this.subscriptions).forEach(([id, callback]) => {
                    this.subscribe(id, callback);
                });
            },
            (error) => {
                console.error('STOMP connection error:', error);
                this.connected = false;
                this.connecting = false;

                if (onError) onError(error);

                // Schedule reconnection attempt with exponential backoff
                if (!this.reconnectTimer) {
                    this.reconnectTimer = setTimeout(() => {
                        this.reconnectTimer = null;
                        this.connect(onConnected, onError);
                        // Increase delay for next reconnection attempt (max 30 seconds)
                        this.reconnectDelay = Math.min(30000, this.reconnectDelay * 1.5);
                    }, this.reconnectDelay);
                }
            }
        );
    }

    disconnect() {
        if (this.stompClient && this.connected) {
            // Unsubscribe from all subscriptions
            Object.keys(this.subscriptions).forEach(id => {
                this.unsubscribe(id);
            });

            // Clear any reconnect timer
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }

            try {
                this.stompClient.disconnect();
            } catch (e) {
                console.warn('Error during disconnect:', e);
            }

            this.connected = false;
            this.connecting = false;
        }
    }

    subscribe(destination, callback, id = destination) {
        if (!this.connected) {
            console.warn('Cannot subscribe: WebSocket not connected');

            // Store the callback for resubscription after connection
            this.subscriptions[id] = callback;
            return null;
        }

        // Unsubscribe if already subscribed to avoid duplicate subscriptions
        if (this.subscriptions[id]) {
            this.unsubscribe(id);
        }

        try {
            // Subscribe and store the subscription
            const subscription = this.stompClient.subscribe(destination, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    callback(payload);
                } catch (e) {
                    console.error('Error parsing message:', e, message.body);
                }
            });

            this.subscriptions[id] = callback;
            return subscription;
        } catch (e) {
            console.error('Error subscribing to', destination, e);
            return null;
        }
    }

    unsubscribe(id) {
        if (this.subscriptions[id]) {
            try {
                // The actual subscription object might not be available if disconnected
                const subscription = this.stompClient._subscriptions[id];
                if (subscription) {
                    subscription.unsubscribe();
                }
            } catch (e) {
                console.warn('Error unsubscribing from', id, e);
            }

            delete this.subscriptions[id];
        }
    }

    send(destination, body) {
        if (!this.connected) {
            console.warn('Cannot send message: WebSocket not connected');
            return false;
        }

        try {
            this.stompClient.send(destination, {}, JSON.stringify(body));
            return true;
        } catch (e) {
            console.error('Error sending message to', destination, e);
            return false;
        }
    }
}

// Singleton instance
const websocketService = new WebSocketService();
export default websocketService;