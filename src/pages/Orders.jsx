import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export default function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        loadOrders()
        const interval = setInterval(loadOrders, 5000)
        return () => clearInterval(interval)
    }, [user])

    const loadOrders = async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        order_items(
          *,
          dishes(name, price)
        )
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (!error) {
            setOrders(data || [])
        }
        setLoading(false)
    }

    const updateOrderStatus = async (orderId, newStatus) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        if (!error) {
            loadOrders()
        }
    }

    const getStatusVariant = (status) => {
        const variants = {
            pendiente: 'warning',
            en_preparacion: 'info',
            listo: 'success',
            entregado: 'success',
            cancelado: 'danger',
        }
        return variants[status] || 'default'
    }

    const getStatusText = (status) => {
        const texts = {
            pendiente: 'Pendiente',
            en_preparacion: 'En Preparación',
            listo: 'Listo',
            entregado: 'Entregado',
            cancelado: 'Cancelado',
        }
        return texts[status] || status
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20">
            <header className="glass-strong sticky top-0 z-40 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📦</span>
                            <h1 className="text-xl font-bold text-slate-100">Mis Pedidos</h1>
                        </div>
                        <Button
                            onClick={() => navigate('/menu')}
                            variant="secondary"
                            className="text-sm"
                        >
                            ← Volver al Menú
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8 animate-enter">
                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-white/5">
                            📝
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No tienes pedidos aún</h3>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                            Explora nuestro menú y disfruta de los mejores platillos preparados para ti.
                        </p>
                        <Button onClick={() => navigate('/menu')} variant="primary" className="px-8 shadow-xl shadow-primary-500/20">
                            Hacer un Pedido
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <Card
                                key={order.id}
                                className="animate-enter glass-card border border-white/5"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-2xl shrink-0 border border-white/5">
                                            {order.type === 'transporte' ? '🛵' : order.type === 'recojer' ? '🏃' : '🛍️'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                                Pedido #{order.id.slice(0, 8)}
                                            </h3>
                                            <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                                                <span>📅 {new Date(order.created_at).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>⏰ {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={getStatusVariant(order.status)} className="self-start md:self-center px-3 py-1 text-sm">
                                        {getStatusText(order.status)}
                                    </Badge>
                                </div>

                                <div className="bg-slate-900/40 rounded-xl p-4 space-y-3 mb-6 border border-white/5">
                                    {order.order_items?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded text-xs font-bold text-slate-400">
                                                    {item.quantity}x
                                                </span>
                                                <span className="text-slate-300 font-medium">
                                                    {item.dishes?.name}
                                                </span>
                                            </div>
                                            <span className="text-slate-400 font-medium font-mono">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/30 px-3 py-1 rounded-lg border border-white/5">
                                        <span>Tipo:</span>
                                        <span className="text-slate-200 font-medium capitalize">{order.type.replace('_', ' ')}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500 mb-0.5">Total a Pagar</div>
                                        <div className="text-2xl font-bold text-primary-400 font-mono">
                                            ${order.total_price.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                {/* Status update buttons for admin/mesero */}
                                {user?.user_metadata?.role !== 'cliente' && order.status !== 'entregado' && order.status !== 'cancelado' && (
                                    <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                        {order.status === 'pendiente' && (
                                            <Button
                                                onClick={() => updateOrderStatus(order.id, 'en_preparacion')}
                                                variant="primary"
                                                className="flex-1 text-sm"
                                            >
                                                👨‍🍳 Iniciar Preparación
                                            </Button>
                                        )}
                                        {order.status === 'en_preparacion' && (
                                            <Button
                                                onClick={() => updateOrderStatus(order.id, 'listo')}
                                                variant="primary"
                                                className="flex-1 text-sm"
                                            >
                                                ✅ Marcar Listo
                                            </Button>
                                        )}
                                        {order.status === 'listo' && (
                                            <Button
                                                onClick={() => updateOrderStatus(order.id, 'entregado')}
                                                variant="primary"
                                                className="flex-1 text-sm"
                                            >
                                                🎉 Entregar
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => updateOrderStatus(order.id, 'cancelado')}
                                            variant="danger"
                                            className="text-sm"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
