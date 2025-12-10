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
            <header className="glass sticky top-0 z-40 border-b border-indigo-500/10">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
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
                                            Admin
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
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 border-2 border-slate-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
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
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === cat.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
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
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl">
                                        🍽️
                                    </div>
                                    {dish.is_offer && (
                                        <Badge variant="warning" className="animate-pulse">
                                            ¡Oferta!
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
                                    {dish.name}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                    {dish.description || 'Delicioso plato preparado al momento con los mejores ingredientes.'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                                <span className="text-xl font-bold text-indigo-400">
                                    ${dish.price.toFixed(2)}
                                </span>
                                <Button
                                    onClick={() => addToCart(dish)}
                                    variant="secondary"
                                    className="!py-2 !px-4 hover:!bg-indigo-600 hover:!text-white hover:!border-indigo-500 transition-all duration-300"
                                >
                                    Agregar +
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {filteredDishes.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            🍳
                        </div>
                        <h3 className="text-lg font-medium text-slate-300">No hay platos disponibles</h3>
                        <p className="text-slate-500">Intenta seleccionar otra categoría</p>
                    </div>
                )}
            </div>

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
                    <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col animate-enter">
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="text-2xl">🛒</span> Tu Pedido
                            </h2>
                            <button
                                onClick={() => setShowCart(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {cart.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-slate-500 mb-4">El carrito está vacío</p>
                                    <Button variant="ghost" onClick={() => setShowCart(false)}>
                                        Seguir explorando
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                                                🍽️
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-200">{item.name}</h4>
                                                <p className="text-indigo-400 text-sm font-medium">${item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-1 border border-slate-800">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                                >
                                                    -
                                                </button>
                                                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
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
                            <div className="p-5 border-t border-slate-800 bg-slate-900/50 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">
                                        Método de Entrega
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={orderType}
                                            onChange={(e) => setOrderType(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                        >
                                            <option value="para_llevar">🛍️ Para Llevar</option>
                                            <option value="recojer">🏃 Recoger</option>
                                            <option value="transporte">🛵 Transporte</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2 border-t border-dashed border-slate-800">
                                    <span className="text-slate-400">Total a Pagar</span>
                                    <span className="text-2xl font-bold text-indigo-400">${totalPrice.toFixed(2)}</span>
                                </div>

                                <Button
                                    onClick={placeOrder}
                                    className="w-full py-4 text-lg shadow-xl shadow-indigo-500/20"
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
