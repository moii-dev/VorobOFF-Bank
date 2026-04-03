import React from 'react';
import { GameState, Transaction } from '../types';
import { ArrowUpRight, ShoppingBag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../constants';

const getIcon = (tx: Transaction) => {
  if (tx.title.includes('McDonald') || tx.title.includes('Вкусно — и точка')) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M21.49 19.18c-1.52-8.46-4.47-14.68-8.49-14.68-2.28 0-4.29 2.38-5.5 6.38-1.21-4-3.22-6.38-5.5-6.38-4.02 0-6.97 6.22-8.49 14.68-.22 1.11 1.52 1.62 2.12.62 2.52-4.2 4.47-9.8 5.27-14.18.4-2.1 1.2-2.8 1.6-2.8.4 0 1.2.7 1.6 2.8.8 4.38 2.75 9.98 5.27 14.18.6 1 2.34.49 2.12-.62z" />
      </svg>
    );
  }
  switch (tx.type) {
    case 'transfer': return <ArrowUpRight className="w-5 h-5" />;
    case 'purchase': return <ShoppingBag className="w-5 h-5" />;
    case 'random': return <AlertCircle className="w-5 h-5" />;
    default: return <ArrowUpRight className="w-5 h-5" />;
  }
};

const getIconBg = (tx: Transaction) => {
  if (tx.title.includes('McDonald') || tx.title.includes('Вкусно — и точка')) {
    return 'bg-[#ffc72c] text-[#da291c]';
  }
  switch (tx.type) {
    case 'transfer': return 'bg-blue-50 text-blue-500 dark:bg-blue-900/20';
    case 'random': return 'bg-orange-50 text-orange-500 dark:bg-orange-900/20';
    default: return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20';
  }
};

export function History({ state }: { state: GameState }) {
  return (
    <div className="h-full overflow-y-auto px-6 py-8 pb-32">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{t('История', state.language)}</h2>
      
      {state.transactions.length === 0 ? (
        <div className="text-center text-zinc-500 mt-10">
          <p>{t('Ничего нет', state.language)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {state.transactions.map(tx => (
              <motion.div 
                key={tx.id} 
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-800 gap-3"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getIconBg(tx)}`}>
                    {getIcon(tx)}
                  </div>
                  <div className="overflow-hidden min-w-0 flex-1">
                    <h3 className="font-medium text-zinc-900 dark:text-white text-sm truncate">{t(tx.title, state.language)}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      {new Date(tx.date).toLocaleString(state.language === 'zh' ? 'zh-CN' : 'ru-RU', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </p>
                    {tx.comment && (
                      <p className="text-xs italic text-zinc-600 dark:text-zinc-400 mt-1 truncate">
                        «{t(tx.comment, state.language)}»
                      </p>
                    )}
                  </div>
                </div>
                <div className={`font-semibold shrink-0 ml-2 whitespace-nowrap ${tx.amount > 0 ? 'text-yellow-600 dark:text-yellow-500' : 'text-zinc-900 dark:text-white'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('ru-RU')} ₽
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
