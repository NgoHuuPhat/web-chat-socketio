import { Camera } from 'lucide-react'

const Avatar = ({ userInfo, onAvatarClick, size = 'large', className = '' }) => {
    const sizeClasses = {
      small: 'w-16 h-16 text-xl',
      medium: 'w-24 h-24 text-2xl', 
      large: 'w-48 h-48 text-4xl'
    };

    return (
      <div className="relative group">
        <div className={`rounded-full overflow-hidden border-4 border-white bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 flex items-center justify-center text-white font-bold transition-all duration-500 hover:scale-110 hover:rotate-3 shadow-2xl shadow-purple-300/40 ${sizeClasses[size]} ${className}`}>
          {userInfo.avatar && (
            <img 
              src={userInfo.avatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {onAvatarClick && (
          <button 
            onClick={onAvatarClick}
            className="absolute cursor-pointer inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
          >
            <Camera className="w-6 h-6 text-white drop-shadow-lg" />
          </button>
        )}
      </div>
    );
  }

export default Avatar

