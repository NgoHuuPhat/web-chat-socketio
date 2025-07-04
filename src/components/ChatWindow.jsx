import { useEffect, useRef, useState } from 'react'
import { Send, Mic, Video, Smile, Paperclip, Image, Phone, MoreVertical, MessageCircle } from 'lucide-react'

const ChatWindow = ({ selectedUser, messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  if (!selectedUser) {
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

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-lg ${selectedUser.color}`}>
                {selectedUser.name[0]}
              </div>
              {selectedUser.online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{selectedUser.name}</h3>
              <p className="text-sm text-slate-500">
                {selectedUser.online ? 'Active now' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-200 hover:scale-105">
              <Phone className="h-5 w-5 text-slate-600" />
            </button>
            <button className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-200 hover:scale-105">
              <Video className="h-5 w-5 text-slate-600" />
            </button>
            <button className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-200 hover:scale-105">
              <MoreVertical className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg transition-all duration-300 hover:scale-105 ${
                message.sender === 'You'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25'
                  : 'bg-white text-slate-800 shadow-slate-200/50 border border-slate-200/50'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-2 ${
                message.sender === 'You' ? 'text-white/70' : 'text-slate-500'
              }`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-200 hover:scale-105">
              <Paperclip className="h-5 w-5 text-slate-600" />
            </button>
            <button className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-200 hover:scale-105">
              <Image className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full border border-slate-200/50 rounded-3xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent bg-slate-100/50 focus:bg-white transition-all duration-200 placeholder-slate-500"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200">
              <Smile className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-200 hover:scale-105">
              <Mic className="h-5 w-5 text-slate-600" />
            </button>
            <button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
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