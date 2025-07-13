import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import { useEffect, useState } from 'react'

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
          const res = await fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', 
          })

          const data = await res.json()
          console.log('Fetched users:', data)
          if (res.ok) {
            setUsers(data)
          } else {
            console.error('Failed to fetch users:', data.message)
          }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  const sampleMessages = [
    { sender: 'Alice Johnson', text: 'Hey there! How\'s your day going?', time: '10:30 AM' },
    { sender: 'You', text: 'Hi Alice! It\'s going well, thanks for asking. How about you?', time: '10:32 AM' },
    { sender: 'Alice Johnson', text: 'Pretty good! Just finished a big project at work.', time: '10:33 AM' },
    { sender: 'You', text: 'That\'s awesome! Congratulations on finishing it.', time: '10:35 AM' },
    { sender: 'Alice Johnson', text: 'Thanks! Want to grab coffee this weekend to celebrate?', time: '10:36 AM' }
  ]

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setMessages(sampleMessages.map(msg => ({
      ...msg,
      sender: msg.sender === 'Alice Johnson' ? user.fullName : msg.sender
    })))
  }

  const handleSendMessage = (messageText) => {
    const newMessage = {
      sender: 'You',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages([...messages, newMessage])
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-100 to-purple-50">
      <Header />
      <div className="flex-1 flex overflow-hidden pt-20">
        <Sidebar 
          users={users} 
          selectedUser={selectedUser} 
          onSelectUser={handleSelectUser} 
        />
        <ChatWindow 
          selectedUser={selectedUser} 
          messages={messages} 
          onSendMessage={handleSendMessage} 
        />
      </div>
    </div>
  )
}

export default Chat
