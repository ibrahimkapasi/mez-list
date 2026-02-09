'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// --- Identity ---

export async function setUserIdentity(name: string) {
  const cookieStore = await cookies();
  cookieStore.set('mezlist_user', name, { secure: true, httpOnly: true, maxAge: 60 * 60 * 24 * 365 }); // 1 year
  return { success: true };
}

export async function getUserIdentity() {
    const cookieStore = await cookies();
    return cookieStore.get('mezlist_user')?.value;
}

// --- Wishlist Items ---

export async function getWishlistItems() {
  return await prisma.wishlistItem.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function addWishlistItem(data: {
  url: string;
  title?: string;
  image?: string;
  price?: string;
  notes?: string;
  priority?: string;
  categoryId?: string;
}) {
  try {
    const cookieStore = await cookies();
    const addedBy = cookieStore.get('mezlist_user')?.value || 'Anonymous';

    const item = await prisma.wishlistItem.create({
      data: {
        ...data,
        originalPrice: data.price,
        currentPrice: data.price,
        addedBy,
      },
    });
    
    // Create notification
    await prisma.notification.create({
      data: {
        type: 'new_item',
        message: `✨ ${addedBy} added a new wish: "${data.title || 'Something new'}"`,
      }
    });

    revalidatePath('/');
    return { success: true, item };
  } catch (error) {
    console.error('Failed to add item:', error);
    return { success: false, error: 'Failed to add item' };
  }
}

export async function deleteWishlistItem(id: string) {
    try {
        await prisma.wishlistItem.delete({
            where: { id }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete item:', error);
        return { success: false, error: 'Failed to delete item' };
    }
}

export async function toggleReaction(itemId: string, emoji: string) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('mezlist_user')?.value || 'Anonymous';

        const item = await prisma.wishlistItem.findUnique({ where: { id: itemId } });
        if (!item) return { success: false, error: 'Item not found' };

        const currentReactions = item.reactions ? JSON.parse(item.reactions) : {};
        
        // Update user's reaction
        // If clicking same emoji, maybe remove it? For now, just set it.
        if (currentReactions[userId] === emoji) {
            delete currentReactions[userId]; // Toggle off
        } else {
            currentReactions[userId] = emoji;
        }

        await prisma.wishlistItem.update({
            where: { id: itemId },
            data: { reactions: JSON.stringify(currentReactions) }
        });
        
        // Notify about reaction
        if (currentReactions[userId]) {
            await prisma.notification.create({
                data: {
                    type: 'reaction',
                    message: `❤️ ${userId} reacted ${emoji} to an item!`,
                }
            });
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update reaction' };
    }
}

export async function updateReaction(itemId: string, reactions: string) {
    // Deprecated but kept for backward compatibility if needed temporarily
    return toggleReaction(itemId, '❤️'); 
}

export async function checkItemPrice(itemId: string, url: string) {
  try {
    // In a real app, you would use Puppeteer/Cheerio here again to scrape the current price.
    // For this demo, we'll simulate a random price drop or change.
    
    const randomDrop = Math.random() > 0.5;
    if (!randomDrop) {
      return { success: true, message: 'Price is stable' };
    }

    // Simulate price drop
    const item = await prisma.wishlistItem.findUnique({ where: { id: itemId } });
    if (!item || !item.currentPrice) return { success: false, error: 'Item not found' };

    // Parse price (remove currency symbols for math - simplified)
    const currentVal = parseFloat(item.currentPrice.replace(/[^0-9.]/g, ''));
    const newVal = (currentVal * 0.9).toFixed(2); // 10% drop simulation
    const newPriceStr = item.currentPrice.replace(/[0-9.]+/, newVal);

    await prisma.wishlistItem.update({
      where: { id: itemId },
      data: { 
        currentPrice: newPriceStr,
        lastChecked: new Date()
      }
    });

    await prisma.notification.create({
      data: {
        type: 'price_drop',
        message: `💰 Price dropped on "${item.title}"! Now ${newPriceStr}`,
      }
    });

    revalidatePath('/');
    return { success: true, dropped: true, newPrice: newPriceStr };

  } catch (error) {
    console.error('Failed to check price:', error);
    return { success: false, error: 'Failed to check price' };
  }
}

export async function getNotifications() {
  return await prisma.notification.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });
}

export async function markNotificationRead(id: string) {
    await prisma.notification.update({
        where: { id },
        data: { read: true }
    });
    revalidatePath('/');
}

export async function markAllNotificationsRead() {
    await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true }
    });
    revalidatePath('/');
}


// --- Categories ---

export async function getCategories() {
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
      // Seed default categories if empty
      const defaults = [
          { name: "Everything", color: "#FF6B9D", icon: "🌸" },
          { name: "Fashion", color: "#FF9E6D", icon: "👗" },
          { name: "Beauty", color: "#FF6B6B", icon: "💄" },
          { name: "Everyday", color: "#A88BFF", icon: "☕" },
          { name: "Home", color: "#6BFFB8", icon: "🏠" },
          { name: "Special", color: "#FFD166", icon: "🎁" },
          { name: "Dreams", color: "#A88BFF", icon: "✨" },
      ];
      
      for (const cat of defaults) {
          await prisma.category.create({ data: cat });
      }
      return await prisma.category.findMany();
  }
  return categories;
}

export async function createCategory(data: { name: string; color: string; icon: string }) {
    try {
        const category = await prisma.category.create({ data });
        revalidatePath('/');
        return { success: true, category };
    } catch (error) {
        return { success: false, error: 'Failed to create category' };
    }
}


