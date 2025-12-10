import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'

export default function Categories() {
    const [categories, setCategories] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ name: '', description: '' })

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        const { data } = await supabase.from('categories').select('*')
        setCategories(data || [])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (editingId) {
            await supabase.from('categories').update(formData).eq('id', editingId)
        } else {
            await supabase.from('categories').insert([formData])
        }
        setFormData({ name: '', description: '' })
        setShowForm(false)
        setEditingId(null)
        loadCategories()
    }

    const handleEdit = (category) => {
        setFormData({ name: category.name, description: category.description })
        setEditingId(category.id)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (confirm('¿Eliminar esta categoría?')) {
            await supabase.from('categories').delete().eq('id', id)
            loadCategories()
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Categorías</h2>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    + Nueva Categoría
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <div key={cat.id} className="card">
                        <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                        <p className="text-slate-400 text-sm mb-4">{cat.description}</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(cat)} className="btn btn-secondary text-sm">
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="btn bg-red-700 hover:bg-red-800 text-white text-sm"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold mb-4">
                            {editingId ? 'Editar' : 'Nueva'} Categoría
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nombre
                                </label>
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
                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary flex-1">
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingId(null)
                                        setFormData({ name: '', description: '' })
                                    }}
                                    className="btn btn-secondary flex-1"
                                >
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
