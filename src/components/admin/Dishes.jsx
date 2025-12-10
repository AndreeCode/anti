import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'

export default function Dishes() {
    const [dishes, setDishes] = useState([])
    const [categories, setCategories] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        available: true,
        is_offer: false,
    })

    useEffect(() => {
        loadDishes()
        loadCategories()
    }, [])

    const loadDishes = async () => {
        const { data } = await supabase
            .from('dishes')
            .select('*, categories(name)')
            .order('created_at', { ascending: false })
        setDishes(data || [])
    }

    const loadCategories = async () => {
        const { data } = await supabase.from('categories').select('*')
        setCategories(data || [])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const submitData = {
            ...formData,
            price: parseFloat(formData.price),
        }
        if (editingId) {
            await supabase.from('dishes').update(submitData).eq('id', editingId)
        } else {
            await supabase.from('dishes').insert([submitData])
        }
        resetForm()
        loadDishes()
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category_id: '',
            available: true,
            is_offer: false,
        })
        setShowForm(false)
        setEditingId(null)
    }

    const handleEdit = (dish) => {
        setFormData({
            name: dish.name,
            description: dish.description,
            price: dish.price.toString(),
            category_id: dish.category_id,
            available: dish.available,
            is_offer: dish.is_offer,
        })
        setEditingId(dish.id)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (confirm('¿Eliminar este plato?')) {
            await supabase.from('dishes').delete().eq('id', id)
            loadDishes()
        }
    }

    const toggleAvailable = async (id, currentStatus) => {
        await supabase.from('dishes').update({ available: !currentStatus }).eq('id', id)
        loadDishes()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Platos del Menú</h2>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    + Nuevo Plato
                </button>
            </div>

            <div className="space-y-4">
                {dishes.map((dish) => (
                    <div key={dish.id} className="card">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold">{dish.name}</h3>
                                    {dish.is_offer && <span className="badge badge-warning">Oferta</span>}
                                    <span className={`badge ${dish.available ? 'badge-success' : 'badge-danger'}`}>
                                        {dish.available ? 'Disponible' : 'No disponible'}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm mb-2">{dish.description}</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-slate-400">
                                        Categoría: <span className="text-white">{dish.categories?.name}</span>
                                    </span>
                                    <span className="text-2xl font-bold text-red-500">${dish.price.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => handleEdit(dish)} className="btn btn-secondary text-sm">
                                    Editar
                                </button>
                                <button
                                    onClick={() => toggleAvailable(dish.id, dish.available)}
                                    className="btn btn-secondary text-sm"
                                >
                                    {dish.available ? 'Ocultar' : 'Mostrar'}
                                </button>
                                <button
                                    onClick={() => handleDelete(dish.id)}
                                    className="btn bg-red-700 hover:bg-red-800 text-white text-sm"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-4">
                            {editingId ? 'Editar' : 'Nuevo'} Plato
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Precio</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Categoría
                                </label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="input"
                                    required
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.available}
                                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-300">Disponible</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_offer}
                                        onChange={(e) => setFormData({ ...formData, is_offer: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-300">Es oferta</span>
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary flex-1">
                                    Guardar
                                </button>
                                <button type="button" onClick={resetForm} className="btn btn-secondary flex-1">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
