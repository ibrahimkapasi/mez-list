'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Link as LinkIcon, Loader2, Sparkles, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addWishlistItem, getCategories, createCategory } from '@/app/actions';
import clsx from 'clsx';

const PRIORITIES = [
  { id: 'low', label: 'Low', emoji: '🟢', color: 'bg-success/20 text-success-700' },
  { id: 'medium', label: 'Medium', emoji: '🟡', color: 'bg-warning/20 text-warning-700' },
  { id: 'high', label: 'High', emoji: '🔴', color: 'bg-error/20 text-error-700' },
  { id: 'dream', label: 'Dream', emoji: '✨', color: 'bg-accent/20 text-accent-700' },
];

export default function AddItemDialog({ customTrigger }: { customTrigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchedData, setFetchedData] = useState<{ title: string; image: string; price: string } | null>(null);
  
  // New fields
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
      if (open) {
          getCategories().then(setCategories);
      }
  }, [open]);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setFetchedData(null);

    try {
      const response = await fetch('/api/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch');
      
      setFetchedData(data);
    } catch (err) {
      setError('Oopsie! Couldn\'t fetch that link. Maybe try another?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fetchedData) return;
    setLoading(true);
    
    let finalCategoryId = categoryId;
    if (isNewCategory && newCategoryName) {
        const newCat = await createCategory({ 
            name: newCategoryName, 
            color: '#FF6B9D', // Default pink
            icon: '🌸' 
        });
        if (newCat.success && newCat.category) {
            finalCategoryId = newCat.category.id;
        }
    }
    
    const result = await addWishlistItem({
      url,
      title: fetchedData.title,
      image: fetchedData.image,
      price: fetchedData.price,
      notes,
      priority,
      categoryId: finalCategoryId || undefined,
    });

    setLoading(false);
    if (result.success) {
      setOpen(false);
      resetForm();
    } else {
      setError('Oh no! Could not save the item.');
    }
  };

  const resetForm = () => {
      setUrl('');
      setFetchedData(null);
      setNotes('');
      setPriority('medium');
      setCategoryId('');
      setIsNewCategory(false);
      setNewCategoryName('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {customTrigger || (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-6 sm:bottom-8 sm:right-8 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-pink-500 transition-colors z-50 flex items-center gap-2 font-bold font-heading md:flex hidden"
          >
            <Plus size={24} />
            <span className="hidden sm:inline">Add Item</span>
          </motion.button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card-bg p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-3xl border-pink-100 max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-2xl font-bold font-heading leading-none tracking-tight text-primary flex items-center gap-2">
              <Sparkles className="text-warning fill-warning" /> Add a New Wish!
            </Dialog.Title>
            <Dialog.Description className="text-sm text-text-light">
              Paste the link to the item you want to add. We'll do the magic! ✨
            </Dialog.Description>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="flex items-center gap-2 border-2 border-pink-100 rounded-2xl px-3 py-2 focus-within:border-primary transition-colors bg-background">
                <LinkIcon className="text-pink-300" size={20} />
                <input
                  placeholder="https://..."
                  className="flex-1 outline-none text-text bg-transparent placeholder:text-text-light/50"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFetch}
              disabled={loading}
              className="bg-primary text-white p-3 rounded-2xl font-bold shadow-sm hover:bg-pink-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-error text-sm font-medium bg-error/10 p-3 rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}

            {fetchedData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex gap-4 p-4 bg-background rounded-2xl border border-pink-100">
                  {fetchedData.image && (
                    <img src={fetchedData.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-pink-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text truncate font-heading">{fetchedData.title}</h3>
                    <p className="text-primary font-bold mt-1">{fetchedData.price || 'Price unknown'}</p>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-light">Why I want this (Notes) 📝</label>
                    <textarea 
                        className="w-full border-2 border-pink-100 rounded-2xl p-3 focus:border-primary outline-none min-h-[80px] text-sm bg-background resize-y"
                        placeholder="e.g. For our anniversary date..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-light">Priority 🎯</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {PRIORITIES.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPriority(p.id)}
                                className={clsx(
                                    "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border-2",
                                    priority === p.id 
                                        ? "border-primary bg-primary/10" 
                                        : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100"
                                )}
                            >
                                <span>{p.emoji}</span> {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-light">Category 📂</label>
                    {!isNewCategory ? (
                        <div className="flex gap-2">
                            <select 
                                className="flex-1 border-2 border-pink-100 rounded-2xl p-3 bg-background outline-none text-sm appearance-none"
                                value={categoryId}
                                onChange={(e) => {
                                    if (e.target.value === 'new') setIsNewCategory(true);
                                    else setCategoryId(e.target.value);
                                }}
                            >
                                <option value="">Select a category...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                ))}
                                <option value="new">➕ Create new category</option>
                            </select>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 border-2 border-pink-100 rounded-2xl p-3 outline-none text-sm bg-background"
                                placeholder="New category name..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                autoFocus
                            />
                            <button 
                                onClick={() => setIsNewCategory(false)}
                                className="p-3 text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full bg-primary text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-pink-500 transition-all flex items-center justify-center gap-2 mt-4 font-heading"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Save Wish ✨'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-full p-2 text-text-light hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
