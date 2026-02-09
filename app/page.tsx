import { getWishlistItems, getCategories } from './actions';
import AddItemDialog from '@/components/AddItemDialog';
import WishlistCard from '@/components/WishlistCard';
import { Heart } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import CategoryFilter from '@/components/CategoryFilter';
import NotificationBell from '@/components/NotificationBell';
import BottomNav from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const items = await getWishlistItems();
  const categories = await getCategories();
  const params = await searchParams;

  // Simple filtering (client-side or server-side, here we do simple array filter for now as getWishlistItems fetches all)
  const filteredItems = items.filter(item => {
      if (!params?.category || params.category === 'all') return true;
      return item.categoryId === params.category;
  });

  return (
    <main className="min-h-screen pb-24 bg-background font-sans">
      <SplashScreen />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-pink-200">
              <Heart className="fill-current animate-pulse" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight font-heading">
                Mez<span className="text-primary">list</span>
                </h1>
                <p className="text-xs text-text-light font-medium hidden sm:block font-romantic text-lg leading-3 mt-1">
                    Because your wishes matter to me
                </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm font-medium text-primary bg-pink-50 px-4 py-2 rounded-full border border-pink-100">
              {filteredItems.length} {filteredItems.length === 1 ? 'Wish' : 'Wishes'} ✨
            </div>
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-300 to-purple-300 border-2 border-white shadow-md ring-2 ring-pink-100"></div>
          </div>
        </div>
        
        {/* Categories Bar */}
        <CategoryFilter categories={categories} activeCategory={params?.category || 'all'} />
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
            <div className="bg-white p-6 rounded-full shadow-lg mb-4 animate-bounce">
              <Heart size={48} className="text-pink-300 fill-pink-100" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 font-heading">
                {params?.category ? 'No wishes in this category yet!' : 'Your wishlist is empty!'}
            </h2>
            <p className="text-gray-500 max-w-md">
              Start adding your favorite items from Amazon, Flipkart, Nykaa, or anywhere else. We'll keep them safe here! 🎀
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <WishlistCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <AddItemDialog />
      <BottomNav />
    </main>
  );
}
