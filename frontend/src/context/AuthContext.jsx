import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

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

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
