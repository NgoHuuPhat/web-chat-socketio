import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const { user } = useAuth()

  const { conversationId } = useParams()
  const navigate = useNavigate()

  // get all users
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

  // get all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/conversations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', 
        })
        const data = await res.json()
        if (res.ok) {
          setConversations(data)
        } else {
          console.error('Failed to fetch conversations:', data.message)
        }

      } catch (error) {
        console.error('Error fetching conversations:', error)
      }
    }

    fetchConversations()
  }, [])

  // Handle selecting a conversation
  const handleSelectConversation = async(conversation) => {
    if (!conversation) return

    navigate(`/messages/${conversation._id}`)
    setSelectedConversation(conversation)
    setMessages([])

    try {
        const res = await fetch(`http://localhost:3000/api/messages/${conversation._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', 
        })
        const data = await res.json()
        if(res.ok) {
          const formattedMessages = data.map(message => ({
            _id: message._id,
            sender: message.senderId,
            text: message.content,
            deleted: message.deleted,
            time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
          
          setMessages(formattedMessages)
        } else {
          console.error('Failed to fetch messages:', data.message)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
    }
  }

  // If conversationId is provided in URL, select that conversation
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === conversationId)
      if (conversation) {
        handleSelectConversation(conversation)
      } else {
        console.error('Conversation not found:', conversationId)
        navigate('/')
      }
    // If no conversation is selected, select the first one
    } else if(!selectedConversation && conversations.length > 0) {
      handleSelectConversation(conversations[0])
    }
  }, [conversationId, conversations])

  // handle sending a message
  const handleSendMessage = async (messageText) => {
    if(!selectedConversation || !messageText.trim()) return

    const payload = {
      content: messageText,
    }

    if(selectedConversation.isGroup) {
      payload.conversationId = selectedConversation._id
    } else {
      const receiverId = selectedConversation.members.find(member => member._id !== user.id)
      if(!receiverId) {
        console.error('Receiver not found in conversation members')
        return
      }

      payload.receiverId = receiverId
    }
    
    try {
        const res = await fetch('http://localhost:3000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (res.ok) {
          const newMessage = {
            _id: data.data._id,
            sender: user.id,
            text: data.data.content,
            time: new Date(data.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }

          setMessages(prevMessages => [...prevMessages, newMessage])
        } else {
          console.error('Failed to send message:', data.message)
        }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg._id === messageId ? { ...msg, deleted: true } : msg
      )
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-100 to-purple-50">
      <Header />
      <div className="flex-1 flex overflow-hidden pt-20">
        <Sidebar 
          users={users} 
          conversations={conversations}
          selectedConversation={selectedConversation} 
          currentUserId={user.id}
          onSelectConversation={handleSelectConversation} 
        />
        <ChatWindow 
          selectedConversation={selectedConversation} 
          messages={messages} 
          currentUserId={user.id}
          onSendMessage={handleSendMessage} 
          onDeleteMessage={handleDeleteMessage}
        />
      </div>
    </div>
  )
}

export default Chat
