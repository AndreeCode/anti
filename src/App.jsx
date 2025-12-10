import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import Menu from './pages/Menu'
import Orders from './pages/Orders'

function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    return children
}

function App() {
    const { user } = useAuth()


    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/menu" /> : <Login />} />
                <Route path="/menu" element={<Menu />} />
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/menu" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
