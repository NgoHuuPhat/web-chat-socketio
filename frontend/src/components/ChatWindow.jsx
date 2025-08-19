import { useEffect, useRef, useState } from 'react'
import { Send, Mic, X, Video, Loader2, Download, FileVideo, FileImage, FileText, Info, Smile, Paperclip, MessageSquareText, Image, Phone, MoreVertical, MessageCircle, Pin, Trash2, Upload } from 'lucide-react'
import { getTimeAgo, formatSeenAt } from '@/utils/formatTime'
import EmojiPicker from 'emoji-picker-react'
import useClickOutside from '@/hooks/useClickOutside'
import useAudioRecorder from '@/hooks/useAudioRecorder'
import AudioPlayer from '@/components/AudioPlayer'
import { toast } from 'react-toastify'
import Avatar from '@/components/Avatar'
import GroupAvatar from '@/components/GroupAvatar'

const ChatWindow = ({ 
  users,
  selectedConversation, 
  currentUserId, 
  messages, 
  onSendMessage, 
  onSendMediaMessage,
  onDeleteMessage, 
  pinnedMessages, 
  onPinMessage, 
  onUnpinMessage,
  uploading,
  onToggleMembersSidebar
}) => {
  const [newMessage, setNewMessage] = useState('')
  const [activeMessageMenu, setActiveMessageMenu] = useState(null)
  const [showAllPinned, setshowAllPinned] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null)

  const messagesEndRef = useRef(null)
  const imageInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const messagesMenuRef = useRef(null)
  const pinnedMessagesRef = useRef(null)
  const messageInputRef = useRef(null)

  // Refs for click outside detection
  useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false), showEmojiPicker)
  useClickOutside(messagesMenuRef, () => setActiveMessageMenu(null), activeMessageMenu !== null)
  useClickOutside(pinnedMessagesRef, () => setshowAllPinned(false), showAllPinned)

  // Initialize audio recorder
  const { status, startRecording, stopRecording, mediaBlobUrl, isRecording } = useAudioRecorder({
    onStopRecording: (blob) => {
      const audioFile = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
      setSelectedFiles(prev => [...prev, audioFile])
      setPreviewUrls(prev => [...prev, URL.createObjectURL(audioFile)])
    }
  })
  useEffect(() => {
    let timer
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000) 
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(timer)
  }, [isRecording])

  useEffect(() => {
    if(selectedConversation){
      if(messageInputRef.current){
        setTimeout(() => {
          messageInputRef.current.focus()
        }, 50)
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages])

  const handleMessageMenuClick = (index, event) => {
    event.stopPropagation()
    setActiveMessageMenu(activeMessageMenu === index ? null : index)
  }

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    if(files.length === 0) return

    // Create preview URLs
    const newPreviewsUrls = files.map(file => {
      if(file.type.startsWith('image/') || file.type.startsWith('video/')) {
        return URL.createObjectURL(file)
      }
      return null
    })

    event.target.value = null
    setSelectedFiles(prev => [...prev, ...files])
    setPreviewUrls(prev => [...prev, ...newPreviewsUrls])
  }

  // Delete selected file
  const removeFile = (index) => {
    const urltoRevoke = previewUrls[index]
    if(urltoRevoke) {
      URL.revokeObjectURL(urltoRevoke)
    }

    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  // Handle send message with media
  const handleSendClick = () => {
    if(uploading) return

    if(selectedFiles.length > 0) {
      // Prepare files for upload
      onSendMediaMessage(selectedFiles)

      // Clear selected files after sending
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setSelectedFiles([])
      setPreviewUrls([])

      return
    }
    
    if(newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
      if (messageInputRef.current) {
        messageInputRef.current.innerText = ''
      }
    }
  }

  // Handle input in contentEditable div
  const handleInput = () => {
    if (messageInputRef.current) {
      setNewMessage(messageInputRef.current.innerText)
    }
  }

  // Handle key down in contentEditable div
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !uploading && !isRecording) {
      e.preventDefault()
      if (newMessage.trim() || selectedFiles.length > 0) {
        handleSendClick()
      }
    }
  }

  // Handle emoji selection
  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji)
    if (messageInputRef.current) {
      messageInputRef.current.innerText += emojiData.emoji
    }
    setShowEmojiPicker(false)
  }

  // Helper function
  const getFileIcon  = (file) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />
    if (file.type.startsWith('audio/')) return <Mic className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes) => {
    if(bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatRecordingTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Render media messages
  const renderMediaMessage = (msg) => {
    if (!msg.attachments || msg.attachments.length === 0) return null
    
    return (
      <div className="space-y-2">
        {msg.attachments.map((attachment, idx) => (
          <div key={idx}>
            {attachment.type === 'image' && (
              <img 
                src={attachment.url} 
                alt={attachment.originalName}
                className="rounded-2xl cursor-pointer hover:opacity-90 transition-opacity max-w-full max-h-80 object-cover"
                onClick={() => setPreviewImage(attachment.url)}
              />
            )}
            {attachment.type === 'video' && (
              <div className="relative max-w-sm">
                <video 
                  src={attachment.url}
                  className="rounded-2xl max-w-full max-h-80 object-cover"
                  controls
                  poster={attachment.thumbnailUrl}
                />
              </div>
            )}
            {attachment.type === 'audio' && (
              <AudioPlayer 
                src={attachment.url}
                className={msg.sender === currentUserId ? 'bg-purple-100' : 'bg-slate-100'}
                messageId={msg._id}
                currentPlayingAudio={currentPlayingAudio}
                setCurrentPlayingAudio={setCurrentPlayingAudio}
              />
            )}
            {attachment.type === 'file' && (
              <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-2xl cursor-pointer max-w-sm">
                <FileText className={`h-8 w-8 ${msg.sender === currentUserId ? 'text-white/70' : 'text-slate-700'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${msg.sender === currentUserId ? 'text-white' : 'text-slate-700'}`}>
                    {attachment.originalName}
                  </p>
                  <p className={`text-xs ${msg.sender === currentUserId ? 'text-white/70' : 'text-slate-500'}`}>
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(attachment)
                  }}
                  className={`transition-colors cursor-pointer ${
                    msg.sender === currentUserId 
                      ? 'text-white hover:text-white/70' 
                      : 'text-slate-700 hover:text-slate-500'
                  }`}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const handleDownload = async (file) => {
    try {
      const res = await fetch(file.url)
      if (!res.ok) throw new Error('Network response was not ok')
      const blob = await res.blob()
    
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = file.originalName
      a.click()

      setTimeout(() => {
        URL.revokeObjectURL(a.href)
        a.remove()
      }, 1000)
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download file. Please try again later.')
    }
  }

  // Get current user object
  const currentUser = users.find(u => u._id === currentUserId) || { _id: currentUserId }

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-3xl shadow-2xl mb-6 mx-auto w-fit">
            <MessageCircle className="h-16 w-16 text-white mx-auto animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Welcome to GoTalk</h3>
          <p className="text-slate-600 text-lg">Select a conversation to start chatting</p>
        </div>
      </div>
    )
  }

  const isGroup = selectedConversation.isGroup
  const otherUserId = isGroup ? null : selectedConversation.members.find(m => m.user._id !== currentUserId)?.user._id
  const otherUser = users.find(u => u._id === otherUserId)

  const displayName = isGroup ? selectedConversation.groupName : otherUser?.fullName || 'Unknown'
  const isOnline = isGroup ? false : otherUser?.isOnline
  const lastOnline = isGroup ? null : otherUser?.lastOnline 

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-300/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {isGroup ? (
                <GroupAvatar
                  conversation={selectedConversation}
                  users={users}
                  currentUser={currentUser}
                  size="md"
                  showOnlineStatus={false}
                />
              ) : (
                <div className="flex items-center">
                  <Avatar
                    userInfo={otherUser || { fullName: displayName, avatar: null, color: 'bg-gradient-to-r from-indigo-500 to-purple-500' }}
                    size="small"
                    className="border border-slate-300"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{displayName}</h3>
              {!isGroup && <p className="text-sm text-slate-500">{isOnline ? 'Online' : lastOnline ? `Online ${getTimeAgo(lastOnline)}` : ''}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-3 cursor-pointer hover:bg-slate-100 rounded-2xl transition-colors">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-3 cursor-pointer hover:bg-slate-100 rounded-2xl transition-colors">
              <Video className="h-5 w-5" />
            </button>
            <button 
              className="p-3 cursor-pointer hover:bg-slate-100 rounded-2xl transition-colors"
              onClick={onToggleMembersSidebar}
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pinned Messages */}
      {pinnedMessages && pinnedMessages.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 py-2 m-2 shadow-sm rounded-md" ref={pinnedMessagesRef}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <MessageSquareText className="h-5 w-5 text-purple-600 flex-shrink-0" />
            <h4 className="text-sm font-semibold text-slate-700">Pinned Messages</h4>
          </div>

          {/* List Messages Pinned */}
          {(showAllPinned ? pinnedMessages : pinnedMessages.slice(0, 1)).map((msg, index) => (
            <div
              key={index}
              id={`pinned-message-${msg._id}`}
              onClick={() => {
                const el = document.getElementById(`message-${msg._id}`)
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  el.classList.add('bg-purple-100')
                  setTimeout(() => el.classList.remove('bg-purple-100'), 1000)
                }
              }}
              className="group bg-purple-50 px-3 py-2 rounded-md shadow-sm mb-1 last:mb-0 cursor-pointer hover:bg-purple-100 transition flex justify-between items-center"
            >
              <div className="flex items-center space-x-2">
                {msg.attachments?.length > 0 ? (() => {
                  const type = msg.attachments[0].type
                  const originalName = msg.attachments[0].originalName

                  if (type === 'file') return (
                    <>
                      <div className="text-sm text-slate-800 truncate max-w-[85%]">
                        <span className="font-medium">{msg.senderName}</span>: {msg.text}
                      </div>
                      <FileText className="h-4 w-4 text-purple-500" />
                      <div className="text-sm text-slate-800 truncate max-w-[85%]">
                        File • {originalName}
                      </div>
                    </>
                  )

                  if (type === 'video') return (
                    <>
                      <div className="text-sm text-slate-800 truncate max-w-[85%]">
                        <span className="font-medium">{msg.senderName}</span>: {msg.text}
                      </div>
                      <FileVideo className="h-4 w-4 text-purple-500" />
                      <div className="text-sm text-slate-800 truncate max-w-[85%]">
                        Video • {originalName}
                      </div>
                    </>
                  )

                  if (type === 'image') return (
                    <>
                      <div className="text-sm text-slate-800 truncate max-w-[85%]">
                        <span className="font-medium">{msg.senderName}</span>: {msg.text}
                      </div>
                      <FileImage className="h-4 w-4 text-purple-500" />
                      <div className="text-sm text-slate-800 truncate max-w-[85%]">
                        Image • {originalName}
                      </div>
                    </>
                  )

                  if (type === 'audio') return (
                    <>
                      <div className="text-sm text-slate-800 truncate max-w-[85%]">
                        <span className="font-medium">{msg.senderName}</span>: {msg.text}
                      </div>
                      <Mic className="h-4 w-4 text-purple-500" />
                      <div className="text-sm text-slate-800 truncate max-w-[85%]">
                        Audio • {originalName}
                      </div>
                    </>
                  )

                  return null
                })() : (
                  <div className="text-sm text-slate-800 truncate">
                    <span className="font-medium">{msg.senderName}</span>: {msg.text}
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUnpinMessage(msg._id)
                  setActiveMessageMenu?.(null)
                }}
                className="text-xs text-slate-500 cursor-pointer hover:text-red-600 ml-2"
              >
                Unpin
              </button>
            </div>
          ))}

          {/* Toggle */}
          {pinnedMessages.length > 1 && (
            <button
              onClick={() => setshowAllPinned(!showAllPinned)}
              className="text-sm text-purple-600 cursor-pointer mt-1"
            >
              {showAllPinned ? 'Show less' : `Show ${pinnedMessages.length - 1} more`}
            </button>
          )}
        </div>
      )}

      {/* Message Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} id={`message-${msg._id}`} className={`flex ${msg.sender === currentUserId ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className="relative flex flex-col">
              <div className="relative max-w-md group">
                <div className={`rounded-3xl shadow-md  
                  ${
                    msg.deleted
                      ? 'bg-white text-slate-500 border border-slate-300 italic px-4 py-2'
                      : msg.attachments && msg.attachments.length > 0 && (msg.attachments[0].type === 'image' || msg.attachments[0].type === 'video')
                        ? ''
                        : msg.sender === currentUserId
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-white shadow-purple-500/25'
                          : 'bg-[rgb(240,240,240)] text-black shadow-slate-200/50 px-6 py-4 border border-slate-200/50'
                  }`}>
                  {msg.deleted ? (
                    <div className="text-sm">This message has been recalled.</div>
                  ) : msg.messageType === 'media' ? (
                    renderMediaMessage(msg)
                  ) : (
                    <div className="text-sm break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.text }} />
                  )}
                  <div 
                    className={`
                      text-xs mt-2 
                      ${msg.deleted 
                        ? 'text-slate-400' 
                        : msg.attachments && msg.attachments.length > 0 && (msg.attachments[0].type === 'image' || msg.attachments[0].type === 'video')
                          ? 'text-white/90 bg-black/50 absolute bottom-2 right-2 rounded-full p-1' 
                          : msg.sender === currentUserId 
                            ? 'text-white/70' 
                            : 'text-slate-500'
                      }`}
                  >
                    {msg.time}
                  </div>
                </div>

                {/* Message Menu Button */}
                {!msg.deleted && (
                  <div className={`absolute top-1/2 -translate-y-1/2 ${msg.sender === currentUserId ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMessageMenuClick(i, e)
                      }}
                      className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus-ring-opacity-50"
                      ref={messagesMenuRef}
                      aria-label="Message options"
                      aria-expanded={activeMessageMenu === i}
                      aria-haspopup="menu"
                    >
                      <MoreVertical className="h-4 w-4 text-slate-600" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMessageMenu === i && (
                      <div className={`absolute top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/50 py-2 z-100 ${
                        msg.sender === currentUserId ? 'right-0' : 'left-0'
                      }`}>
                        {pinnedMessages.some(p => p._id === msg._id) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onUnpinMessage(msg._id)
                              setActiveMessageMenu(null)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center space-x-3 transition-colors cursor-pointer border-0 bg-transparent"
                            type="button"
                          >
                            <Pin className="h-4 w-4 text-purple-600" />
                            <span className="text-sm text-purple-700">Unpin message</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onPinMessage(msg._id)
                              setActiveMessageMenu(null)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center space-x-3 transition-colors cursor-pointer border-0 bg-transparent"
                            type="button"
                          >
                            <Pin className="h-4 w-4 text-slate-600" />
                            <span className="text-sm text-slate-700">Pin message</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteMessage(msg._id)
                            setActiveMessageMenu(null)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 transition-colors cursor-pointer text-red-600 border-0 bg-transparent"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700">Recall message</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message Status */}
              {msg.sender === currentUserId && msg.status === 'sent' && msg.deleted === false && i === messages.length - 1 && (
                <div className="mt-2 text-xs text-black text-right w-full">
                  <span>
                    Sent {
                      Date.now() - new Date(msg.createdAt).getTime() < 60 * 1000
                        ? ''
                        : getTimeAgo(msg.createdAt)
                    }
                  </span>
                </div>
              )}
              {msg.sender === currentUserId && msg.status === 'seen' && msg.deleted === false && i === messages.length - 1 && (
                <div className="flex items-center mt-1 space-x-1 justify-end flex-wrap">
                  {msg.seenBy.slice(0, 5).map((user, index) => (
                    <div key={index} className="group relative" title={user.userId.fullName}>
                      <Avatar
                        userInfo={user.userId}
                        size=""
                        className="w-4 h-4 text-xs"
                      />
                      <div className="absolute bottom-full mb-2 right-0
                                      bg-gray-700 text-white text-xs rounded-lg px-2 py-1 
                                      opacity-0 group-hover:opacity-100 
                                      pointer-events-none transition-all duration-200 whitespace-nowrap z-10">
                        <span>Seen by {user.userId.fullName} at {formatSeenAt(user.seenAt)}</span>
                      </div>
                    </div>
                  ))}
                  {msg.seenBy.length > 5 && (
                    <div className="text-xs text-slate-500">
                      +{msg.seenBy.length - 5} more
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview Area */}
      {selectedFiles.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/50 p-4 max-h-32 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-2">
            <Upload className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-slate-700">Files to send ({selectedFiles.length})</span>
            {uploading && (
              <div className="flex items-center space-x-1">
                <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                <span className="text-xs text-slate-700">Uploading...</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                { file.type.startsWith('image/') ? (
                  <div className="relative w-15 h-15 rounded-lg overflow-hidden cursor-pointer" onClick={() => setPreviewImage(previewUrls[index])}>
                    <img src={previewUrls[index]} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-lg py-2 cursor-pointer" onClick={() => handleDownload({ url: previewUrls[index], originalName: file.name })}>
                    <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-2 pr-8 max-w-xs">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/50 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading || isRecording}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Image/Video Upload Button */}
            <button
              onClick={() => imageInputRef.current.click()}
              disabled={uploading || isRecording}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
            >
              <Image className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 relative">
            <div className="w-full border border-slate-200/50 rounded-3xl bg-slate-100/50 focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:bg-white transition-all duration-200 overflow-hidden">
              {/* Placeholder overlay */}
              {!isRecording && (!newMessage || newMessage.trim() === '') && (
                <div className="absolute inset-0 flex items-start px-6 py-3 pointer-events-none">
                  <span className="text-slate-500">Type a message...</span>
                </div>
              )}
              
              <div
                ref={messageInputRef}
                contentEditable={!uploading && !isRecording && selectedFiles.length === 0}
                className="
                  w-full px-6 py-3 pr-12
                  focus:outline-none 
                  min-h-[44px] max-h-32 overflow-y-auto 
                  break-words whitespace-pre-wrap overflow-wrap-anywhere
                  [&::-webkit-scrollbar]:w-[4px] 
                  [&::-webkit-scrollbar-thumb]:bg-slate-300
                  [&::-webkit-scrollbar-thumb]:rounded-full
                "
                style={{
                  wordWrap: 'break-word',
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere'
                }}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
              >
              </div>
            </div>
            
            {isRecording && (
              <div className="absolute inset-0 flex items-center px-8 pointer-events-none bg-slate-50 rounded-3xl">
                <span className="text-slate-500">{`${status}... (${formatRecordingTime(recordingTime)})`}</span>
              </div>
            )}
            <div className="absolute inset-y-0 flex items-center right-4" ref={emojiPickerRef}>
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={uploading}>
                <Smile className={`h-5 cursor-pointer w-5 ${showEmojiPicker ? 'text-pink-700' : 'text-gray-500'}`} />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 z-50">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-2xl transition-colors cursor-pointer ${
                isRecording ? 'bg-red-500 hover:bg-red-400 text-white' : 'hover:bg-slate-100'
              }`}
              disabled={uploading}
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                if ((newMessage.trim() || selectedFiles.length > 0) && !uploading) {
                  handleSendClick()
                }
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl object-contain"
          />
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}

export default ChatWindow