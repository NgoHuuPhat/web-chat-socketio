import { useAuth } from '@/context/AuthContext'
import { Navigate } from 'react-router-dom'

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user?.roleName === 'user') {
    return <Navigate to="/" />
  }

  if (user?.roleName === 'admin') {
    return <Navigate to="/admin" />
  }

  return children
}

export default PublicOnlyRoute
