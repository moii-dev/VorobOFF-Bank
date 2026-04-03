import React from 'react';
import { GameState } from '../types';
import { SKINS } from '../constants';
import { Check, Lock, Unlock } from 'lucide-react';
import { motion } from 'motion/react';
import { t } from '../constants';

export function Skins({ state, onBuy, onEquip }: { state: GameState, onBuy: (id: string) => void, onEquip: (id: string) => void }) {
  return (
    <div className="h-full overflow-y-auto px-6 py-8 pb-32">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{t('Скины', state.language)}</h2>
      
      <div className="space-y-4">
        {SKINS.map(skin => {
          const isOwned = state.ownedSkins.includes(skin.id);
          const isEquipped = state.currentSkin === skin.id;
          const canAfford = state.balance >= skin.price;

          return (
            <motion.div 
              key={skin.id} 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border ${isEquipped ? 'border-yellow-500' : 'border-zinc-100 dark:border-zinc-800'} transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border-2 border-zinc-200 dark:border-zinc-700">
                  <img src={skin.avatarUrl} alt={skin.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">{t(skin.name, state.language)}</h3>
                  {!isOwned && (
                    <p className="text-sm font-medium text-zinc-500 mt-0.5">{skin.price.toLocaleString('ru-RU')} ₽</p>
                  )}
                </div>
              </div>

              <div className="shrink-0 ml-2">
                {isEquipped ? (
                  <div className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 font-semibold text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" /> {t('Надето', state.language)}
                  </div>
                ) : isOwned ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEquip(skin.id)}
                    className="px-4 py-2 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-sm transition-all"
                  >
                    {t('Надеть', state.language)}
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onBuy(skin.id)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-1 ${
                      canAfford
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm shadow-yellow-500/20'
                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600'
                    }`}
                  >
                    {canAfford ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {t('Купить', state.language)}
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
