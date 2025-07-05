import './App.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Chat from './pages/Chat.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'

// Main App Component
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Chat />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />    
    </Routes>
  )
}

export default App
