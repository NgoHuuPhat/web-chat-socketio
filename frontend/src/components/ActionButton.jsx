const ActionButton = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl shadow-blue-300/30',
    secondary: 'bg-gradient-to-r from-slate-300 to-slate-400 hover:from-slate-400 hover:to-slate-500 text-slate-700 border border-slate-300 shadow-lg shadow-slate-300/30',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl shadow-green-300/30'
  }

  return (
    <button
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 transition-all duration-300 ease-in-out px-6 py-3 rounded-xl font-semibold ${variants[variant]}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label}
    </button>
  )
}

export default ActionButton
