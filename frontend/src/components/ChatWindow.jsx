import { useEffect, useRef, useState } from 'react'
import { Send, Mic, Video, Smile, Paperclip, MessageSquareText, Image, Phone, MoreVertical, MessageCircle, Pin, Trash2 } from 'lucide-react'
import getTimeAgo from '../utils/getTimeAgo'
import EmojiPicker from 'emoji-picker-react'

const ChatWindow = ({ selectedConversation, currentUserId, messages, onSendMessage, onDeleteMessage, pinnedMessages, onPinMessage, onUnpinMessage }) => {
  const [newMessage, setNewMessage] = useState('')
  const [activeMessageMenu, setActiveMessageMenu] = useState(null)
  const [showAllPinned, setshowAllPinned] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMessageMenu !== null && !event.target.closest('.message-menu')) {
        setActiveMessageMenu(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [activeMessageMenu])

  const handleMessageMenuClick = (index, event) => {
    event.stopPropagation()
    setActiveMessageMenu(activeMessageMenu === index ? null : index)
  }

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
  const otherUser = isGroup ? null : selectedConversation.members.find(m => m._id !== currentUserId)
  const displayName = isGroup ? selectedConversation.groupName : otherUser?.fullName || 'Unknown'
  const displayColor = isGroup ? 'bg-gradient-to-r from-purple-500 to-pink-500' : otherUser?.color || 'bg-slate-400'
  const isOnline = isGroup ? false : otherUser?.isOnline
  const lastOnline = isGroup ? null : otherUser?.lastOnline 

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50/30">

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-lg ${displayColor}`}>
                {displayName?.[0]?.toUpperCase() || '?'}
              </div>
              {isOnline && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{displayName}</h3>
              {!isGroup && <p className="text-sm text-slate-500">{isOnline ? 'Active now' : `Active ${getTimeAgo(lastOnline)}`}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {[Phone, Video, MoreVertical].map((Icon, i) => (
              <button key={i} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pinned Messages */}
      {pinnedMessages && pinnedMessages.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 py-2 m-2 shadow-sm rounded-md">
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
              <p className="text-sm text-slate-800 truncate max-w-[85%]">
                <span className="font-medium">{msg.senderName}</span>: {msg.text}
              </p>
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


      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} id={`message-${msg._id}`} className={`flex ${msg.sender === currentUserId ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
            <div className="relative">
              <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg transition-all duration-300 hover:scale-105 ${
                msg.deleted
                  ? 'bg-white text-slate-500 border border-slate-300 italic'
                  : msg.sender === currentUserId
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25'
                    : 'bg-[rgb(240,240,240)] text-black shadow-slate-200/50 border border-slate-200/50'
              }`}>
                {msg.deleted ? (
                  <p className="text-sm">This message has been recalled</p>
                ) : (
                  <p className="text-sm">{msg.text}</p>
                )}
                <p className={`text-xs mt-2 ${msg.deleted ? 'text-slate-400' : msg.sender === currentUserId ? 'text-white/70' : 'text-slate-500'}`}>
                  {msg.time}
                </p>
              </div>
              
              {/* Message Menu Button */}
              {!msg.deleted && (
                <div className={`absolute top-1/2 -translate-y-1/2 ${msg.sender === currentUserId ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                  <button
                    onClick={(e) => handleMessageMenuClick(i, e)}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors message-menu"
                  >
                    <MoreVertical className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              )}

              {/* Dropdown Menu */}
              {activeMessageMenu === i && (
                <div className={`absolute bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/50 py-2 message-menu z-50 ${
                  msg.sender === currentUserId ? 'right-0' : 'left-0'
                }`}>

                  {/* Pin or Unpin conditional */}
                  {pinnedMessages.some(p => p._id === msg._id) ? (
                    <button
                      onClick={() => {
                        onUnpinMessage(msg._id)
                        setActiveMessageMenu(null)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                    >
                      <Pin className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-purple-700">Unpin message</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onPinMessage(msg._id)
                        setActiveMessageMenu(null)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                    >
                      <Pin className="h-4 w-4 text-slate-600" />
                      <span className="text-sm text-slate-700">Pin message</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onDeleteMessage(msg._id)
                      setActiveMessageMenu(null)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">Recall message</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {[Paperclip, Image].map((Icon, i) => (
              <button key={i} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full border border-slate-200/50 rounded-3xl px-6 py-4 bg-slate-100/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white transition-all duration-200 placeholder-slate-500"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e)=>{
                if (e.key === 'Enter' && newMessage.trim()) {
                  onSendMessage(newMessage);
                  setNewMessage('');
                }
              }}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Smile className="h-5 w-5" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 z-50">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setNewMessage((prev) => prev + emojiData.emoji)
                      setShowEmojiPicker(false)
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
              <Mic className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                if(newMessage.trim()){
                  onSendMessage(newMessage)
                  setNewMessage('')
                }
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow