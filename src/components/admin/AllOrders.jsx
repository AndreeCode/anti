import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'

export default function AllOrders() {
    const [orders, setOrders] = useState([])
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        loadOrders()
        const interval = setInterval(loadOrders, 5000)
        return () => clearInterval(interval)
    }, [])

    const loadOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select(`
        *,
        order_items(*, dishes(name)),
        users(name, email)
      `)
            .order('created_at', { ascending: false })

        setOrders(data || [])
    }

    const updateStatus = async (orderId, newStatus) => {
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
        loadOrders()
    }

    const filteredOrders =
        filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

    const getStatusColor = (status) => {
        const colors = {
            pendiente: 'badge-warning',
            en_preparacion: 'badge-info',
            listo: 'badge-success',
            entregado: 'badge-success',
            cancelado: 'badge-danger',
        }
        return colors[status] || 'badge-info'
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

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Todos los Pedidos</h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${filterStatus === 'all'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    Todos
                </button>
                {['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${filterStatus === status
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        {getStatusText(status)}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="card">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Pedido #{order.id.slice(0, 8)}</h3>
                                <p className="text-slate-400 text-sm">
                                    Cliente: {order.users?.name || 'Desconocido'}
                                </p>
                                <p className="text-slate-400 text-sm">
                                    {new Date(order.created_at).toLocaleString('es-ES')}
                                </p>
                                <p className="text-slate-300 text-sm mt-1">
                                    Tipo: <span className="capitalize">{order.type.replace('_', ' ')}</span>
                                </p>
                            </div>
                            <span className={`badge ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            {order.order_items?.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between bg-slate-900/30 p-3 rounded-lg"
                                >
                                    <span className="text-slate-300">
                                        {item.dishes?.name} x {item.quantity}
                                    </span>
                                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-700 pt-4 mb-4">
                            <span className="text-slate-400">Total</span>
                            <span className="text-2xl font-bold text-red-500">${order.total_price.toFixed(2)}</span>
                        </div>

                        {order.status !== 'entregado' && order.status !== 'cancelado' && (
                            <div className="flex gap-2">
                                {order.status === 'pendiente' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'en_preparacion')}
                                        className="btn btn-primary text-sm"
                                    >
                                        Iniciar Preparación
                                    </button>
                                )}
                                {order.status === 'en_preparacion' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'listo')}
                                        className="btn btn-primary text-sm"
                                    >
                                        Marcar como Listo
                                    </button>
                                )}
                                {order.status === 'listo' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'entregado')}
                                        className="btn btn-primary text-sm"
                                    >
                                        Marcar como Entregado
                                    </button>
                                )}
                                <button
                                    onClick={() => updateStatus(order.id, 'cancelado')}
                                    className="btn bg-red-700 hover:bg-red-800 text-white text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {filteredOrders.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-slate-400">No hay pedidos con este estado</p>
                    </div>
                )}
            </div>
        </div>
    )
}
