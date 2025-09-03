import { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/auth/check-auth', {
                    method: 'GET',
                    credentials: 'include'
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error('Failed to fetch user data')
                }

                setUser(data)
            } catch (error) {
                setUser(null)
                console.error('Error fetching user data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    // Socket connection
    useEffect(() => {
        if(!user) {
            if(socket) {
                socket.disconnect()
                setSocket(null)
            }
            return
        }

        let newSocket = io('http://localhost:3000', {
            transports: ['websocket'],
            withCredentials: true
        })

        newSocket.on('connect_error', async (err) => {
            if(err.message === 'jwt expired') {
                const res = await fetch('http://localhost:3000/api/auth/refresh-token', {
                    method: 'POST',
                    credentials: 'include'
                })

                if(res.ok) {
                    newSocket.connect()
                } else {
                    setUser(null)
                }
            }
        })
        
        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
            setSocket(null)
        }
    }, [user])

    return (
        <AuthContext.Provider value={{ user, setUser, loading, socket }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
