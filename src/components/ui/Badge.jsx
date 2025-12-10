import React from 'react'

export function Badge({ children, variant = 'default', className = '' }) {
    const variants = {
        default: 'bg-slate-800/80 text-slate-300 border-slate-700 backdrop-blur-sm',
        success: 'bg-teal-500/10 text-teal-300 border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]',
        warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
        danger: 'bg-red-500/10 text-red-300 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
        info: 'bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
            {children}
        </span>
    )
}
