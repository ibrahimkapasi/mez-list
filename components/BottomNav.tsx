'use client';

import { House, Compass, Plus, Gift, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useState } from 'react';
import AddItemDialog from './AddItemDialog';

export default function BottomNav() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-100 pb-safe z-50 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] rounded-t-3xl">
      <div className="flex justify-around items-center h-20 px-2 pb-2">
        <button 
          onClick={() => { setActiveTab('home'); router.push('/'); }}
          className={clsx("flex flex-col items-center gap-1 p-2 transition-all duration-300", activeTab === 'home' ? "text-primary -translate-y-1" : "text-gray-400 hover:text-pink-300")}
        >
          <House size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className={clsx("text-[10px] font-bold", activeTab === 'home' ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>Home</span>
        </button>

        <button 
           onClick={() => { setActiveTab('explore'); router.push('/?category=all'); }}
           className={clsx("flex flex-col items-center gap-1 p-2 transition-all duration-300", activeTab === 'explore' ? "text-primary -translate-y-1" : "text-gray-400 hover:text-pink-300")}
        >
          <Compass size={24} strokeWidth={activeTab === 'explore' ? 2.5 : 2} />
          <span className={clsx("text-[10px] font-bold", activeTab === 'explore' ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>Explore</span>
        </button>

        {/* Floating Action Button for Add */}
        <div className="relative -top-6">
             <AddItemDialog customTrigger={
                <button className="bg-gradient-to-tr from-primary to-pink-400 text-white w-14 h-14 rounded-full shadow-lg shadow-pink-200 flex items-center justify-center transform hover:scale-110 hover:rotate-90 transition-all duration-300 active:scale-95">
                    <Plus size={28} strokeWidth={3} />
                </button>
             } />
        </div>

        <button 
           onClick={() => { setActiveTab('wishlist'); }}
           className={clsx("flex flex-col items-center gap-1 p-2 transition-all duration-300", activeTab === 'wishlist' ? "text-primary -translate-y-1" : "text-gray-400 hover:text-pink-300")}
        >
          <Gift size={24} strokeWidth={activeTab === 'wishlist' ? 2.5 : 2} />
          <span className={clsx("text-[10px] font-bold", activeTab === 'wishlist' ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>Saved</span>
        </button>

        <button 
           onClick={() => { setActiveTab('profile'); }}
           className={clsx("flex flex-col items-center gap-1 p-2 transition-all duration-300", activeTab === 'profile' ? "text-primary -translate-y-1" : "text-gray-400 hover:text-pink-300")}
        >
          <UserRound size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span className={clsx("text-[10px] font-bold", activeTab === 'profile' ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>Me</span>
        </button>
      </div>
    </div>
  );
}