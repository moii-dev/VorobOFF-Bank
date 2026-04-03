import React, { useState } from 'react';
import { GameState } from '../types';
import { Send, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../constants';

export function Transfers({ state, onTransfer }: { state: GameState, onTransfer: (id: string, name: string, a: number) => void }) {
  const [tab, setTab] = useState<'recent' | 'sbp'>('recent');
  
  // Recent tab state
  const contacts = state.recentContacts || [];
  const [selected, setSelected] = useState(contacts[0]?.id || '');
  const [amount, setAmount] = useState('');

  // SBP tab state
  const [sbpName, setSbpName] = useState('');
  const [sbpAmount, setSbpAmount] = useState('');

  const handleSendRecent = () => {
    const val = parseInt(amount, 10);
    if (!isNaN(val) && val > 0 && val <= state.balance) {
      const contact = contacts.find(c => c.id === selected);
      if (contact) {
        onTransfer(contact.id, contact.name, val);
        setAmount('');
      }
    }
  };

  const handleSendSbp = () => {
    const val = parseInt(sbpAmount, 10);
    if (!isNaN(val) && val > 0 && val <= state.balance && sbpName.trim()) {
      const id = 'sbp_' + Date.now();
      onTransfer(id, sbpName.trim(), val);
      setSbpName('');
      setSbpAmount('');
      setTab('recent');
      setSelected(id);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-8 pb-32">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{t('Переводы', state.language)}</h2>
      
      <div className="flex bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-2xl mb-6">
        <button
          onClick={() => setTab('recent')}
          className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${tab === 'recent' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          {t('Недавние', state.language)}
        </button>
        <button
          onClick={() => setTab('sbp')}
          className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${tab === 'sbp' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          {t('По номеру (СБП)', state.language)}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'recent' ? (
          <motion.div key="recent" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-8">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">{t('Кому перевести', state.language)}</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {contacts.map(c => (
                  <motion.button
                    key={c.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelected(c.id)}
                    className={`flex flex-col items-center gap-2 min-w-[80px] transition-transform`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-colors ${
                      selected === c.id 
                        ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30' 
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800'
                    }`}>
                      {c.avatar}
                    </div>
                    <span className="text-xs text-center font-medium text-zinc-700 dark:text-zinc-300 leading-tight">
                      {c.name.split(' ')[0]}<br/>{c.name.split(' ')[1] || ''}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">{t('Сумма перевода', state.language)}</label>
              <div className="flex items-center gap-2 border-b-2 border-yellow-500 pb-2 mb-6">
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-4xl font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
                <span className="text-3xl font-medium text-zinc-400">₽</span>
              </div>
              
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
                {t('Доступно:', state.language)} {state.balance.toLocaleString('ru-RU')} ₽
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSendRecent}
                disabled={!amount || parseInt(amount) <= 0 || parseInt(amount) > state.balance || !selected}
                className="w-full py-4 rounded-full bg-yellow-500 text-white font-semibold text-lg transition-all disabled:opacity-50 flex items-center justify-center shadow-md shadow-yellow-500/20 disabled:shadow-none"
              >
                {t('Перевести', state.language)}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="sbp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">{t('Имя и Фамилия получателя', state.language)}</label>
                <input 
                  type="text" 
                  value={sbpName}
                  onChange={e => setSbpName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 rounded-xl text-zinc-900 dark:text-white outline-none border border-zinc-200 dark:border-zinc-700 focus:border-yellow-500 transition-colors"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">{t('Сумма перевода', state.language)}</label>
                <div className="flex items-center gap-2 border-b-2 border-yellow-500 pb-2">
                  <input 
                    type="number" 
                    value={sbpAmount}
                    onChange={e => setSbpAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent text-4xl font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  />
                  <span className="text-3xl font-medium text-zinc-400">₽</span>
                </div>
              </div>
              
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
                {t('Доступно:', state.language)} {state.balance.toLocaleString('ru-RU')} ₽
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSendSbp}
                disabled={!sbpAmount || parseInt(sbpAmount) <= 0 || parseInt(sbpAmount) > state.balance || !sbpName.trim()}
                className="w-full py-4 rounded-full bg-yellow-500 text-white font-semibold text-lg transition-all disabled:opacity-50 flex items-center justify-center shadow-md shadow-yellow-500/20 disabled:shadow-none"
              >
                {t('Перевести по СБП', state.language)}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
