import { LoaderCircle } from "lucide-react"

const ActionButton = ({ icon: Icon, label, onClick, variant = 'primary', className, isLoading }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl shadow-blue-300/30',
    secondary: 'bg-gradient-to-r from-slate-300 to-slate-400 hover:from-slate-400 hover:to-slate-500 text-slate-700 border border-slate-300 shadow-lg shadow-slate-300/30',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl shadow-green-300/30'
  }

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`flex cursor-pointer justify-center items-center gap-2 transition-all duration-300 ease-in-out px-6 py-3 rounded-xl font-semibold ${variants[variant]} ${className} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        disabled={isLoading}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {label}
      </button>

      {isLoading && label === 'Change Password' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
          <LoaderCircle className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  )
}

export default ActionButton
