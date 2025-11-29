import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle, MoveUp, MoveDown } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function FAQManager() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    is_active: true,
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      showMessage('error', 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAdd = async () => {
    if (!formData.question || !formData.answer) {
      showMessage('error', 'Please fill in all fields');
      return;
    }

    try {
      const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order)) : 0;

      const { error } = await supabase
        .from('faq_items')
        .insert({
          question: formData.question,
          answer: formData.answer,
          is_active: formData.is_active,
          sort_order: maxOrder + 1,
        });

      if (error) throw error;

      showMessage('success', 'FAQ added successfully!');
      setIsAdding(false);
      setFormData({ question: '', answer: '', is_active: true });
      loadFAQs();
    } catch (error) {
      console.error('Error adding FAQ:', error);
      showMessage('error', 'Failed to add FAQ');
    }
  };

  const handleUpdate = async (id: string) => {
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;

    try {
      const { error } = await supabase
        .from('faq_items')
        .update({
          question: faq.question,
          answer: faq.answer,
          is_active: faq.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      showMessage('success', 'FAQ updated successfully!');
      setEditingId(null);
      loadFAQs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      showMessage('error', 'Failed to update FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showMessage('success', 'FAQ deleted successfully!');
      loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      showMessage('error', 'Failed to delete FAQ');
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = faqs.findIndex(f => f.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const currentFaq = faqs[currentIndex];
    const targetFaq = faqs[targetIndex];

    try {
      await supabase
        .from('faq_items')
        .update({ sort_order: targetFaq.sort_order })
        .eq('id', currentFaq.id);

      await supabase
        .from('faq_items')
        .update({ sort_order: currentFaq.sort_order })
        .eq('id', targetFaq.id);

      loadFAQs();
    } catch (error) {
      console.error('Error moving FAQ:', error);
      showMessage('error', 'Failed to reorder FAQ');
    }
  };

  const updateFAQ = (id: string, field: keyof FAQItem, value: any) => {
    setFaqs(faqs.map(faq =>
      faq.id === id ? { ...faq, [field]: value } : faq
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20'
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-green-400" size={20} />
          ) : (
            <AlertCircle className="text-red-400" size={20} />
          )}
          <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">FAQ Management</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? 'Cancel' : 'Add New FAQ'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-bold text-white">Add New FAQ</h4>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Question
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter FAQ question"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Answer
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter FAQ answer"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600"
            />
            <label htmlFor="is_active" className="text-sm text-slate-300">
              Active (visible on website)
            </label>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
          >
            <Save size={20} />
            Save FAQ
          </button>
        </div>
      )}

      <div className="space-y-4">
        {faqs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No FAQs found. Add your first FAQ to get started.
          </div>
        ) : (
          faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={`bg-slate-800/50 border ${
                faq.is_active ? 'border-slate-700' : 'border-red-500/30'
              } rounded-lg p-6 space-y-4`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-lg flex-shrink-0">
                    <span className="text-xl font-bold text-blue-400">{index + 1}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMove(faq.id, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <MoveUp size={18} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleMove(faq.id, 'down')}
                      disabled={index === faqs.length - 1}
                      className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <MoveDown size={18} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingId === faq.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(faq.id)}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          loadFAQs();
                        }}
                        className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingId(faq.id)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingId === faq.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Question
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Answer
                    </label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`active_${faq.id}`}
                      checked={faq.is_active}
                      onChange={(e) => updateFAQ(faq.id, 'is_active', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                    />
                    <label htmlFor={`active_${faq.id}`} className="text-sm text-slate-300">
                      Active (visible on website)
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-lg font-semibold text-white">{faq.question}</h4>
                    {!faq.is_active && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
