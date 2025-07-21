import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { toast, Bounce } from 'react-toastify'

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [pinnedMessages, setPinnedMessages] = useState([])
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

  const markMessagesAsRead = async (conversationId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/conversations/${conversationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok) {
        setConversations(prevConversations =>
          prevConversations.map(conversation => 
            conversation._id === conversationId ? { ...conversation, unreadCount: {...conversation.unreadCount, [user.id]: 0} } : conversation
          )
        )
      } else {
        console.error('Failed to mark messages as read:', data.message)
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // Handle selecting a conversation
  const handleSelectConversation = async (conversation) => {
    if (!conversation) return

    navigate(`/messages/${conversation._id}`)
    setSelectedConversation(conversation)
    setMessages([])
    setPinnedMessages([])

    try {
      const [resMessages, resPinned] = await Promise.all([
        fetch(`http://localhost:3000/api/messages/${conversation._id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }),
        fetch(`http://localhost:3000/api/conversations/${conversation._id}/pinned`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }),
      ])

      const [messagesData, pinnedData] = await Promise.all([
        resMessages.json(),
        resPinned.json(),
      ])

      if (resMessages.ok) {
        const formattedMessages = messagesData.map((msg) => ({
          _id: msg._id,
          sender: msg.senderId,
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          deleted: msg.deleted || false,
        }))
        setMessages(formattedMessages)
      } else {
        console.error('Failed to fetch messages:', messagesData.message)
      }

      if (resPinned.ok) {
        const formattedPinned = pinnedData.map((msg) => ({
          _id: msg._id,
          sender: msg.senderId,
          senderName: msg.senderId.fullName,
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          deleted: msg.deleted || false,
        }))
        setPinnedMessages(formattedPinned)
      } else {
        console.error('Failed to fetch pinned messages:', pinnedData.message)
      }

      // Mark messages as read
      await markMessagesAsRead(conversation._id)
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  // If conversationId is provided in URL, select that conversation
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === conversationId)

      if (conversation && (!selectedConversation || selectedConversation._id !== conversation._id)) {
        handleSelectConversation(conversation)
      }

    } else if (!conversationId && !selectedConversation && conversations.length > 0) {
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
    if (!selectedConversation || !messageId) {
      console.error('No conversation selected or message ID is missing')
      return
    }

    try {
      const res = await fetch(`http://localhost:3000/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === messageId ? { ...msg, deleted: true } : msg
          )
        )
        console.log('Message deleted successfully:', data)
      } else {
        console.error('Failed to delete message:', data.message)
      }
    
    } catch (error) {
      console.error('Error deleting message:', error) 
    }
  }

  const handlePinMessage = async (msgId) => {
    if (!selectedConversation || !msgId) {
      console.error('No conversation selected or message ID is missing')
      return
    }

    if (pinnedMessages.length >= 3) {
      toast.warn('You can only pin up to 3 messages. Please unpin at least 1 message before pinning a new one.')
      return
    }

    try {
      const res = await fetch(`http://localhost:3000/api/conversations/${selectedConversation._id}/pin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ messageId: msgId }),
      })
      const data = await res.json()

      if (res.ok) {
        console.log('Message pinned successfully:', data)
        setPinnedMessages(prevPinned => [...prevPinned, {
          _id: data.pinnedMessages._id,
          sender: data.pinnedMessages.senderId,
          senderName: data.pinnedMessages.senderId.fullName,
          text: data.pinnedMessages.content,
          time: new Date(data.pinnedMessages.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }])
      } else {
        console.error('Failed to pin message:', data.message)
      }
    } catch (error) {
      console.error('Error pinning message:', error)
      return
    }
  }

  const handleUnpinMessage = async (msgId) => {
    if(!selectedConversation || !msgId) {
      console.error('No conversation selected or message ID is missing')
      return
    }

    try {
      const res = await fetch(`http://localhost:3000/api/conversations/${selectedConversation._id}/unpin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ messageId: msgId }),
      })
      const data = await res.json()

      if (res.ok) {
        console.log('Message unpinned successfully:', data)
        setPinnedMessages(prevPinned => prevPinned.filter(msg => msg._id !== msgId))
      } else {
        console.error('Failed to unpin message:', data.message)
      }
    } catch (error) {
      console.error('Error unpinning message:', error)
      return
    }
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
          pinnedMessages={pinnedMessages}
          onPinMessage={handlePinMessage}
          onUnpinMessage={handleUnpinMessage} 
        />
      </div>
    </div>
  )
}

export default Chat
