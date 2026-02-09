'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
}

export default function CategoryFilter({ categories, activeCategory }: { categories: Category[], activeCategory: string }) {
    const router = useRouter();

    const handleSelect = (id: string) => {
        const query = id === 'all' ? '' : `?category=${id}`;
        router.push(`/${query}`);
    };

    return (
        <div className="border-t border-pink-50 py-2 overflow-x-auto no-scrollbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-3 min-w-max">
                <button
                    onClick={() => handleSelect('all')}
                    className={clsx(
                        "px-4 py-1.5 rounded-full text-sm font-bold transition-all border",
                        activeCategory === 'all'
                            ? "bg-primary text-white border-primary shadow-md shadow-pink-200"
                            : "bg-white text-gray-500 border-gray-100 hover:border-pink-200 hover:text-pink-500"
                    )}
                >
                    🌸 Everything
                </button>
                {categories.filter(c => c.name !== 'Everything').map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleSelect(cat.id)}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-sm font-bold transition-all border flex items-center gap-1.5",
                            activeCategory === cat.id
                                ? "text-white shadow-md"
                                : "bg-white text-gray-500 border-gray-100 hover:border-pink-200 hover:text-gray-700"
                        )}
                        style={activeCategory === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                    >
                        <span>{cat.icon}</span> {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}