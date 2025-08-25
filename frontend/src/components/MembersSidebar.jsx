import { useState, useEffect, useRef } from 'react'
import { Bell, Search, LogOut, Play, CircleX, Check, X, File, FileText, Image, FileSpreadsheet, Trash, Crown, Shield, User, MoreVertical, ChevronDown, ChevronLeft, PenLine, Camera, LoaderCircle, UserPlus } from 'lucide-react'
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
  onLeaveConversation,
  onDeleteConversation,
  onUpdateMemberRole,
  onAddMembers,
  onRemoveMember,
  uploading,
}) => {
  const [showMembers, setShowMembers] = useState(false)
  const [showMedia, setShowMedia] = useState(false)
  const [showFiles, setShowFiles] = useState(false)
  const [viewMode, setViewMode] = useState('normal')
  const [previewItem, setPreviewItem] = useState(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newGroupName, setNewGroupName] = useState(selectedConversation?.groupName || '')
  const [dropdownStates, setDropdownStates] = useState(null)
  const dropdownRef = useRef(null)
  const fileInputRef = useRef(null)

  // New states for add member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [searchItemModal, setSearchItemModal] = useState('')
  const [modalUsers, setModalUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])

  // Func to toggle dropdown for a specific member
  const toggleDropdown = (memberId) => {
    setDropdownStates(prev => (prev === memberId ? null : memberId))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownStates(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle filtering users inside add member modal
  useEffect(() => {
    const delay = setTimeout(() => {
      const fetchSearchResults = async () => {
        try {
          const query = searchItemModal.trim()
          let fetchedUsers = []
          if (!query) {
            // If no query, perhaps load all users or an initial list; here assuming fetch all if empty
            const res = await fetch(`http://localhost:3000/api/users/search?q=`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            })
            fetchedUsers = await res.json()
          } else {
            const res = await fetch(`http://localhost:3000/api/users/search?q=${encodeURIComponent(query)}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            })
            fetchedUsers = await res.json()
          }

          if (Array.isArray(fetchedUsers)) {
            // Exclude current members
            const currentMemberIds = selectedConversation.members.map(m => m.userId._id)
            const filtered = fetchedUsers.filter(u => !currentMemberIds.includes(u._id) && u._id !== currentUserId)
            setModalUsers(filtered)
          } else {
            console.error('Invalid users data')
          }
        } catch (error) {
          console.error('Error fetching users:', error)
        }
      }

      fetchSearchResults()
    }, 100)

    return () => clearTimeout(delay)
  }, [searchItemModal, selectedConversation.members, currentUserId])

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
        .filter((message) => message?.attachments && Array.isArray(message.attachments) && message.attachments.length > 0)
        .flatMap((message) =>
          message.attachments
            .filter((attachment) => ['image', 'video'].includes(attachment?.type))
            .map((attachment) => ({
              _id: attachment._id || `${message._id}-${attachment.url}`,
              url: attachment.url,
              thumbnailUrl: attachment.thumbnailUrl || attachment.url,
              type: attachment.type,
              originalName: attachment.originalName || 'Untitled',
              createdAt: message.createdAt,
            }))
        )
    : []

  const fileItems = Array.isArray(files)
    ? files
        .filter((message) => message?.attachments && Array.isArray(message.attachments) && message.attachments.length > 0)
        .flatMap((message) =>
          message.attachments
            .filter((attachment) => ['file'].includes(attachment?.type))
            .map((attachment) => ({
              _id: attachment._id || `${message._id}-${attachment.url}`,
              url: attachment.url,
              type: attachment.type,
              originalName: attachment.originalName || 'Untitled',
              mimetype: attachment.mimetype,
              size: attachment.size,
              createdAt: message.createdAt,
            }))
        )
    : []

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
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

  const handleAddMembers = async (e) => {
    e.preventDefault()
    if (selectedUsers.length === 0) return

    const userIds = selectedUsers.map(u => u._id)
    await onAddMembers(selectedConversation._id, userIds)
    setShowAddMemberModal(false)
    setSelectedUsers([])
    setSearchItemModal('')
  }

  const handleRemoveMember = async (memberId) => {
    await onRemoveMember(selectedConversation._id, memberId)
    setDropdownStates(null)
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
          mediaItems.map((item) => (
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
          fileItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center space-x-3 hover:bg-slate-100 rounded-lg p-3 shadow-sm transition-colors w-full cursor-pointer"
            >
              <div className="w-10 h-10 flex items-center justify-center">{getFileIcon(item)}</div>
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

  const currentUser = users.find((u) => u._id === currentUserId) || { _id: currentUserId }

  if (!selectedConversation.isGroup) {
    const otherUserId = selectedConversation.members.find((m) => m.userId._id !== currentUserId)?.userId._id
    const userDetails = users.find((u) => u._id === otherUserId)

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
                <Avatar userInfo={userDetails} size="medium" className="border-slate-200 border-2" />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm">
                    <LoaderCircle className="h-6 w-6 text-purple-600 animate-spin" />
                  </div>
                )}
              </div>
              <h2 className="mt-4 mb-1 text-xl font-bold text-purple-900">{userDetails.fullName || userDetails.username || 'Unknown'}</h2>
              <p className="text-sm text-slate-500">{userDetails.isOnline ? 'Online' : 'Offline'}</p>
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

            <div className="flex flex-col px-2 py-4 text-slate-700 flex-1">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex justify-between text-purple-900 py-2 px-2 cursor-pointer items-center w-full rounded-lg hover:bg-purple-50 transition-colors font-semibold"
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
                      mediaItems.slice(0, 8).map((item) => (
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
                  className="flex justify-between text-purple-900 py-2 px-2 cursor-pointer items-center w-full rounded-lg hover:bg-purple-50 transition-colors font-semibold mt-2"
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
                      fileItems.slice(0, 3).map((item) => (
                        <div key={item._id} className="flex items-center space-x-3 hover:bg-slate-100 rounded-md py-2 px-2 cursor-pointer">
                          <div className="w-8 h-8 flex items-center justify-center">{getFileIcon(item)}</div>
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
                className="flex justify-between text-purple-900 cursor-pointer items-center rounded-lg hover:bg-purple-50 transition-colors font-semibold py-2 px-2 mt-2"
              >
                <span>Privacy & Support</span>
                <ChevronDown className="w-4 h-4 text-slate-600 font-semibold" />
              </button>
            </div>

            <footer className="p-4 border-t border-slate-200">
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
    const userDetails = users.find(u => u._id === member.userId._id) || member.userId
    return {
      ...member,
      ...userDetails,
      isOnline: userDetails.isOnline || false,
      lastOnline: userDetails.lastOnline,
    }
  })
  const isOwner = membersWithDetails.some(member => member.userId._id === currentUser._id && member.role === 'owner')
  const isAdmin = membersWithDetails.some(member => member.userId._id === currentUser._id && member.role === 'admin')
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
                    onKeyDown={(e) => e.key === 'Enter' && handleNameChange()}
                    autoFocus
                    placeholder="Nhập tên nhóm..."
                    className="flex-1 text-base font-medium text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-shadow"
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
                  <h2 className="font-bold text-xl text-center text-purple-900">{selectedConversation.groupName}</h2>
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
                className="flex text-purple-900 justify-between py-2 px-2 cursor-pointer items-center w-full rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                onClick={() => setShowMembers(!showMembers)}
              >
                <span>Members ({membersWithDetails.length})</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-600 font-semibold transition-transform ${showMembers ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {showMembers && (
              <div className="w-full">
                {/* Add Member Button */}
                {(isOwner || isAdmin) && (
                  <div className="flex justify-center my-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberModal(true)}
                      className="inline-flex items-center cursor-pointer gap-1.5 px-3 py-1.5
                                rounded-md border border-purple-300 text-sm text-purple-600 font-medium
                                hover:bg-purple-50
                                transition-colors duration-200"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Member</span>
                    </button>
                  </div>
                )}

                {/* Members List */}
                <section id="members-list" className="space-y-2" ref={dropdownRef}>
                  {membersWithDetails.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center cursor-pointer justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors duration-200 group relative"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        {/* Avatar with Online Status */}
                        <div className="relative flex-shrink-0">
                          <Avatar userInfo={member} size="small" />
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                              member.isOnline 
                                ? 'bg-green-500' 
                                : 'bg-slate-400'
                            }`}
                          />
                        </div>

                        {/* Member Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-slate-800 truncate">
                              {member.fullName}
                              {member._id === currentUserId && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                                  You
                                </span>
                              )}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-3 text-sm">
                            {/* Role Badge */}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.role === 'owner' 
                                ? 'bg-amber-100 text-amber-800' 
                                : member.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {getRoleLabel(member.role)}
                            </span>
                            
                            {/* Online Status */}
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  member.isOnline ? 'bg-green-400' : 'bg-slate-300'
                                }`}
                              />
                              <span
                                className={`text-xs font-medium leading-none ${
                                  member.isOnline ? 'text-green-600' : 'text-slate-500'
                                }`}
                              >
                                {member.isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions Menu */}
                      {member._id !== currentUserId && (
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded-lg transition-colors duration-200 cursor-pointer"
                            aria-label="Manage member"
                            onClick={() => toggleDropdown(member._id)}
                          >
                            <MoreVertical className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                          </button>

                          {/* Dropdown Menu */}
                          {dropdownStates === member._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg z-20 py-1">
                              {/* View Profile */}
                              <button
                                className="w-full px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center space-x-2 text-left"
                                onClick={() => {
                                  console.log(`Xem hồ sơ của ${member.fullName}`)
                                  toggleDropdown(member._id)
                                }}
                              >
                                <User className="w-4 h-4 text-slate-600" />
                                <span>View profile</span>
                              </button>

                              {/* Admin Rights Toggle */}
                              {isOwner && member.role !== 'owner' && (
                                <button
                                  className="w-full px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center space-x-2 text-left"
                                  onClick={() => {
                                    onUpdateMemberRole(
                                      selectedConversation._id,
                                      member._id,
                                      member.role === 'admin' ? 'member' : 'admin'
                                    )
                                    toggleDropdown(member._id)
                                  }}
                                >
                                  <Shield className="w-4 h-4 text-slate-600" />
                                  <span>
                                    {member.role === 'admin' ? 'Remove admin rights' : 'Make admin'}
                                  </span>
                                </button>
                              )}

                              {/* Remove Member */}
                              {(isOwner || isAdmin) && member.role !== 'owner' && (
                                <>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    className="w-full px-4 py-2 hover:bg-red-50 cursor-pointer flex items-center space-x-2 text-left text-red-600"
                                    onClick={() => {
                                      handleRemoveMember(member._id)
                                    }}
                                  >
                                    <Trash className="w-4 h-4" />
                                    <span>Remove from group</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex justify-between text-purple-900 py-2 px-2 cursor-pointer items-center w-full rounded-lg hover:bg-purple-50 transition-colors font-semibold mt-2"
                onClick={() => setShowMedia(!showMedia)}
              >
                <span>Photos & Videos</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-600 font-semibold transition-transform ${showMedia ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {showMedia && (
              <>
                <section className="grid grid-cols-4 gap-2 py-2 px-2">
                  {mediaItems.length > 0 ? (
                    mediaItems.slice(0, 8).map((item) => (
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
                className="flex justify-between text-purple-900 py-2 px-2 cursor-pointer items-center w-full rounded-lg hover:bg-purple-50 transition-colors font-semibold mt-2"
                onClick={() => setShowFiles(!showFiles)}
              >
                <span>Files</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-600 font-semibold transition-transform ${showFiles ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {showFiles && (
              <>
                <section className="space-y-2">
                  {fileItems.length > 0 ? (
                    fileItems.slice(0, 3).map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center space-x-3 hover:bg-slate-100 rounded-md py-2 px-2 cursor-pointer"
                      >
                        <div className="w-8 h-8 flex items-center justify-center">{getFileIcon(item)}</div>
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
              className="flex justify-between text-purple-900 cursor-pointer items-center rounded-lg hover:bg-purple-50 transition-colors font-semibold py-2 px-2 mt-2"
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
              <span>Delete chat history</span>
            </button>
            {isOwner && (
              <button
                type="button"
                className="w-full mb-4 cursor-pointer flex items-center justify-center space-x-2 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 shadow-sm transition-colors"
                onClick={() => onDeleteConversation(selectedConversation._id)}
              >
                <CircleX className="w-5 h-5" />
                <span>Delete group</span>
              </button>
            )}
            <button
              type="button"
              className="w-full cursor-pointer flex items-center justify-center space-x-2 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 shadow-sm transition-colors"
              aria-label="Rời nhóm"
              onClick={() => onLeaveConversation(selectedConversation._id)}
            >
              <LogOut className="w-5 h-5" />
              <span>Leave Group</span>
            </button>
          </footer>
        </>
      )}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setPreviewItem(null)}>
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

      {/* Modal add members */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[105vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-slate-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Members</h3>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false)
                    setSelectedUsers([])
                    setSearchItemModal('')
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form add members */}
            <form onSubmit={handleAddMembers}>
              {/* Search Section */}
              <div className="px-6 pt-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-slate-700 placeholder-slate-400"
                    value={searchItemModal}
                    onChange={(e) => setSearchItemModal(e.target.value)}
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="px-6 pb-6 max-h-80 overflow-y-auto">
                {modalUsers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-sm">No users found</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {modalUsers.map(user => {
                      const isUserSelected = selectedUsers.some(selected => selected._id === user._id)
                      return (
                        <li
                          key={user._id}
                          className="group p-4 bg-slate-50 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-md cursor-pointer transition-all duration-200 border border-transparent hover:border-purple-200"
                          onClick={() => {
                            if (isUserSelected) {
                              setSelectedUsers(selectedUsers.filter(selected => selected._id !== user._id))
                            } else {
                              setSelectedUsers([...selectedUsers, user])
                            }
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            {/* Avatar */}
                            <div className="relative">
                              <Avatar
                                userInfo={user}
                                size="small"
                                className="group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                              <span className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors duration-200">
                                {user.fullName}
                              </span>
                              <p className="text-sm text-slate-500 mt-1">
                                {isUserSelected ? 'Selected' : 'Click to select'}
                              </p>
                            </div>

                            {/* Status Icon */}
                            <div className={`transition-all duration-200 ${isUserSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              {isUserSelected ? (
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              ) : (
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="px-6 py-2 cursor-pointer bg-slate-200 hover:bg-slate-300 rounded-xl font-medium text-slate-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200"
                      onClick={() => {
                        setShowAddMemberModal(false)
                        setSelectedUsers([])
                        setSearchItemModal('')
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={selectedUsers.length === 0}
                      className="px-6 py-2 cursor-pointer bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200"
                    >
                      Add Members
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  )
}

export default MembersSidebar