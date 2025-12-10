import React from 'react'

export function Card({ children, className = '', ...props }) {
    return (
        <div className={`glass-card ${className}`} {...props}>
            {children}
        </div>
    )
}
