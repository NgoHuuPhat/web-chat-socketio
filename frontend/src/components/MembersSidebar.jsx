import { useState, useRef } from 'react'
import { Bell, Search, LogOut, Play, Check, X, File, FileText, Image, FileSpreadsheet, Trash, Crown, Shield, User, MoreVertical, ChevronDown, ChevronLeft, PenLine, Camera, LoaderCircle } from 'lucide-react'
import { getTimeAgo } from '@/utils/formatTime'
import { formatTime } from '@/utils/formatTime'
import Avatar from '@/components/Avatar'
import GroupAvatar from '@/components/GroupAvatar'

const MembersSidebar = ({
  selectedConversation,
  users,
  currentUserId,
  media,
  files,
  onUpdateGroupName,
  onUpdateGroupAvatar,
  uploading
}) => {
  const [showMembers, setShowMembers] = useState(false)
  const [showMedia, setShowMedia] = useState(false)
  const [showFiles, setShowFiles] = useState(false)
  const [viewMode, setViewMode] = useState('normal')
  const [previewItem, setPreviewItem] = useState(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newGroupName, setNewGroupName] = useState(selectedConversation?.groupName || '')
  const fileInputRef = useRef(null)

  const getOnlineStatus = (member) => {
    const userDetails = users.find(u => u._id === member._id) || {}
    const isOnline = userDetails.isOnline
    const lastOnline = userDetails.lastOnline
    if (isOnline) return 'Online'
    if (lastOnline) return `Last seen ${getTimeAgo(lastOnline)}`
    return 'Offline'
  }

  const getFileIcon = (file) => {
    const extension = file.originalName?.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="text-purple-600 w-6 h-6" />
      case 'doc':
      case 'docx':
        return <FileText className="text-purple-600 w-6 h-6" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="text-purple-600 w-6 h-6" />
      case 'xlsx':
        return <FileSpreadsheet className="text-purple-600 w-6 h-6" />
      case 'txt':
        return <FileText className="text-purple-600 w-6 h-6" />
      default:
        return <File className="text-purple-600 w-6 h-6" />
    }
  }

  const mediaItems = Array.isArray(media)
    ? media
        .filter(message => message?.attachments && Array.isArray(message.attachments) && message.attachments.length > 0)
        .flatMap(message =>
          message.attachments
            .filter(attachment => ['image', 'video'].includes(attachment?.type))
            .map(attachment => ({
              _id: attachment._id || `${message._id}-${attachment.url}`,
              url: attachment.url,
              thumbnailUrl: attachment.thumbnailUrl || attachment.url,
              type: attachment.type,
              originalName: attachment.originalName || 'Untitled',
              createdAt: message.createdAt
            }))
        )
    : []

  const fileItems = Array.isArray(files)
    ? files
        .filter(message => message?.attachments && Array.isArray(message.attachments) && message.attachments.length > 0)
        .flatMap(message =>
          message.attachments
            .filter(attachment => ['file'].includes(attachment?.type))
            .map(attachment => ({
              _id: attachment._id || `${message._id}-${attachment.url}`,
              url: attachment.url,
              type: attachment.type,
              originalName: attachment.originalName || 'Untitled',
              mimetype: attachment.mimetype,
              size: attachment.size,
              createdAt: message.createdAt
            }))
        )
    : []

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleNameChange = () => {
    if (newGroupName.trim() && newGroupName !== selectedConversation.groupName) {
      onUpdateGroupName(selectedConversation._id, newGroupName)
    }
    setIsEditingName(false)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      onUpdateGroupAvatar(selectedConversation._id, file)
    }
    fileInputRef.current.value = null 
  }

  const renderAllMediaView = () => (
    <div className="flex flex-col h-full bg-white">
      <header className="p-4 border-b border-slate-200 flex items-center">
        <button
          type="button"
          className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          onClick={() => setViewMode('normal')}
          aria-label="Back to sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h2 className="ml-3 text-lg font-semibold text-slate-900">All Photos & Videos</h2>
      </header>
      <section className="flex-1 p-4 grid grid-cols-2 gap-3 overflow-y-auto">
        {mediaItems.length > 0 ? (
          mediaItems.map(item => (
            <div
              key={item._id}
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => setPreviewItem(item)}
            >
              {item.type === 'video' ? (
                <div className="relative w-28 h-28">
                  <video
                    src={item.url}
                    className="w-28 h-28 object-cover rounded-lg shadow-sm transition-transform hover:brightness-90"
                    poster={item.thumbnailUrl}
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-black/80 rounded-full p-2">
                      <Play className="w-6 h-6 text-white/90" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.originalName}
                  className="w-28 h-28 object-cover rounded-lg shadow-sm transition-transform hover:brightness-90"
                />
              )}
              <p className="text-xs text-slate-400 mt-2">{formatTime(item.createdAt)}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 col-span-2 text-center py-4">No Images/Videos shared in this conversation yet</p>
        )}
      </section>
    </div>
  )

  const renderAllFilesView = () => (
    <div className="flex flex-col h-full bg-white">
      <header className="p-4 border-b border-slate-200 flex items-center">
        <button
          type="button"
          className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          onClick={() => setViewMode('normal')}
          aria-label="Back to sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h2 className="ml-3 text-lg font-semibold text-slate-900">All Files</h2>
      </header>
      <section className="flex-1 p-4 space-y-3 cursor-pointer overflow-y-auto">
        {fileItems.length > 0 ? (
          fileItems.map(item => (
            <div key={item._id} className="flex items-center space-x-3 hover:bg-slate-100 rounded-lg p-3 shadow-sm transition-colors w-full cursor-pointer">
              <div className="w-10 h-10 flex items-center justify-center">
                {getFileIcon(item)}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={item.url || '#'}
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-purple-600 hover:underline truncate block"
                >
                  {item.originalName || 'Untitled'}
                </a>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                  <span>{formatFileSize(item.size)}</span>
                  <span>•</span>
                  <span>{formatTime(item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No Files have been shared in this conversation yet</p>
        )}
      </section>
    </div>
  )

  const currentUser = users.find(u => u._id === currentUserId) || { _id: currentUserId }

  if (!selectedConversation.isGroup) {
    const otherUserId = selectedConversation.members.find(m => m._id !== currentUserId)?._id
    const userDetails = users.find(u => u._id === otherUserId) || selectedConversation.members.find(m => m._id === otherUserId) || {}

    return (
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto">
        {viewMode === 'allMedia' ? (
          renderAllMediaView()
        ) : viewMode === 'allFiles' ? (
          renderAllFilesView()
        ) : (
          <>
            <div className="flex flex-col items-center pt-6 pb-4 px-4 bg-gradient-to-b from-white to-gray-50">
              <div className="relative">
                <Avatar
                  userInfo={userDetails}
                  size="medium"
                  className="border-slate-200 border-2"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm">
                    <LoaderCircle className="h-6 w-6 text-purple-600 animate-spin" />
                  </div>
                )}
              </div>
              <h2 className="mt-4 mb-1 text-xl font-semibold text-slate-900">{userDetails.fullName || userDetails.username || 'Unknown'}</h2>
              <p className="text-sm text-slate-500">{getOnlineStatus(userDetails)}</p>
            </div>

            <nav className="flex justify-center gap-2 space-x-4 mt-2 mb-4 text-slate-600 px-4">
              <button
                type="button"
                className="flex flex-col cursor-pointer items-center text-xs hover:text-purple-600 transition-colors"
                aria-label="Profile"
              >
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mb-1 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
                Profile
              </button>
              <button
                type="button"
                className="flex flex-col cursor-pointer items-center text-xs hover:text-purple-600 transition-colors"
                aria-label="Notifications"
              >
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mb-1 shadow-sm">
                  <Bell className="w-4 h-4" />
                </div>
                Notifications
              </button>
              <button
                type="button"
                className="flex flex-col cursor-pointer items-center text-xs hover:text-purple-600 transition-colors"
                aria-label="Search"
              >
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mb-1 shadow-sm">
                  <Search className="w-4 h-4" />
                </div>
                Search
              </button>
            </nav>

            <hr className="my-4 border-slate-200" />

            <div className="flex flex-col px-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex justify-between py-2 px-2 cursor-pointer items-center w-full rounded-lg hover:bg-slate-100 transition-colors font-semibold"
                  onClick={() => setShowMedia(!showMedia)}
                >
                  <span>Photos & Videos</span>
                  <ChevronDown className={`w-4 h-4 text-slate-600 font-semibold transition-transform ${showMedia ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showMedia && (
                <>
                  <section className="grid grid-cols-4 gap-2 py-2 px-2">
                    {mediaItems.length > 0 ? (
                      mediaItems.slice(0, 8).map(item => (
                        <div
                          key={item._id}
                          className="flex flex-col items-center group cursor-pointer"
                          onClick={() => setPreviewItem(item)}
                        >
                          {item.type === 'video' ? (
                            <div className="relative w-16 h-16">
                              <video
                                src={item.url}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm transition-transform hover:brightness-90"
                              />
                              <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="bg-black/80 rounded-full p-1.5">
                                  <Play className="w-4 h-4 text-white/90" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.originalName}
                              className="w-16 h-16 object-cover rounded-lg shadow-sm transition-transform hover:brightness-90"
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 col-span-4 text-center p-2">No Images/Videos shared in this conversation yet</p>
                    )}
                  </section>
                  {mediaItems.length > 8 && (
                    <button
                      type="button"
                      className="mt-3 w-full py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors cursor-pointer"
                      onClick={() => setViewMode('allMedia')}
                    >
                      See All ({mediaItems.length})
                    </button>
                  )}
                </>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex justify-between py-2 px-2 cursor-pointer items-center w-full rounded-lg hover:bg-slate-100 transition-colors font-semibold mt-2"
                  onClick={() => setShowFiles(!showFiles)}
                >
                  <span>Files</span>
                  <ChevronDown className={`w-4 h-4 text-slate-600 font-semibold transition-transform ${showFiles ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showFiles && (
                <>
                  <section className="space-y-2">
                    {fileItems.length > 0 ? (
                      fileItems.slice(0, 3).map(item => (
                        <div key={item._id} className="flex items-center space-x-3 hover:bg-slate-100 rounded-md py-2 px-2 cursor-pointer">
                          <div className="w-8 h-8 flex items-center justify-center">
                            {getFileIcon(item)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a
                              href={item.url || '#'}
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-purple-600 hover:underline truncate block"
                            >
                              {item.originalName || 'Untitled'}
                            </a>
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <span>{formatFileSize(item.size)}</span>
                              <span>•</span>
                              <span>{formatTime(item.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 text-center p-4">No Files have been shared in this conversation yet</p>
                    )}
                  </section>
                  {fileItems.length > 3 && (
                    <button
                      type="button"
                      className="mt-4 w-full py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors cursor-pointer"
                      onClick={() => setViewMode('allFiles')}
                    >
                      See All ({fileItems.length})
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                className="flex justify-between cursor-pointer items-center rounded-lg hover:bg-slate-100 transition-colors font-semibold py-2 px-2 mt-2"
              >
                <span>Privacy & Support</span>
                <ChevronDown className="w-4 h-4 text-slate-600 font-semibold" />
              </button>
            </div>

            <hr className="my-4 border-slate-200" />

            <footer className="p-4">
              <button
                type="button"
                className="w-full cursor-pointer flex items-center justify-center space-x-2 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 shadow-sm transition-colors"
              >
                <Trash className="w-5 h-5" />
                <span>Clear chat history</span>
              </button>
            </footer>
          </>
        )}
        {previewItem && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            onClick={() => setPreviewItem(null)}
          >
            {previewItem.type === 'video' ? (
              <video
                src={previewItem.url}
                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl object-contain"
                controls
                poster={previewItem.thumbnailUrl}
              />
            ) : (
              <img
                src={previewItem.url}
                alt={previewItem.originalName}
                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl object-contain"
              />
            )}
          </div>
        )}
      </aside>
    )
  }

  const members = selectedConversation.members || []
  const membersWithDetails = members.map(member => {
    const userDetails = users.find(u => u._id === member._id) || member
    return {
      ...member,
      ...userDetails,
      isOnline: userDetails.isOnline || false,
      lastOnline: userDetails.lastOnline,
    }
  })

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />
      default: return <User className="w-4 h-4 text-slate-400" />
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner': return 'Owner'
      case 'admin': return 'Admin'
      default: return 'Member'
    }
  }

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto">
      {viewMode === 'allMedia' ? (
        renderAllMediaView()
      ) : viewMode === 'allFiles' ? (
        renderAllFilesView()
      ) : (
        <>
          <header className="pt-6 pb-4 px-4 border-b border-slate-200 flex flex-col items-center">
            <div className={`relative ${uploading ? 'opacity-30' : ''}`}>
              <GroupAvatar
                conversation={selectedConversation}
                users={users}
                currentUser={currentUser}
                size="lg"
                showOnlineStatus={false}
                className="border-4 border-white shadow-2xl shadow-purple-300/40"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoaderCircle className="h-8 w-8 text-gray-700 animate-spin" />
                </div>
              )}

              <button
                type="button"
                className="absolute -bottom-1 -right-3 p-1 cursor-pointer bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                aria-label="Change group avatar"
              >
                <Camera className="w-4 h-4 text-slate-900" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </div>
            <div className="flex items-center space-x-2 mt-2 py-2">
              {isEditingName ? (
                <div className="flex items-center w-full gap-2 mt-2">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNameChange()}
                    autoFocus
                    placeholder="Enter a group name..."
                    className="flex-1 text-base font-medium text-slate-800 border border-slate-300 rounded-lg px-3 py-2
                              focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-shadow"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleNameChange}
                      className="flex items-center cursor-pointer justify-center w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
                    >
                      <Check className="w-4 h-4 text-purple-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false)
                        setNewGroupName(selectedConversation.groupName)
                      }}
                      className="flex items-center cursor-pointer justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-semibold text-xl text-center text-slate-900">{selectedConversation.groupName}</h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="p-1 bg-slate-100 cursor-pointer rounded-full hover:bg-slate-200 transition-colors"
                    aria-label="Edit group name"
                  >
                    <PenLine className="w-4 h-4 text-slate-900" />
                  </button>
                </>
              )}
            </div>
          </header>

          <nav className="flex flex-col px-2 py-4 text-slate-700 flex-1">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex justify-between py-2 px-2 cursor-pointer items-center w-full rounded-lg hover:bg-slate-100 transition-colors font-semibold"
                onClick={() => setShowMembers(!showMembers)}
              >
                <span>Members</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-600 font-semibold transition-transform ${showMembers ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {showMembers && (
              <section id="members-list" className="space-y-3 cursor-pointer">
                {membersWithDetails.map(member => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="relative">
                        <Avatar
                          userInfo={member}
                          size="small"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium truncate">
                            {member.fullName || member.username}
                            {member._id === currentUserId && (
                              <span className="text-xs text-slate-500 ml-1">(You)</span>
                            )}
                          </p>
                          {getRoleIcon(member.role)}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <p>{getRoleLabel(member.role)}</p>
                          <p>{getOnlineStatus(member)}</p>
                        </div>
                      </div>
                    </div>

                    {member._id !== currentUserId && (
                      <button
                        type="button"
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                        aria-label="Manage member"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-500" />
                      </button>
                    )}
                  </div>
                ))}
              </section>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex justify-between py-2 px-2 cursor-pointer items-center w-full rounded-lg hover:bg-slate-100 transition-colors font-semibold mt-2"
                onClick={() => setShowMedia(!showMedia)}
              >
                <span>Photos & Videos</span>
                <ChevronDown className={`w-4 h-4 text-slate-600 font-semibold transition-transform ${showMedia ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showMedia && (
              <>
                <section className="grid grid-cols-4 gap-2 py-2 px-2">
                  {mediaItems.length > 0 ? (
                    mediaItems.slice(0, 8).map(item => (
                      <div
                        key={item._id}
                        className="flex flex-col items-center group cursor-pointer"
                        onClick={() => setPreviewItem(item)}
                      >
                        {item.type === 'video' ? (
                          <div className="relative w-16 h-16">
                            <video
                              src={item.url}
                              className="w-16 h-16 object-cover rounded-lg shadow-sm transition-transform hover:brightness-90"
                            />
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <div className="bg-black/80 rounded-full p-1.5">
                                <Play className="w-4 h-4 text-white/90" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.originalName}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm transition-transform hover:brightness-90"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 col-span-4 text-center p-2">No Images/Videos shared in this conversation yet</p>
                  )}
                </section>
                {mediaItems.length > 8 && (
                  <button
                    type="button"
                    className="mt-3 w-full py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors cursor-pointer"
                    onClick={() => setViewMode('allMedia')}
                  >
                    See All ({mediaItems.length})
                  </button>
                )}
              </>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex justify-between py-2 px-2 cursor-pointer items-center w-full rounded-lg hover:bg-slate-100 transition-colors font-semibold mt-2"
                onClick={() => setShowFiles(!showFiles)}
              >
                <span>Files</span>
                <ChevronDown className={`w-4 h-4 text-slate-600 font-semibold transition-transform ${showFiles ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFiles && (
              <>
                <section className="space-y-2">
                  {fileItems.length > 0 ? (
                    fileItems.slice(0, 3).map(item => (
                      <div key={item._id} className="flex items-center space-x-3 hover:bg-slate-100 rounded-md py-2 px-2 cursor-pointer">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {getFileIcon(item)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <a
                            href={item.url || '#'}
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-purple-600 hover:underline truncate block"
                          >
                            {item.originalName || 'Untitled'}
                          </a>
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <span>{formatFileSize(item.size)}</span>
                            <span>•</span>
                            <span>{formatTime(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center p-2">No Files have been shared in this conversation yet</p>
                  )}
                </section>
                {fileItems.length > 3 && (
                  <button
                    type="button"
                    className="mt-4 w-full py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors cursor-pointer"
                    onClick={() => setViewMode('allFiles')}
                  >
                    See All ({fileItems.length})
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              className="flex justify-between cursor-pointer items-center rounded-lg hover:bg-slate-100 transition-colors font-semibold py-2 px-2 mt-2"
            >
              <span>Privacy & Support</span>
              <ChevronDown className="w-4 h-4 text-slate-600 font-semibold" />
            </button>
          </nav>

          <footer className="p-4 border-t border-slate-200">
            <button
              type="button"
              className="w-full mb-4 cursor-pointer flex items-center justify-center space-x-2 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 shadow-sm transition-colors"
            >
              <Trash className="w-5 h-5" />
              <span>Clear chat history</span>
            </button>
            <button
              type="button"
              className="w-full cursor-pointer flex items-center justify-center space-x-2 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 shadow-sm transition-colors"
              aria-label="Leave Group"
            >
              <LogOut className="w-5 h-5" />
              <span>Leave Group</span>
            </button>
          </footer>
        </>
      )}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setPreviewItem(null)}
        >
          {previewItem.type === 'video' ? (
            <video
              src={previewItem.url}
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl object-contain"
              controls
              poster={previewItem.thumbnailUrl}
            />
          ) : (
            <img
              src={previewItem.url}
              alt={previewItem.originalName}
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl object-contain"
            />
          )}
        </div>
      )}
    </aside>
  )
}

export default MembersSidebar