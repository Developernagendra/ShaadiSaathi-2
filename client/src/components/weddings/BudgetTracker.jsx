import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function BudgetTracker({ budget, planId, refreshData }) {
  const { t } = useTranslation();
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValues, setEditValues] = useState({});

  if (!budget || !budget.categories) return <div>No budget data found.</div>;

  const totalEstimated = budget.categories.reduce((acc, cat) => acc + (cat.estimatedCost || 0), 0);
  const totalActual = budget.categories.reduce((acc, cat) => acc + (cat.actualCost || 0), 0);
  const totalPaid = budget.categories.reduce((acc, cat) => acc + (cat.paidAmount || 0), 0);
  const budgetUsed = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

  const handleEditClick = (category) => {
    setEditingCategory(category._id);
    setEditValues({
      estimatedCost: category.estimatedCost,
      actualCost: category.actualCost,
      paidAmount: category.paidAmount
    });
  };

  const handleSave = async (categoryId) => {
    try {
      await api.put(`/weddings/${planId}/budget/${categoryId}`, editValues);
      setEditingCategory(null);
      refreshData();
      toast.success('Budget updated');
    } catch (error) {
      toast.error('Failed to update budget');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-bold text-gray-500 uppercase">{t('wedding_planner.total_budget', 'Total Estimated')}</p>
          <p className="text-2xl font-black text-gray-900 mt-2">₹{totalEstimated.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-bold text-gray-500 uppercase">{t('wedding_planner.actual_cost', 'Total Actual')}</p>
          <p className="text-2xl font-black text-[#C2185B] mt-2">₹{totalActual.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-bold text-gray-500 uppercase">{t('wedding_planner.paid_amount', 'Total Paid')}</p>
          <p className="text-2xl font-black text-green-600 mt-2">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-[#FFF8F0] p-5 rounded-2xl shadow-sm border border-[#D4AF37]/30 text-center">
          <p className="text-sm font-bold text-[#8E244D] uppercase">{t('wedding_planner.budget_used', 'Budget Used')}</p>
          <p className="text-2xl font-black text-[#8E244D] mt-2">{budgetUsed}%</p>
        </div>
      </div>

      {/* Detailed Categories */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold text-gray-700">Category</th>
                <th className="p-4 font-bold text-gray-700">Estimated (₹)</th>
                <th className="p-4 font-bold text-gray-700">Actual (₹)</th>
                <th className="p-4 font-bold text-gray-700">Paid (₹)</th>
                <th className="p-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budget.categories.map((cat) => (
                <tr key={cat._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 font-semibold text-gray-900">{cat.name}</td>
                  
                  {editingCategory === cat._id ? (
                    <>
                      <td className="p-4">
                        <input type="number" value={editValues.estimatedCost} onChange={(e) => setEditValues({...editValues, estimatedCost: Number(e.target.value)})} className="w-24 px-2 py-1 border rounded" />
                      </td>
                      <td className="p-4">
                        <input type="number" value={editValues.actualCost} onChange={(e) => setEditValues({...editValues, actualCost: Number(e.target.value)})} className="w-24 px-2 py-1 border rounded" />
                      </td>
                      <td className="p-4">
                        <input type="number" value={editValues.paidAmount} onChange={(e) => setEditValues({...editValues, paidAmount: Number(e.target.value)})} className="w-24 px-2 py-1 border rounded" />
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => handleSave(cat._id)} className="text-sm bg-green-500 text-white px-3 py-1 rounded font-bold">Save</button>
                        <button onClick={() => setEditingCategory(null)} className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded font-bold">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-gray-600">{cat.estimatedCost.toLocaleString()}</td>
                      <td className="p-4 text-gray-900 font-bold">{cat.actualCost.toLocaleString()}</td>
                      <td className="p-4 text-green-600 font-bold">{cat.paidAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <button onClick={() => handleEditClick(cat)} className="text-sm text-blue-600 hover:underline font-semibold">Edit</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
