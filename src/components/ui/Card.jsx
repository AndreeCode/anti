import React from 'react'

export function Card({ children, className = '', ...props }) {
    return (
        <div className={`card-premium ${className}`} {...props}>
            {children}
        </div>
    )
}
