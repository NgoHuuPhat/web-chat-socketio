import { useEffect, useRef, useState } from 'react'
import { Send, Mic, Video, Smile, Paperclip, Image, Phone, MoreVertical, MessageCircle } from 'lucide-react'

const ChatWindow = ({ selectedConversation, currentUserId, messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    onSendMessage(newMessage)
    setNewMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage()
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
  const isOnline = isGroup ? false : otherUser?.online

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
              {!isGroup && <p className="text-sm text-slate-500">{isOnline ? 'Active now' : 'Offline'}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {[Phone, Video, MoreVertical].map((Icon, i) => (
              <button key={i} className="p-3 hover:bg-slate-100 rounded-2xl">
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === currentUserId ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg transition-all duration-300 hover:scale-105 ${
              msg.sender === currentUserId
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25'
                : 'bg-white text-slate-800 shadow-slate-200/50 border border-slate-200/50'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-xs mt-2 ${msg.sender === currentUserId ? 'text-white/70' : 'text-slate-500'}`}>{msg.time}</p>
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
              <button key={i} className="p-3 hover:bg-slate-100 rounded-2xl">
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
              onKeyDown={handleKeyPress}
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2">
              <Smile className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-3 hover:bg-slate-100 rounded-2xl">
              <Mic className="h-5 w-5" />
            </button>
            <button
              onClick={handleSendMessage}
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
