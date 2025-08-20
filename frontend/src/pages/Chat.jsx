import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import MembersSidebar from '@/components/MembersSidebar'
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showMembersSidebar, setShowMembersSidebar] = useState(false)
  const [skipAutoSelect, setSkipAutoSelect] = useState(false)
  const [media, setMedia] = useState([])
  const [files, setFiles] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState(null)
  const { user, socket } = useAuth()

  const { conversationId } = useParams()
  const navigate = useNavigate()

  // Socket event listeners
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
      if (selectedConversation && selectedConversation._id === message.conversationId) {
        setMessages(prevMessages => [...prevMessages, formattedMessage])
      }

      if (formattedMessage.messageType === 'media' && formattedMessage.attachments.length > 0) {
        const mediaAttachments = formattedMessage.attachments.filter(att => ['image', 'video'].includes(att.type))
        const fileAttachments = formattedMessage.attachments.filter(att => ['file', 'audio'].includes(att.type))

        if (mediaAttachments.length > 0 && selectedConversation._id === message.conversationId) {
          setMedia(prevMedia => [{
            ...formattedMessage,
            attachments: mediaAttachments
          }, ...(Array.isArray(prevMedia) ? prevMedia : [])])
        }
        if (fileAttachments.length > 0 && selectedConversation._id === message.conversationId) {
          setFiles(prevFiles => [{
            ...formattedMessage,
            attachments: fileAttachments
          }, ...(Array.isArray(prevFiles) ? prevFiles : [])])
        }
      }

      setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conversation => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                content: formattedMessage.text,
                senderId: formattedMessage.sender,
                createdAt: formattedMessage.createdAt,
                attachments: formattedMessage.attachments,
                deleted: formattedMessage.deleted,
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

    const handleNewMessageNotification = (message) => {
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conversation => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                content: message.text || message.content || '',
                senderId: message.sender,
                createdAt: message.createdAt,
                attachments: message.attachments || [],
                deleted: message.deleted || false,
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

    const handleDeleteMessage = ({ messageId, conversationId, messageType, attachments }) => {
      if (selectedConversation && selectedConversation._id === conversationId) {
        setMessages(prevMessages => prevMessages.map(msg => msg._id === messageId ? { ...msg, deleted: true } : msg))

        if (messageType === 'media' && attachments.length > 0) {
          setMedia(prevMedia => prevMedia.filter(media => media._id !== messageId))
          setFiles(prevFiles => prevFiles.filter(file => file._id !== messageId))
        }
      
        setPinnedMessages(prevPinned => prevPinned.filter(msg => msg._id !== messageId))

        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conversation => {
            if (conversation._id === conversationId) {
              return {
                ...conversation,
                lastMessage: {
                  ...conversation.lastMessage,
                  deleted: true,
                },
                unreadCount: {
                  ...conversation.unreadCount,
                  [user.id]: 0
                }
              }
            }
            return conversation
          })

          return [
            updatedConversations.find(c => c._id === conversationId),
            ...updatedConversations.filter(c => c._id !== conversationId)
          ]
        })
      }
    }

    const handleSocketPinMessage = (data) => {
      if (selectedConversation && selectedConversation._id === data.conversationId) {
        setPinnedMessages(prevPinned => [
          ...prevPinned, 
          { 
            _id: data._id,
            sender: data.sender._id,
            senderName: data.senderName,
            text: data.text,
            time: data.time,
            attachments: data.attachments || [],
            messageType: data.messageType || 'text',
            deleted: data.deleted || false,
          }
        ])
      }
    }

    const handleSocketUnpinMessage = ({ messageId, conversationId }) => {
      if (selectedConversation && selectedConversation._id === conversationId) {
        setPinnedMessages(prevPinned => prevPinned.filter(msg => msg._id !== messageId))
      }
    }

    const handleUpdateGroupName = ({ conversationId, groupName }) => {
      setConversations(prevConversations =>
        prevConversations.map(conversation =>
          conversation._id === conversationId
            ? { ...conversation, groupName }
            : conversation
        )
      )
      if (selectedConversation && selectedConversation._id === conversationId) {
        setSelectedConversation(prev => ({ ...prev, groupName }))
      }
    }

    const handleUpdateGroupAvatar = ({ conversationId, groupAvatar }) => {
      setConversations(prevConversations =>
        prevConversations.map(conversation =>
          conversation._id === conversationId
            ? { ...conversation, groupAvatar }
            : conversation
        )
      )
      if (selectedConversation && selectedConversation._id === conversationId) {
        setSelectedConversation(prev => ({ ...prev, groupAvatar }))
      }
    }

    socket.on('receive_message', handleReceiveMessage)
    socket.on('new_message_notification', handleNewMessageNotification)
    socket.on('message_deleted', handleDeleteMessage)
    socket.on('message_pinned', handleSocketPinMessage)
    socket.on('message_unpinned', handleSocketUnpinMessage)
    socket.on('update_group_name', handleUpdateGroupName)
    socket.on('update_group_avatar', handleUpdateGroupAvatar)

    return () => {
      socket.off('receive_message', handleReceiveMessage)
      socket.off('new_message_notification', handleNewMessageNotification)
      socket.off('message_deleted', handleDeleteMessage)
      socket.off('message_pinned', handleSocketPinMessage)
      socket.off('message_unpinned', handleSocketUnpinMessage)
      socket.off('update_group_name', handleUpdateGroupName)
      socket.off('update_group_avatar', handleUpdateGroupAvatar)
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
            lastOnline: new Date().toISOString()
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

  // Handle group name update
  const handleUpdateGroupName = async (conversationId, groupName) => {
    if (!conversationId || !groupName.trim()) {
      toast.error('Group name cannot be empty')
      return
    }

    try {
      const res = await fetch(`http://localhost:3000/api/conversations/${conversationId}/name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ groupName }),
      })

      const data = await res.json()
      if (res.ok) {
        setConversations(prevConversations =>
          prevConversations.map(conversation =>
            conversation._id === conversationId
              ? { ...conversation, groupName }
              : conversation
          )
        )
        setSelectedConversation(prev => ({ ...prev, groupName }))
        socket.emit('update_group_name', { conversationId, groupName })
        toast.success(data.message || 'Group name updated successfully')
      } else {
        toast.error(data.message || 'Failed to update group name')
      }
    } catch (error) {
      console.error('Error updating group name:', error)
      toast.error('Error updating group name')
    }
  }

  // Handle group avatar update
  const handleUpdateGroupAvatar = async (conversationId, file) => {
    if (!conversationId || !file) {
      toast.error('Please select an avatar image')
      return
    }

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatarGroup', file)

      const res = await fetch(`http://localhost:3000/api/conversations/${conversationId}/avatar`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setConversations(prevConversations =>
          prevConversations.map(conversation =>
            conversation._id === conversationId
              ? { ...conversation, groupAvatar: data.groupAvatar }
              : conversation
          )
        )
        setSelectedConversation(prev => ({ ...prev, groupAvatar: data.groupAvatar }))
        socket.emit('update_group_avatar', { conversationId, groupAvatar: data.groupAvatar })
        toast.success('Group avatar updated successfully')
      } else {
        toast.error(data.message || 'Failed to update group avatar')
      }
    } catch (error) {
      console.error('Error updating group avatar:', error)
      toast.error('Error updating group avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Handle leave conversation
  const handleLeaveConversation = async (conversationId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/conversations/${conversationId}/leave`, {
        method: 'PATCH',
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setConversations(prevConversations =>
          prevConversations.filter(conversation => conversation._id !== conversationId)
        )

        if (conversations.length > 1) {
          const nextConversation = conversations.find(c => c._id !== conversationId)
          handleSelectConversation(nextConversation)
        } else {
          setSelectedConversation(null)
          navigate('/messages')
        }

        toast.success(data.message || 'Left group successfully')
        // Optionally emit socket event if implemented in backend
      } else if (res.status === 403 && data.action === 'confirm_delete_conversation') {
        setConversationToDelete(conversationId)
        setShowDeleteConfirm(true)
      } else {
        toast.error(data.message || 'Failed to leave group')
      }
    } catch (error) {
      console.error('Error leaving group:', error)
      toast.error('Error leaving group')
    }
  }

  // Handle delete conversation
  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId) return

    try {
      const res = await fetch(`http://localhost:3000/api/conversations/${conversationId}/groups`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setConversations(prevConversations =>
          prevConversations.filter(conversation => conversation._id !== conversationId)
        )

        if (conversations.length > 1) {
          const nextConversation = conversations.find(c => c._id !== conversationId)
          handleSelectConversation(nextConversation)
        } else {
          setSelectedConversation(null)
          navigate('/messages')
        }

        toast.success(data.message || 'Group deleted successfully')
        // Optionally emit socket event if implemented in backend
      } else {
        toast.error(data.message || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('Error deleting group')
    } finally {
      setShowDeleteConfirm(false)
      setConversationToDelete(null)
    }
  }

  useEffect(() => {
    const fetchMediaFiles = async () => {
      if (!conversationId) return
      try {
        const [resMedia, resFiles] = await Promise.all([
          fetch(`http://localhost:3000/api/conversations/${conversationId}/media`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch(`http://localhost:3000/api/conversations/${conversationId}/files`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
        ])

        const [mediaData, filesData] = await Promise.all([
          resMedia.json(),
          resFiles.json()
        ])

        setMedia(mediaData)
        setFiles(filesData)
      } catch (error) {
        console.error('Error fetching media files:', error)
      }
    }

    fetchMediaFiles()
  }, [conversationId])

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

  const handleSelectConversation = async (conversation) => {
    if (!conversation || !conversation._id) {
      setSelectedConversation(conversation)
      setMessages([])
      setPinnedMessages([])
      return
    }

    if (selectedConversation?._id) {
      socket.emit('leave_conversation', selectedConversation._id)
    }

    setSelectedConversation(conversation)
    setMessages([])
    setPinnedMessages([])

    navigate(`/messages/${conversation._id}`)
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

      if (conversation._id) {
        await markMessagesAsRead(conversation._id)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  useEffect(() => {
    if (skipAutoSelect) {
      setSkipAutoSelect(false)
      return
    }

    if (!conversations || !conversations.length) return

    if (!conversationId && !selectedConversation) {
      handleSelectConversation(conversations[0])
      return
    }

    if (conversationId && selectedConversation?._id !== conversationId) {
      const conversation = conversations.find(c => c && c._id === conversationId)
      if (conversation) {
        handleSelectConversation(conversation)
      } else if (conversations.length > 0) {
        handleSelectConversation(conversations[0])
      }
    }
  }, [conversations, conversationId])

  const handleSendMessage = async (messageText) => {
    if (!selectedConversation || !messageText.trim()) return

    const payload = {
      content: messageText,
    }
    
    const members = selectedConversation.members || []
    const receiverUser = members.find(member => member.userId._id !== user.id)?.userId

    if (!receiverUser && !selectedConversation.isGroup) {
      console.error('Receiver not found in conversation members')
      return
    }

    if (!selectedConversation._id) {
      payload.receiverId = receiverUser?._id
    } else if (selectedConversation.isGroup) {
      payload.conversationId = selectedConversation._id
    } else {
      payload.receiverId = receiverUser._id
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

        if (!selectedConversation._id && data.data.conversationId) {
          const newConversation = {
            ...selectedConversation,
            _id: data.data.conversationId,
            lastMessage: {
              content: data.data.content,
              senderId: user.id,
              createdAt: data.data.createdAt,
            },
            unreadCount: { [user.id]: 0 }
          }

          setConversations(prevConversations => [newConversation, ...prevConversations])
          setSelectedConversation(newConversation)
          setSkipAutoSelect(true)
          navigate(`/messages/${data.data.conversationId}`)
        }

        socket.emit('send_message', {
          conversationId: selectedConversation._id || data.data.conversationId,
          ...newMessage,
        })

        const targetConversationId = selectedConversation._id || data.data.conversationId
        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conversation => {
            if (conversation._id === targetConversationId) {
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
          
          const targetConversation = updatedConversations.find(c => c._id === targetConversationId)
          if (targetConversation) {
            return [
              targetConversation,
              ...updatedConversations.filter(c => c._id !== targetConversationId)
            ]
          }
          return updatedConversations
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

        const deletedMessage = messages.find(msg => msg._id === messageId)
        if (deletedMessage && deletedMessage.messageType === 'media' && deletedMessage.attachments.length > 0) {
          setMedia(prevMedia => prevMedia.filter(media => media._id !== messageId))
          setFiles(prevFiles => prevFiles.filter(file => file._id !== messageId))
        }

        setPinnedMessages(prevPinned => prevPinned.filter(msg => msg._id !== messageId))

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

        socket.emit('delete_message', { 
          messageId, 
          conversationId: selectedConversation._id,
          messageType: deletedMessage?.messageType,
          attachments: deletedMessage?.attachments,
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
      toast.warn('You can only pin up to 3 messages!')
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

        socket.emit('pin_message', {
          _id: data.pinnedMessage._id,
          sender: data.pinnedMessage.senderId,
          senderName: data.pinnedMessage.senderId.fullName,
          text: data.pinnedMessage.content,
          time: new Date(data.pinnedMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachments: data.pinnedMessage.attachments || [],
          messageType: data.pinnedMessage.messageType || 'text',
          deleted: data.pinnedMessage.deleted || false,
          conversationId: selectedConversation._id,
        })
      } else {
        console.error('Failed to pin message:', data.message)
      }
    } catch (error) {
      console.error('Error pinning message:', error)
      return
    }
  }

  const handleUnpinMessage = async (msgId) => {
    if (!selectedConversation || !msgId) {
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
        
        socket.emit('unpin_message', {
          messageId: msgId,
          conversationId: selectedConversation._id
        })
      } else {
        console.error('Failed to unpin message:', data.message)
      }
    } catch (error) {
      console.error('Error unpinning message:', error)
      return
    }
  }

  const handleSendMediaMessage = async (files) => {
    if (!selectedConversation || !files || files.length === 0) {
      console.error('No conversation selected or no files to upload')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('conversationId', selectedConversation._id)

      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          formData.append('image', file)
        } else if (file.type.startsWith('video/')) {
          formData.append('video', file)
        } else if (file.type.startsWith('audio/')) {
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
          conversationId: data.conversationId,
          sender: user.id,
          createdAt: data.createdAt,
          text: '',
          time: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachments: data.attachments || [],
          messageType: 'media',
          deleted: false,
        }

        setMessages(prevMessages => [...prevMessages, mediaMessages])

        const mediaAttachments = data.attachments.filter(att => ['image', 'video'].includes(att.type))
        const fileAttachments = data.attachments.filter(att => ['file'].includes(att.type))

        if (mediaAttachments.length > 0) {
          setMedia(prevMedia => [
            {
              ...mediaMessages,
              attachments: mediaAttachments,
            }, ...(Array.isArray(prevMedia) ? prevMedia : [])
          ])
        }

        if (fileAttachments.length > 0) {
          setFiles(prevFiles => [
            {
              ...mediaMessages,
              attachments: fileAttachments,
            }, ...(Array.isArray(prevFiles) ? prevFiles : [])
          ])
        }

        socket.emit('send_message', mediaMessages)

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

  const handleToggleMembersSidebar = () => {
    setShowMembersSidebar(!showMembersSidebar)
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
          setConversations={setConversations}
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
          onToggleMembersSidebar={handleToggleMembersSidebar}
        />
        {showMembersSidebar && (
          <MembersSidebar 
            selectedConversation={selectedConversation}
            users={users}
            currentUserId={user.id}
            media={media}
            files={files}
            onUpdateGroupName={handleUpdateGroupName}
            onUpdateGroupAvatar={handleUpdateGroupAvatar}
            onLeaveConversation={handleLeaveConversation}
            onDeleteConversation={handleDeleteConversation}
            uploading={uploadingAvatar}
          />
        )}
      </div>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-purple-600 mb-4">Delete Group?</h3>
            <p className="text-sm text-slate-600 mb-6">You are the last member. Leaving will delete this group permanently. Are you sure?</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 cursor-pointer py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setConversationToDelete(null)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 cursor-pointer py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                onClick={() => handleDeleteConversation(conversationToDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat