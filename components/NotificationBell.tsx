'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import clsx from 'clsx';
import * as Popover from '@radix-ui/react-popover';
import { getNotifications, markAllNotificationsRead } from '@/app/actions';

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: Date;
  read: boolean;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const fetchNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data as unknown as Notification[]);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'reaction': return '❤️';
      case 'price_drop': return '💰';
      case 'new_item': return '✨';
      default: return '📢';
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    fetchNotifications();
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="relative p-2 rounded-full hover:bg-pink-50 transition-colors">
          <Bell className={clsx("w-6 h-6", unreadCount > 0 ? "text-primary" : "text-gray-400")} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content 
          className="w-80 bg-white rounded-2xl shadow-xl border border-pink-100 p-4 z-50 mr-4 mt-2"
          sideOffset={5}
          align="end"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:text-pink-600 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No new notifications 🌸
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={clsx(
                    "flex gap-3 p-3 rounded-xl transition-colors",
                    notif.read ? "bg-white" : "bg-pink-50/50"
                  )}
                >
                  <span className="text-xl mt-1">{getIcon(notif.type)}</span>
                  <div>
                    <p className="text-sm text-gray-700 leading-snug">{notif.message}</p>
                    <span className="text-[10px] text-gray-400 block mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}