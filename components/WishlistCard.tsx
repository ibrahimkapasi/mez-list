'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Trash2, ShoppingBag, Heart, Star, Info, Tag } from 'lucide-react';
import { deleteWishlistItem, toggleReaction, checkItemPrice } from '@/app/actions';
import { useState } from 'react';
import clsx from 'clsx';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Loader2 } from 'lucide-react';

interface WishlistItemProps {
  id: string;
  title: string | null;
  image: string | null;
  price: string | null;
  url: string;
  notes?: string | null;
  priority?: string | null;
  reactions?: string | null;
  originalPrice?: string | null;
  currentPrice?: string | null;
  category?: {
      name: string;
      color: string;
      icon: string;
  } | null;
}

const REACTIONS = ['❤️', '😍', '🤔', '👀', '🎯', '🌸'];

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-success/20 text-success-700',
    medium: 'bg-warning/20 text-warning-700',
    high: 'bg-error/20 text-error-700',
    dream: 'bg-accent/20 text-accent-700',
};

const PRIORITY_LABELS: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    dream: 'Dream',
};

export default function WishlistCard({ item }: { item: WishlistItemProps }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isCheckingPrice, setIsCheckingPrice] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to remove this wish? 🥺')) {
      setIsDeleting(true);
      await deleteWishlistItem(item.id);
      setIsDeleting(false);
    }
  };

  const handleCheckPrice = async () => {
    setIsCheckingPrice(true);
    await checkItemPrice(item.id, item.url);
    setIsCheckingPrice(false);
  };

  const handleReaction = async (emoji: string) => {
      // Optimistic update could go here, but for now we wait for server
      await toggleReaction(item.id, emoji);
      setShowReactions(false);
  };

  const parsedReactions = item.reactions ? JSON.parse(item.reactions) : {};
  const hasPriceDrop = item.originalPrice && item.currentPrice && item.currentPrice !== item.originalPrice; // Simplified logic

  const formatPrice = (price: string | null) => {
    if (!price) return 'Priceless';
    // If it already has a currency symbol (non-digit/dot at start), return as is
    if (/^[^\d.]/.test(price)) return price;
    // Otherwise assume INR and add symbol
    return `₹${price}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="bg-card-bg rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-pink-50 group flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title || 'Product Image'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-pink-200">
            <ShoppingBag size={48} />
          </div>
        )}
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
           <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-red-400 hover:text-red-500 hover:bg-white shadow-sm transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {item.category && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1" style={{ color: item.category.color }}>
                <span>{item.category.icon}</span> {item.category.name}
            </div>
        )}

        {hasPriceDrop && (
            <div className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg animate-bounce">
                💰 Price Drop!
            </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
             <span className={clsx("text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide", PRIORITY_COLORS[item.priority || 'medium'])}>
                {PRIORITY_LABELS[item.priority || 'medium']} Priority
            </span>
            {item.notes && (
                <Tooltip.Provider>
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <Info size={16} className="text-text-light cursor-help" />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content className="bg-text text-white text-xs p-2 rounded-lg max-w-[200px] shadow-lg z-50 animate-in fade-in zoom-in-95">
                                {item.notes}
                                <Tooltip.Arrow className="fill-text" />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </Tooltip.Provider>
            )}
        </div>

        <h3 className="font-bold text-text line-clamp-2 text-lg leading-snug mb-2 font-heading">
          {item.title || 'Untitled Wish'}
        </h3>
        
        {/* Reactions Display */}
        <div className="flex gap-1 mb-4 flex-wrap">
            {Object.entries(parsedReactions).map(([emoji, count]) => (
                <span key={emoji} className="bg-pink-50 px-2 py-1 rounded-full text-xs border border-pink-100 flex items-center gap-1">
                    {emoji} <span className="font-bold text-pink-400">{String(count)}</span>
                </span>
            ))}
            <div className="relative">
                <button 
                    onClick={() => setShowReactions(!showReactions)}
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-pink-100 hover:text-pink-500 transition-colors text-xs"
                >
                    +
                </button>
                {showReactions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white shadow-xl rounded-2xl p-2 flex gap-1 border border-pink-100 z-10 animate-in zoom-in-95">
                        {REACTIONS.map(emoji => (
                            <button 
                                key={emoji} 
                                onClick={() => handleReaction(emoji)}
                                className="hover:scale-125 transition-transform text-lg p-1"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col items-start">
            <div className="text-primary font-extrabold text-xl font-heading">
              {formatPrice(item.currentPrice || item.price)}
            </div>
            {item.originalPrice && item.currentPrice && item.currentPrice !== item.originalPrice && (
              <div className="text-xs text-gray-400 line-through">
                {formatPrice(item.originalPrice)}
              </div>
            )}
          </div>
          
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary/10 text-primary p-2.5 rounded-xl hover:bg-primary hover:text-white transition-colors flex items-center gap-2 text-sm font-bold"
          >
            Buy <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
