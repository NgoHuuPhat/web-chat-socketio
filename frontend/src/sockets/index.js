import io from 'socket.io-client'

let socket

const initializeSocket = () => {
    if (!socket) {
        socket = io('http://localhost:3000', {
            transports: ['websocket'],
            withCredentials: true,
        })
    }

    return socket
}

export { initializeSocket }