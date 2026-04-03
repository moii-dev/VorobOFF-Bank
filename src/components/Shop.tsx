import React, { useEffect, useState } from 'react';
import { GameState, ShopItem } from '../types';
import { SHOP_ITEMS } from '../constants';
import { Droplet, Pizza, Sandwich, Utensils, UtensilsCrossed, Coffee, Smartphone, Book, Ticket, Ghost, Flame, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import { t } from '../constants';

interface ShopProps {
  state: GameState;
  onBuy: (id: string) => void;
  getCost: (id: string) => number;
}

const iconMap: Record<string, React.ReactNode> = {
  droplet: <Droplet className="w-6 h-6" />,
  fries: <Utensils className="w-6 h-6" />,
  hotdog: <Sandwich className="w-6 h-6" />,
  nuggets: <UtensilsCrossed className="w-6 h-6" />,
  burger: <Sandwich className="w-6 h-6" />,
  pizza: <Pizza className="w-6 h-6" />,
  coffee: <Coffee className="w-6 h-6" />,
  smartphone: <Smartphone className="w-6 h-6" />,
  book: <Book className="w-6 h-6" />,
  ticket: <Ticket className="w-6 h-6" />,
  ghost: <Ghost className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />,
};

export function Shop({ state, onBuy, getCost }: ShopProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!state.partyDemand) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [state.partyDemand]);

  const renderItem = (item: ShopItem) => {
    const cost = getCost(item.id);
    const count = state.inventory[item.id] || 0;
    const canAfford = state.balance >= cost;
    
    const isDemanded = state.partyDemand?.itemId === item.id;
    let timeLeft = '';
    if (isDemanded && state.partyDemand) {
      const secondsLeft = Math.max(0, Math.floor((state.partyDemand.expiresAt - Date.now()) / 1000));
      const m = Math.floor(secondsLeft / 60);
      const s = secondsLeft % 60;
      timeLeft = `${m}:${s.toString().padStart(2, '0')}`;
    }

    return (
      <motion.div 
        key={item.id} 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border mb-3 transition-all hover:shadow-md ${isDemanded ? 'border-red-500 shadow-red-500/20' : 'border-zinc-100 dark:border-zinc-800'}`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
            {iconMap[item.icon]}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              {t(item.name, state.language)}
              {count > 0 && (
                <span className="text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                  x{count}
                </span>
              )}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t(item.description, state.language)}</p>
            {isDemanded && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold mt-1.5 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg w-fit border border-red-200 dark:border-red-800/30">
                <Timer className="w-3.5 h-3.5" />
                {t('Приказ:', state.language)} {timeLeft}
              </div>
            )}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onBuy(item.id)}
          disabled={!canAfford}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
            canAfford
              ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm shadow-yellow-500/20'
              : 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600'
          }`}
        >
          {cost.toLocaleString('ru-RU')} ₽
        </motion.button>
      </motion.div>
    );
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-8 pb-32">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{t('Витрина', state.language)}</h2>
      
      <div className="mb-8">
        {SHOP_ITEMS.map(renderItem)}
      </div>
    </div>
  );
}
