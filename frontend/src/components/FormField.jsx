const FormField = ({ label, value, icon: Icon, isEditing, onChange, type = 'text' }) => (
  <div className="space-y-3">
    <label className="text-slate-700 font-semibold text-sm uppercase tracking-wider">{label}</label>
    {isEditing ? (
      <div className="relative">
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/60 border border-indigo-200/50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 backdrop-blur-sm font-medium shadow-sm"
        />
        {Icon && type !== 'date' && <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />}
      </div>
    ) : (
      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl backdrop-blur-sm border border-indigo-200/50 shadow-sm">
        {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
        <span className="text-slate-800 font-semibold">{value}</span>
      </div>
    )}
  </div>
)

export default FormField
