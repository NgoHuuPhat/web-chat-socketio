import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [pinnedMessages, setPinnedMessages] = useState([])
  const [uploading, setUploading] = useState(false)
  const { user, socket } = useAuth()

  const { conversationId } = useParams()
  const navigate = useNavigate()


  // socket event listeners
  useEffect(() => {
    if (!socket || !selectedConversation) return

    const handleReceiveMessage = (message) => {
      const formattedMessage = {
         _id: message._id,
        sender: message.sender,
        text: message.text || message.content || '',
        time: message.time || new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        createdAt: message.createdAt || new Date().toISOString(),
        deleted: message.deleted || false,
        attachments: message.attachments || [],
        messageType: message.messageType || 'text',
        status: message.status || 'sent',
        seenBy: message.seenBy || [],
        senderName: message.senderName || 'Unknown'
      }
      // Update messages state with the new message
      if( selectedConversation && selectedConversation._id === message.conversationId) {
        setMessages(prevMessages => [...prevMessages, formattedMessage])
      }

      // Update conversations state when a new message is received
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conversation => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                content: formattedMessage.text,
                senderId: formattedMessage.sender,
                createdAt: formattedMessage.createdAt,
              },
              unreadCount: {
                ...conversation.unreadCount,
                [user.id]: selectedConversation._id === message.conversationId ? 0 : (conversation.unreadCount[user.id] || 0) + 1,
              }
            }
          }
          return conversation
        })

        return [
          updatedConversations.find(c => c._id === message.conversationId),
          ...updatedConversations.filter(c => c._id !== message.conversationId)
        ]
      })
    }

    const handleNewMessageNotification = ( message ) => {
      console.log('New message notification:', message)
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conversation => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                content: message.text || message.content || '',
                senderId: message.sender,
                createdAt: message.createdAt,
              },
              unreadCount: {
                ...conversation.unreadCount,
                [user.id]: selectedConversation._id === message.conversationId ? 0 : (conversation.unreadCount[user.id] || 0) + 1,
              },
            }
          }

          return conversation
        })

        return [
          updatedConversations.find(c => c._id === message.conversationId),
          ...updatedConversations.filter(c => c._id !== message.conversationId)
        ]
      })
    }

    // Register the socket event listener
    socket.on('receive_message', handleReceiveMessage)

    // Register the new message notification listener
    socket.on('new_message_notification', handleNewMessageNotification)

    return () => {
      socket.off('receive_message', handleReceiveMessage)
      socket.off('new_message_notification', handleNewMessageNotification)
    }
    
  }, [socket, selectedConversation, user.id])

  useEffect(() => {
    if (!socket) return

    const handleOnlineUser = ({ userId }) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, isOnline: true } : user
        )
      )
    }

    const handleOfflineUser = ({ userId }) => {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { 
            ...user, 
            isOnline: false,
            lastOnline: user.lastOnline || new Date().toISOString()
           } : user
        )
      )
    }

    socket.on('user_online', handleOnlineUser)
    socket.on('user_offline', handleOfflineUser)

    return () => {
      socket.off('user_online', handleOnlineUser)
      socket.off('user_offline', handleOfflineUser)
    }
  }, [socket])

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

    // Leave the previous conversation room if any
    if (selectedConversation) {
      socket.emit('leave_conversation', selectedConversation._id)
    }

    navigate(`/messages/${conversation._id}`)
    setSelectedConversation(conversation)
    setMessages([])
    setPinnedMessages([])

    // Join the conversation room in socket
    socket.emit('join_conversation', conversation._id)

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
          text: msg.content || '',
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          createdAt: msg.createdAt,
          deleted: msg.deleted || false,
          attachments: msg.attachments || [],
          messageType: msg.messageType || 'text',
          status: msg.status || 'sent',
          seenBy: msg.seenBy || [],
          senderName: msg.senderId.fullName,
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
          text: msg.content || '',
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          deleted: msg.deleted || false,
          attachments: msg.attachments || [],
          messageType: msg.messageType || 'text',
        }))
        setPinnedMessages(formattedPinned)
      } else {
        console.error('Failed to fetch pinned messages:', pinnedData.message)
        setPinnedMessages([])
      }

      // Mark messages as read
      await markMessagesAsRead(conversation._id)
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  // If conversationId is provided in URL, select that conversation
  useEffect(() => {
    if(!conversations.length) return

    if(!conversationId && !selectedConversation) {
      handleSelectConversation(conversations[0])
      return
    }

    if(conversationId){
      const conversation = conversations.find(c => c._id === conversationId)
      if(conversation && (!selectedConversation || selectedConversation._id !== conversationId)) { 
        handleSelectConversation(conversation)
      } else if(!conversation) {
        handleSelectConversation(conversations[0])
      }
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
            status: data.data.status || 'sent',
            attachments: data.data.attachments || [],
            messageType: data.data.messageType || 'text',
            deleted: data.data.deleted || false,
            createdAt: data.data.createdAt,
            time: new Date(data.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }

          setMessages(prevMessages => [...prevMessages, newMessage])

          // Emit the message to the socket
          socket.emit('send_message', {
            conversationId: selectedConversation._id,
            ...newMessage,
          })

          setConversations(prevConversations => {
            const updatedConversations = prevConversations.map(conversation => {
              if (conversation._id === selectedConversation._id) {
                return {
                  ...conversation,
                  lastMessage: {
                    content: data.data.content,
                    senderId: user.id,
                    createdAt: data.data.createdAt,
                  },
                }
              }
              return conversation
            })
            return [
              updatedConversations.find(c => c._id === selectedConversation._id),
              ...updatedConversations.filter(c => c._id !== selectedConversation._id)
            ]
          })
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

        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conversation => {
            if (conversation._id === selectedConversation._id) {
              return {
                ...conversation,
                lastMessage: {
                  senderId: user.id,
                  createdAt: data.data.createdAt,
                  deleted: true
                },
              }
            }
            return conversation
          })
          return [
            updatedConversations.find(c => c._id === selectedConversation._id),
            ...updatedConversations.filter(c => c._id !== selectedConversation._id)
          ]
        })
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
      toast.warn('You can only pin up to 3 message!')
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
        setPinnedMessages(prevPinned => [...prevPinned, {
          _id: data.pinnedMessage._id,
          sender: data.pinnedMessage.senderId,
          senderName: data.pinnedMessage.senderId.fullName,
          text: data.pinnedMessage.content,
          time: new Date(data.pinnedMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachments: data.pinnedMessage.attachments || [],
          messageType: data.pinnedMessage.messageType || 'text',
          deleted: data.pinnedMessage.deleted || false,
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
        setPinnedMessages(prevPinned => prevPinned.filter(msg => msg._id !== msgId))
      } else {
        console.error('Failed to unpin message:', data.message)
      }
    } catch (error) {
      console.error('Error unpinning message:', error)
      return
    }
  }

  // Handle file uploads
  const handleSendMediaMessage = async (files) => {
    if(!selectedConversation || !files || files.length === 0) {
      console.error('No conversation selected or no files to upload')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('conversationId', selectedConversation._id)

      // Append each file to the FormData
      files.forEach(file => {
        if(file.type.startsWith('image/')) {
          formData.append('image', file)
        } else if(file.type.startsWith('video/')) {
          formData.append('video', file)
        } else if(file.type.startsWith('audio/')) {
          formData.append('audio', file)
        } else {
          formData.append('file', file)
        }
      })

      const res = await fetch('http://localhost:3000/api/messages/media', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        const mediaMessages = {
          _id: data._id,
          sender: user.id,
          text: '',
          time: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachments: data.attachments,
          messageType: 'media',
          deleted: false,
        }

        setMessages(prevMessages => [...prevMessages, mediaMessages])

        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conversation => {
            if (conversation._id === selectedConversation._id) {
              return {
                ...conversation,
                lastMessage: {
                  content: '',
                  senderId: user.id,
                  createdAt: data.createdAt,
                  attachments: data.attachments,
                },
              }
            }
            return conversation
          })
          return [
            updatedConversations.find(c => c._id === selectedConversation._id),
            ...updatedConversations.filter(c => c._id !== selectedConversation._id)
          ]
        })

        setUploading(false)
      } else {
        console.error('Failed to send media message:', data.message)
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Error uploading media files:', error)
    } finally {
      setUploading(false)
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
          users={users}
          selectedConversation={selectedConversation} 
          messages={messages} 
          currentUserId={user.id}
          onSendMessage={handleSendMessage} 
          onDeleteMessage={handleDeleteMessage}
          pinnedMessages={pinnedMessages}
          onPinMessage={handlePinMessage}
          onUnpinMessage={handleUnpinMessage} 
          onSendMediaMessage={handleSendMediaMessage}
          uploading={uploading}
        />
      </div>
    </div>
  )
}

export default Chat
