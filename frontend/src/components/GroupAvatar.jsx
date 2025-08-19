
const GroupAvatar = ({ 
  conversation, 
  users, 
  currentUser, 
  size = 'md',
  isSelected = false,
  showOnlineStatus = false 
}) => {
  const isGroup = conversation.isGroup === true
  const sizeConfig = {
    sm: {
      container: 'h-8 w-8',
      avatar: 'h-4 w-4',
      text: 'text-xs',
    },
    md: {
      container: 'h-12 w-12',
      avatar: 'h-6 w-6',
      text: 'text-xs',
    },
    lg: {
      container: 'h-16 w-16',
      avatar: 'h-8 w-8',
      text: 'text-xs',
    }
  }

  const config = sizeConfig[size]
  const borderClass = isSelected ? 'border-white' : 'border-slate-300'

  if (isGroup) {
    // Group avatar logic
    if (conversation.groupAvatar) {
      return (
        <div className="relative">
          <img
            src={conversation.groupAvatar}
            alt={`${conversation.groupName || 'Group'}'s Avatar`}
            className={`${config.container} rounded-full object-cover border ${borderClass}`}
          />
        </div>
      )
    }

    // No group avatar, show member avatars
    const allMembers = conversation.members || []
    const totalMembers = allMembers.length

    const renderMemberAvatar = (allMembers, index) => (
      <div key={index} className="relative">
        {allMembers?.user.avatar ? (
          <img
            src={allMembers.user.avatar}
            alt={`${allMembers.user.fullName}'s Avatar`}
            className={`${config.avatar} rounded-full object-cover border ${borderClass}`}
          />
        ) : (
          <div className={`${config.avatar} rounded-full  flex items-center justify-center text-white font-bold ${config.text} ${borderClass} ${
            allMembers?.color || 'bg-gradient-to-r from-indigo-500 to-purple-500'
          }`}>
            {allMembers?.fullName?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>
    )

    if (totalMembers === 2) {
      return (
        <div className="flex space-x-[-4px]">
          {allMembers.slice(0, 2).map((allMembers, idx) => renderMemberAvatar(allMembers, idx))}
        </div>
      )
    } else if (totalMembers === 3) {
      return (
        <div className="flex flex-col space-y-[-4px]">
          {/* First row: 1 avatar centered */}
          <div className="flex justify-center">
            {renderMemberAvatar(allMembers[0], 0)}
          </div>
          {/* Second row: 2 avatars */}
          <div className="flex space-x-[-4px] justify-center">
            {allMembers.slice(1, 3).map((allMembers, idx) => renderMemberAvatar(allMembers, idx + 1))}
          </div>
        </div>
      )
    } else {
      // 4+ members
      const extraMembers = totalMembers - 3
      return (
        <div className="flex flex-col space-y-[-4px]">
          {/* First row: 2 avatars */}
          <div className="flex space-x-[-4px]">
            {allMembers.slice(0, 2).map((allMembers, idx) => renderMemberAvatar(allMembers, idx))}
          </div>
          {/* Second row: 1 avatar + count */}
          <div className="flex space-x-[-4px]">
            {renderMemberAvatar(allMembers[2], 2)}
            <div className={`${config.avatar} rounded-full bg-gray-400 flex items-center justify-center text-white font-bold ${config.text} border ${borderClass}`}>
              +{extraMembers > 99 ? '99' : extraMembers}
            </div>
          </div>
        </div>
      )
    }
  } else {
    // One-on-one conversation
    const partnerId = conversation.members.find(member => member._id !== currentUser._id)?._id
    const partner = users.find(user => user._id === partnerId)
    
    if (partner) {
      const isOnline = showOnlineStatus && partner.isOnline

      return (
        <div className="relative">
          {partner.avatar ? (
            <img
              src={partner.avatar}
              alt={`${partner.fullName}'s Avatar`}
              className={`${config.container} rounded-full object-cover border ${borderClass}`}
            />
          ) : (
            <div className={`${config.container} rounded-full flex items-center justify-center text-white font-bold ${config.text} ${
              partner.color || 'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}>
              {partner.fullName?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          {isOnline && (
            <div className={`absolute bottom-0 right-0 ${config.online} bg-green-500 border border-white rounded-full`}></div>
          )}
        </div>
      )
    } else {
      return (
        <div className={`${config.container} rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold ${config.text}`}>
          ?
        </div>
      )
    }
  }
}

export default GroupAvatar