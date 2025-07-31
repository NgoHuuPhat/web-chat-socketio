import { Eye, EyeOff, AlertCircle } from 'lucide-react'

const FormField = ({ label, value, icon: Icon, isEditing = true, onChange, type = 'text', showPassword, onTogglePassword, error, ...props }) => {
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
  
  return (
    <div className="space-y-3">
      <label className="text-slate-700 font-semibold text-sm uppercase tracking-wider">
        {label}
      </label>
      
      {isEditing ? (
        <div className="relative mt-2">
          <input
            type={inputType}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-white/60 border border-indigo-200/50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 backdrop-blur-sm font-medium shadow-sm 
            ${
              Icon ? (isPassword ? 'pl-12' : 'pr-12') : ''
            } ${isPassword && onTogglePassword ? 'pr-12' : ''}
                ${error ? 'border-red-500' : 'border-gray-300'}`}
            {...props}
          />

          {/* Main Icon */}
          {Icon && (
            <Icon className={`absolute ${isPassword ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500`} />
          )}
          
          {/* Password Toggle Button */}
          {isPassword && onTogglePassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-3 p-3 bg-white/60 rounded-xl backdrop-blur-sm border border-indigo-200/50 shadow-sm">
          {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
          <span className="text-slate-800 font-semibold">
            {isPassword ? '••••••••' : (value || '—')}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 mt-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-600 text-sm font-medium">
            {error}
          </span>
        </div>
      )}
    </div>
  )
}

export default FormField
