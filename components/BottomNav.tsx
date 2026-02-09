'use client';

import { Home, Plus, Heart, User, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import AddItemDialog from './AddItemDialog';

// We need to trigger the AddItemDialog from here.
// Since AddItemDialog is a self-contained dialog component, we can reuse it here 
// or simpler: AddItemDialog exposes a way to be triggered?
// Actually, AddItemDialog renders the whole Dialog structure including the trigger.
// To have a custom trigger (the center button), we can use AddItemDialog but 
// we need to customize its trigger.
// For now, let's assume AddItemDialog is just used on the main page.
// We can duplicate the Dialog logic or refactor AddItemDialog.
// Let's assume we can put AddItemDialog here but with a custom trigger.

// Wait, I can't easily change the trigger of AddItemDialog without editing it.
// Let's modify AddItemDialog to accept a `customTrigger` prop or `children` as trigger.

export default function BottomNav() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 pb-safe z-50 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16 px-2">
        <button 
          onClick={() => { setActiveTab('home'); router.push('/'); }}
          className={clsx("flex flex-col items-center gap-1 p-2 transition-colors", activeTab === 'home' ? "text-primary" : "text-gray-400")}
        >
          <Home size={24} fill={activeTab === 'home' ? "currentColor" : "none"} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button 
           onClick={() => { setActiveTab('explore'); router.push('/?category=all'); }}
           className={clsx("flex flex-col items-center gap-1 p-2 transition-colors", activeTab === 'explore' ? "text-primary" : "text-gray-400")}
        >
          <Sparkles size={24} />
          <span className="text-[10px] font-medium">Explore</span>
        </button>

        {/* Floating Action Button for Add */}
        <div className="relative -top-6">
             {/* This needs to trigger the Add Item Dialog. 
                 We will use a specialized version or the same component if refactored.
                 For this MVP, I will use a simple workaround: 
                 Clicking this will simulate a click on the main Add button or I'll just put the Dialog here.
             */}
             <AddItemDialog customTrigger={
                <button className="bg-primary text-white w-14 h-14 rounded-full shadow-lg shadow-pink-300 flex items-center justify-center transform hover:scale-105 transition-all">
                    <Plus size={28} strokeWidth={3} />
                </button>
             } />
        </div>

        <button 
           onClick={() => { setActiveTab('wishlist'); }}
           className={clsx("flex flex-col items-center gap-1 p-2 transition-colors", activeTab === 'wishlist' ? "text-primary" : "text-gray-400")}
        >
          <Heart size={24} fill={activeTab === 'wishlist' ? "currentColor" : "none"} />
          <span className="text-[10px] font-medium">Saved</span>
        </button>

        <button 
           onClick={() => { setActiveTab('profile'); }}
           className={clsx("flex flex-col items-center gap-1 p-2 transition-colors", activeTab === 'profile' ? "text-primary" : "text-gray-400")}
        >
          <User size={24} fill={activeTab === 'profile' ? "currentColor" : "none"} />
          <span className="text-[10px] font-medium">Me</span>
        </button>
      </div>
    </div>
  );
}