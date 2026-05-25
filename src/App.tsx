/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home } from './components/Home';
import { Shop } from './components/Shop';
import { Transfers } from './components/Transfers';
import { History } from './components/History';
import { Dep } from './components/Dep';
import { useGame } from './hooks/useGame';
import { Home as HomeIcon, ShoppingBag, Send, Clock, Dices, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t } from './constants';

type Tab = 'home' | 'transfers' | 'dep' | 'history' | 'shop';

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
};

export default function App() {
  const { state, click, buyItem, getCost, transferMoney, buySkin, equipSkin, playDepGame, notification } = useGame();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const handleTabChange = (tab: Tab) => {
    vibrate(10);
    setActiveTab(tab);
  };

  if (state.isGameOver) {
    return (
      <div className="min-h-screen bg-red-950 text-red-50 font-sans flex flex-col justify-center items-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full bg-red-900/50 backdrop-blur-md border border-red-500/30 rounded-[2.5rem] p-8 text-center shadow-2xl shadow-red-900/50"
        >
          <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-5xl">📉</span>
          </div>
          <h1 className="text-3xl font-black mb-2 text-red-400 uppercase tracking-widest">{t('Партия недовольна', state.language)}</h1>
          <p className="text-red-200/80 mb-8">{t('Ваш социальный рейтинг упал до нуля. Вы отправляетесь в лагерь перевоспитания.', state.language)}</p>
          
          <button
            onClick={() => {
              localStorage.removeItem('vorobyov_bank_state');
              window.location.reload();
            }}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            {t('Начать заново', state.language)}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans selection:bg-yellow-200 dark:selection:bg-yellow-900 flex flex-col justify-center">
      <div className="w-full max-w-[380px] mx-auto h-screen sm:h-[850px] sm:max-h-[95vh] relative overflow-hidden flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50 shadow-2xl sm:rounded-[2.5rem] sm:border sm:border-zinc-200 dark:sm:border-zinc-800">
        {/* Toast Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="absolute top-6 left-6 right-6 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 rounded-[1.5rem] shadow-xl flex items-center gap-4 border border-zinc-200 dark:border-zinc-800"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                typeof notification === 'string' ? 'bg-yellow-500' :
                notification.type === 'party' ? 'bg-red-600' : 
                notification.type === 'transfer' ? 'bg-blue-500' : 
                notification.type === 'success' ? 'bg-green-500' : 
                (notification.type === 'mcd' || notification.type === 'vkusn') ? 'bg-transparent' : 'bg-yellow-500'
              }`}>
                {typeof notification === 'object' && notification.type === 'mcd' ? (
                  <img src="/img/mac.jpg" alt="M" className="w-full h-full object-cover" />
                ) : typeof notification === 'object' && notification.type === 'vkusn' ? (
                  <img src="/img/vkusn.jpg" alt="V" className="w-full h-full object-cover" />
                ) : typeof notification === 'object' && notification.type === 'party' ? (
                  <span className="text-lg">🇨🇳</span>
                ) : typeof notification === 'object' && notification.type === 'transfer' ? (
                  <Send className="w-5 h-5 text-white" />
                ) : typeof notification === 'object' && notification.type === 'success' ? (
                  <ShoppingBag className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-bold text-lg">!</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm leading-tight">
                  {typeof notification === 'string' ? t(notification, state.language) : t(notification.message, state.language)}
                </span>
                {typeof notification === 'object' && notification.comment && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 italic mt-0.5 truncate">
                    «{t(notification.comment, state.language)}»
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0">
                <Home state={state} onClick={click} onBuySkin={buySkin} onEquipSkin={equipSkin} />
              </motion.div>
            )}
            {activeTab === 'transfers' && (
              <motion.div key="transfers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0">
                <Transfers state={state} onTransfer={transferMoney} />
              </motion.div>
            )}
            {activeTab === 'dep' && (
              <motion.div key="dep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0">
                <Dep state={state} onPlay={playDepGame} />
              </motion.div>
            )}
            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0">
                <History state={state} />
              </motion.div>
            )}
            {activeTab === 'shop' && (
              <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0">
                <Shop state={state} onBuy={buyItem} getCost={getCost} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <nav className="absolute bottom-0 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 pb-safe z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center p-2">
            <button
              onClick={() => handleTabChange('home')}
              className={`flex flex-col items-center justify-center w-full py-2 rounded-full transition-colors ${
                activeTab === 'home' ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <HomeIcon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{t('Главная', state.language)}</span>
            </button>
            <button
              onClick={() => handleTabChange('transfers')}
              className={`flex flex-col items-center justify-center w-full py-2 rounded-full transition-colors ${
                activeTab === 'transfers' ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Send className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{t('Переводы', state.language)}</span>
            </button>
            <button
              onClick={() => handleTabChange('dep')}
              className={`flex flex-col items-center justify-center w-full py-2 rounded-full transition-colors ${
                activeTab === 'dep' ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Dices className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{t('Деп', state.language)}</span>
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`flex flex-col items-center justify-center w-full py-2 rounded-full transition-colors ${
                activeTab === 'history' ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Clock className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{t('История', state.language)}</span>
            </button>
            <button
              onClick={() => handleTabChange('shop')}
              className={`flex flex-col items-center justify-center w-full py-2 rounded-full transition-colors ${
                activeTab === 'shop' ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <ShoppingBag className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{t('Витрина', state.language)}</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
