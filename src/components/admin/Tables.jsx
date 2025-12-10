import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'

export default function Tables() {
    const [tables, setTables] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        number: '',
        seats: '4',
        status: 'libre',
    })

    useEffect(() => {
        loadTables()
    }, [])

    const loadTables = async () => {
        const { data } = await supabase.from('tables').select('*').order('number')
        setTables(data || [])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const submitData = {
            ...formData,
            number: parseInt(formData.number),
            seats: parseInt(formData.seats),
        }
        if (editingId) {
            await supabase.from('tables').update(submitData).eq('id', editingId)
        } else {
            await supabase.from('tables').insert([submitData])
        }
        resetForm()
        loadTables()
    }

    const resetForm = () => {
        setFormData({ number: '', seats: '4', status: 'libre' })
        setShowForm(false)
        setEditingId(null)
    }

    const handleEdit = (table) => {
        setFormData({
            number: table.number.toString(),
            seats: table.seats.toString(),
            status: table.status,
        })
        setEditingId(table.id)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (confirm('¿Eliminar esta mesa?')) {
            await supabase.from('tables').delete().eq('id', id)
            loadTables()
        }
    }

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'libre' ? 'ocupada' : 'libre'
        await supabase.from('tables').update({ status: newStatus }).eq('id', id)
        loadTables()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Mesas del Restaurante</h2>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    + Nueva Mesa
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.map((table) => (
                    <div key={table.id} className="card">
                        <div className="text-center mb-3">
                            <div className="text-4xl mb-2">🪑</div>
                            <h3 className="text-2xl font-bold mb-1">Mesa {table.number}</h3>
                            <p className="text-slate-400 text-sm">{table.seats} asientos</p>
                        </div>
                        <div className="mb-3">
                            <span
                                className={`badge w-full justify-center ${table.status === 'libre' ? 'badge-success' : 'badge-danger'
                                    }`}
                            >
                                {table.status === 'libre' ? 'Libre' : 'Ocupada'}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => toggleStatus(table.id, table.status)}
                                className="btn btn-secondary w-full text-sm"
                            >
                                {table.status === 'libre' ? 'Marcar Ocupada' : 'Marcar Libre'}
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(table)} className="btn btn-secondary text-sm flex-1">
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(table.id)}
                                    className="btn bg-red-700 hover:bg-red-800 text-white text-sm flex-1"
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
                    <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold mb-4">{editingId ? 'Editar' : 'Nueva'} Mesa</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Número de Mesa
                                </label>
                                <input
                                    type="number"
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Asientos</label>
                                <input
                                    type="number"
                                    value={formData.seats}
                                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="input"
                                >
                                    <option value="libre">Libre</option>
                                    <option value="ocupada">Ocupada</option>
                                </select>
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
