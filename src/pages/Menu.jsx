import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'

export default function Menu() {
    const [categories, setCategories] = useState([])
    const [dishes, setDishes] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [cart, setCart] = useState([])
    const [showCart, setShowCart] = useState(false)
    const [orderType, setOrderType] = useState('para_llevar')
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        loadCategories()
        loadDishes()
    }, [])

    const loadCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*')
        if (!error) setCategories(data || [])
    }

    const loadDishes = async () => {
        const { data, error } = await supabase
            .from('dishes')
            .select('*, categories(name)')
            .eq('available', true)
        if (!error) setDishes(data || [])
    }

    const filteredDishes =
        selectedCategory === 'all'
            ? dishes
            : dishes.filter((d) => d.category_id === selectedCategory)

    const addToCart = (dish) => {
        const existing = cart.find((item) => item.id === dish.id)
        if (existing) {
            setCart(cart.map((item) =>
                item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
            ))
        } else {
            setCart([...cart, { ...dish, quantity: 1 }])
        }
    }

    const removeFromCart = (dishId) => {
        setCart(cart.filter((item) => item.id !== dishId))
    }

    const updateQuantity = (dishId, delta) => {
        setCart(cart.map((item) => {
            if (item.id === dishId) {
                const newQuantity = item.quantity + delta
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const placeOrder = async () => {
        if (!user) {
            navigate('/login')
            return
        }

        if (cart.length === 0) return

        try {
            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        user_id: user.id,
                        type: orderType,
                        status: 'pendiente',
                        total_price: totalPrice,
                    },
                ])
                .select()
                .single()

            if (orderError) throw orderError

            // Create order items
            const orderItems = cart.map((item) => ({
                order_id: order.id,
                dish_id: item.id,
                quantity: item.quantity,
                price: item.price,
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError

            setCart([])
            setShowCart(false)
            navigate('/orders')
        } catch (error) {
            console.error('Error placing order:', error)
            alert('Error al realizar el pedido')
        }
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="glass-strong sticky top-0 z-40 border-b border-primary-500/10">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                                Ejuem
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    <Button variant="ghost" onClick={() => navigate('/orders')} className="hidden md:flex text-sm">
                                        Mis Pedidos
                                    </Button>
                                    {user?.user_metadata?.role === 'admin' && (
                                        <Button variant="ghost" onClick={() => navigate('/admin')} className="text-sm">
                                            AdminPanel
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm">
                                    Entrar
                                </Button>
                            )}

                            <Button
                                onClick={() => setShowCart(!showCart)}
                                variant="primary"
                                className="relative !px-4"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                {cart.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-accent-500 border-2 border-slate-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                        {cart.length}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Categories */}
                <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === 'all'
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25 ring-1 ring-primary-400'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/10'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === cat.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25 ring-1 ring-primary-400'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/10'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dishes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDishes.map((dish, index) => (
                        <Card
                            key={dish.id}
                            className={`group flex flex-col justify-between h-full animate-enter`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-2xl border border-white/5 group-hover:bg-slate-700/50 transition-colors">
                                        🍽️
                                    </div>
                                    {dish.is_offer && (
                                        <Badge variant="warning" className="animate-pulse shadow-glow-amber">
                                            ¡Oferta!
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-primary-400 transition-colors">
                                    {dish.name}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                    {dish.description || 'Delicioso plato preparado al momento con los mejores ingredientes.'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                                <span className="text-2xl font-bold text-primary-400">
                                    ${dish.price.toFixed(2)}
                                </span>
                                <Button
                                    onClick={() => addToCart(dish)}
                                    variant="secondary"
                                    className="!py-2 !px-4 hover:!bg-primary-600 hover:!text-white hover:!border-primary-500 transition-all duration-300 shadow-none hover:shadow-lg hover:shadow-primary-500/20"
                                >
                                    Agregar +
                                </Button>
                            </div>

                            {/* Decorative background glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        </Card>
                    ))}
                </div>

                {filteredDishes.length === 0 && (
                    <div className="text-center py-20 min-h-[400px] flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl border border-white/5">
                            🍳
                        </div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2">No hay platos disponibles</h3>
                        <p className="text-slate-500">Intenta seleccionar otra categoría del menú</p>
                    </div>
                )}
            </div>

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowCart(false)}></div>
                    <div className="relative w-full max-w-lg glass-strong sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-enter border border-white/10">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/30">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <span className="text-2xl">🛒</span> Tu Pedido
                            </h2>
                            <button
                                onClick={() => setShowCart(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                            {cart.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                        🛒
                                    </div>
                                    <p className="text-slate-400 mb-6">El carrito está vacío</p>
                                    <Button variant="ghost" onClick={() => setShowCart(false)}>
                                        Seguir explorando
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                                                🍽️
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-200">{item.name}</h4>
                                                <p className="text-primary-400 text-sm font-bold">${item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl p-1.5 border border-white/5">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-white/5 bg-slate-900/30 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">
                                        Método de Entrega
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={orderType}
                                            onChange={(e) => setOrderType(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
                                        >
                                            <option value="para_llevar">🛍️ Para Llevar</option>
                                            <option value="recojer">🏃 Recoger</option>
                                            <option value="transporte">🛵 Transporte</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2 border-t border-dashed border-white/10">
                                    <span className="text-slate-400">Total a Pagar</span>
                                    <span className="text-3xl font-bold text-primary-400">${totalPrice.toFixed(2)}</span>
                                </div>

                                <Button
                                    onClick={placeOrder}
                                    className="w-full py-4 text-lg shadow-xl shadow-primary-500/20"
                                >
                                    Confirmar Pedido
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
