import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../store/slices/vendorSlice'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function AdminCategoriesPage() {
  const dispatch = useDispatch()
  const { categories } = useSelector(s => s.vendor)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '', description: '', order: 0 })

  useEffect(() => { dispatch(fetchCategories()) }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/categories/${editing}`, form)
        toast.success('Category updated!')
      } else {
        await api.post('/categories', form)
        toast.success('Category created!')
      }
      setModal(false); setEditing(null); setForm({ name: '', icon: '', description: '', order: 0 })
      dispatch(fetchCategories())
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try { await api.delete(`/categories/${id}`); toast.success('Deleted!'); dispatch(fetchCategories()) } catch { toast.error('Failed') }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-black text-gray-900 tracking-tight">Marketplace Categories</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Manage service categories and their display order.</p>
          </div>
          <button onClick={() => { setModal(true); setEditing(null); setForm({ name: '', icon: '', description: '', order: 0 }) }} className="btn-primary flex items-center justify-center gap-2 px-6 shadow-lg shadow-primary-100">
            <FiPlus size={20} /> Add New Category
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.isArray(categories) && categories.map(cat => (
            <div key={cat._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center group hover:shadow-xl hover:border-primary-100 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                {cat.icon || '🎊'}
              </div>
              <p className="font-black text-gray-900 text-base mb-1 tracking-tight">{cat.name}</p>
              <p className="text-xs font-medium text-gray-400 mb-6 line-clamp-2 leading-relaxed px-2">{cat.description || 'No description provided.'}</p>
              <div className="flex gap-2 items-center justify-center">
                <button
                  onClick={() => { setEditing(cat._id); setForm({ name: cat.name, icon: cat.icon, description: cat.description || '', order: cat.order || 0 }); setModal(true) }}
                  className="flex-1 bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-600 font-bold text-[10px] uppercase tracking-widest py-2 rounded-xl transition-all border border-transparent hover:border-primary-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-transparent hover:border-red-200"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="label">Name *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="input-field" /></div>
          <div><label className="label">Icon (emoji)</label><input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="e.g. 📷" className="input-field" /></div>
          <div><label className="label">Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input-field resize-none" /></div>
          <div><label className="label">Display Order</label><input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} className="input-field" /></div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
