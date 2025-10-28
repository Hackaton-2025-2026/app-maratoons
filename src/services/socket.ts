import { io, Socket } from 'socket.io-client';

const API_1_URL = import.meta.env.VITE_API_1_URL;
// Remove trailing slash for socket.io compatibility
const SOCKET_URL = API_1_URL?.endsWith('/') ? API_1_URL.slice(0, -1) : API_1_URL;

class SocketService {
    private socket: Socket | null = null;
    private isConnected = false;

    connect(): void {
        if (this.socket && this.isConnected) {
            console.log('Socket already connected');
            return;
        }

        console.log('Connecting to socket at:', SOCKET_URL);

        this.socket = io(SOCKET_URL, {
            transports: ['polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            withCredentials: true // Send cookies with requests
        });

        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        this.socket.on('reconnect_attempt', (attempt) => {
            console.log('Socket reconnection attempt:', attempt);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Socket reconnection failed after all attempts');
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            console.log('Socket manually disconnected');
        }
    }

    // Subscribe to group ranking updates
    subscribeToGroupRank(groupId: string, callback: (data: any[]) => void): void {
        if (!this.socket) {
            console.error('Socket not connected. Call connect() first.');
            return;
        }

        // Listen for rank updates
        this.socket.on('getGroupRank', callback);

        // Request initial rank data
        this.socket.emit('getGroupRank', groupId);
    }

    // Unsubscribe from group ranking updates
    unsubscribeFromGroupRank(callback: (data: any[]) => void): void {
        if (this.socket) {
            this.socket.off('getGroupRank', callback);
        }
    }

    // Request group rank update manually
    requestGroupRank(groupId: string): void {
        if (!this.socket) {
            console.error('Socket not connected. Call connect() first.');
            return;
        }

        this.socket.emit('getGroupRank', groupId);
    }

    isSocketConnected(): boolean {
        return this.isConnected && this.socket !== null;
    }
}

// Export singleton instance
export const socketService = new SocketService();
