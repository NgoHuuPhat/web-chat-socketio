import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import { useState } from 'react'

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  
  const users = [
    {
      name: 'Alice Johnson',
      lastMessage: 'Hey, how are you doing?',
      online: true,
      unread: 2,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      name: 'Bob Smith',
      lastMessage: 'See you tomorrow!',
      online: false,
      unread: 0,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
      name: 'Carol Davis',
      lastMessage: 'Thanks for the help!',
      online: true,
      unread: 1,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    {
      name: 'David Wilson',
      lastMessage: 'Let\'s catch up soon',
      online: false,
      unread: 0,
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      name: 'Eva Brown',
      lastMessage: 'Great job on the project!',
      online: true,
      unread: 3,
      color: 'bg-gradient-to-r from-pink-500 to-rose-500'
    }
  ]

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
      sender: msg.sender === 'Alice Johnson' ? user.name : msg.sender
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
