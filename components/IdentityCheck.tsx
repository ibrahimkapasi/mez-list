'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Heart, Sparkles, User } from 'lucide-react';
import { setUserIdentity } from '@/app/actions';

export default function IdentityCheck({ existingIdentity }: { existingIdentity?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!existingIdentity) {
      setOpen(true);
    }
  }, [existingIdentity]);

  const handleSave = async (selectedName: string) => {
    await setUserIdentity(selectedName);
    setOpen(false);
    window.location.reload(); // Reload to refresh server components with new identity
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-6 bg-white rounded-3xl shadow-2xl border-2 border-pink-100 outline-none">
          <div className="text-center space-y-4">
            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-primary w-8 h-8" />
            </div>
            
            <Dialog.Title className="text-2xl font-bold font-heading text-text">
              Who is visiting? ✨
            </Dialog.Title>
            
            <Dialog.Description className="text-text-light">
              Let us know so we can personalize your experience!
            </Dialog.Description>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => handleSave('Ibrahim')}
                className="group relative p-4 rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="text-3xl mb-2">🤴🏻</div>
                <div className="font-bold text-gray-700 group-hover:text-blue-600">Ibrahim</div>
              </button>

              <button
                onClick={() => handleSave('My Love')}
                className="group relative p-4 rounded-2xl border-2 border-pink-100 hover:border-pink-300 hover:bg-pink-50 transition-all"
              >
                <div className="text-3xl mb-2">👸🏻</div>
                <div className="font-bold text-gray-700 group-hover:text-pink-600">My Love</div>
              </button>
            </div>

            <div className="relative flex items-center gap-2 mt-4">
              <div className="h-px bg-gray-100 flex-1"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px bg-gray-100 flex-1"></div>
            </div>

            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Enter your name..." 
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button 
                    onClick={() => name && handleSave(name)}
                    disabled={!name}
                    className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                >
                    Go
                </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
