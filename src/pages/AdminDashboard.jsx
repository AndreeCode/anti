import React, { useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Categories from '../components/admin/Categories'
import Dishes from '../components/admin/Dishes'
import Tables from '../components/admin/Tables'
import AllOrders from '../components/admin/AllOrders'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export default function AdminDashboard() {
    const location = useLocation()
    const navigate = useNavigate()
    const { signOut } = useAuth()

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const navItems = [
        { path: '/admin/categories', label: 'Categorías', icon: '📁' },
        { path: '/admin/dishes', label: 'Platos', icon: '🍽️' },
        { path: '/admin/tables', label: 'Mesas', icon: '🪑' },
        { path: '/admin/orders', label: 'Pedidos', icon: '📋' },
    ]

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 glass-strong border-r border-white/5 sticky top-0 h-screen overflow-y-auto z-20">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                            Admin Panel
                        </h1>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${location.pathname === item.path
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25 ring-1 ring-primary-400'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                    }`}
                            >
                                <span className={`text-xl transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.path ? 'scale-110' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-white/5 space-y-2">
                        <Link to="/menu" className="block px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            Ver Menú Público
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all flex items-center gap-2"
                        >
                            <span>🚪</span> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto animate-enter">
                    <Routes>
                        <Route path="/" element={<AdminHome />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/dishes" element={<Dishes />} />
                        <Route path="/tables" element={<Tables />} />
                        <Route path="/orders" element={<AllOrders />} />
                    </Routes>
                </div>
            </main>
        </div>
    )
}

function AdminHome() {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-white">Panel de Administración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:scale-105 transition-transform cursor-pointer group border-l-4 border-l-blue-500">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-500/30 transition-colors shadow-lg shadow-blue-500/10">
                        📁
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Categorías</h3>
                    <p className="text-slate-400 text-sm">Gestiona las categorías del menú</p>
                </Card>
                <Card className="hover:scale-105 transition-transform cursor-pointer group border-l-4 border-l-orange-500">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl mb-4 group-hover:bg-orange-500/30 transition-colors shadow-lg shadow-orange-500/10">
                        🍽️
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Platos</h3>
                    <p className="text-slate-400 text-sm">Administra los platos del menú</p>
                </Card>
                <Card className="hover:scale-105 transition-transform cursor-pointer group border-l-4 border-l-purple-500">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl mb-4 group-hover:bg-purple-500/30 transition-colors shadow-lg shadow-purple-500/10">
                        🪑
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Mesas</h3>
                    <p className="text-slate-400 text-sm">Configura las mesas del restaurante</p>
                </Card>
                <Card className="hover:scale-105 transition-transform cursor-pointer group border-l-4 border-l-emerald-500">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl mb-4 group-hover:bg-emerald-500/30 transition-colors shadow-lg shadow-emerald-500/10">
                        📋
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Pedidos</h3>
                    <p className="text-slate-400 text-sm">Revisa todos los pedidos</p>
                </Card>
            </div>
        </div>
    )
}
