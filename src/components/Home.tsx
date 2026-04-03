import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../types';
import { TrendingUp, MousePointerClick } from 'lucide-react';
import { SKINS, t } from '../constants';

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
};

interface HomeProps {
  state: GameState;
  onClick: () => void;
}

interface ClickAnim {
  id: number;
  x: number;
  y: number;
  value: number;
}

export function Home({ state, onClick }: HomeProps) {
  const [clicks, setClicks] = useState<ClickAnim[]>([]);
  const clickIdRef = useRef(0);

  const currentSkinObj = SKINS.find(s => s.id === state.currentSkin) || SKINS[0];

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    vibrate(5);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = clickIdRef.current++;
    setClicks((prev) => [...prev, { id, x, y, value: state.clickPower }]);

    onClick();

    setTimeout(() => {
      setClicks((prev) => prev.filter((c) => c.id !== id));
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-start h-full px-6 py-6 overflow-y-auto pb-24">
      
      {/* Visa Card */}
      <div className="w-full max-w-md bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-[2rem] p-5 shadow-xl shadow-yellow-600/20 text-zinc-900 relative overflow-hidden aspect-[1.586/1] flex flex-col justify-between shrink-0">
        {/* Decorative background elements for "plastic" feel */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top row: Bank Name & Visa Logo */}
        <div className="flex justify-between items-start relative z-10">
          <span className="text-lg font-bold tracking-wider opacity-95 drop-shadow-sm">ВоробьOFF</span>
          {/* Visa Logo SVG */}
          <svg className="w-12 h-auto opacity-90 drop-shadow-sm" viewBox="0 0 32 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.52 0.400024H12.68L10.32 6.80002L9.92 4.80002C9.72 3.60002 8.88 2.80002 7.72 2.40002L3.6 1.60002L3.52 2.00002C4.36 2.40002 5.56 3.20002 6.04 4.40002L8.08 9.60002H10.12L14.52 0.400024ZM22.4 0.400024H20.64C20.08 0.400024 19.64 0.800024 19.4 1.20002L16.48 8.40002L18.52 9.60002L18.92 8.40002H21.4L21.68 9.60002H23.52L22.4 0.400024ZM19.52 6.80002L20.48 4.00002L21.04 6.80002H19.52ZM28.64 0.400024C27.68 0.400024 26.04 0.800024 26.04 2.80002C26.04 4.80002 28.84 4.80002 28.84 6.00002C28.84 6.80002 27.68 7.20002 26.68 7.20002C25.56 7.20002 24.8 6.80002 24.16 6.40002L23.76 8.00002C24.44 8.40002 25.52 8.80002 26.72 8.80002C28.84 8.80002 30.88 7.60002 30.88 5.60002C30.88 2.80002 28.08 2.80002 28.08 2.00002C28.08 1.60002 28.84 1.20002 29.84 1.20002C30.64 1.20002 31.28 1.60002 31.84 2.00002L32.24 0.400024C31.56 0.0000244141 30.24 -0.0000244141 28.64 0.400024ZM5.28 0.400024H0L0.04 0.800024L3.6 9.60002H5.68L8.24 0.400024H5.28Z" fill="currentColor"/>
          </svg>
        </div>

        {/* Chip & Contactless */}
        <div className="flex items-center gap-3 relative z-10 mt-1">
          <div className="w-10 h-7 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md opacity-90 border border-yellow-600/50 flex items-center justify-center overflow-hidden relative shadow-sm">
            <div className="w-full h-[1px] bg-yellow-700/30 absolute top-1/3"></div>
            <div className="w-full h-[1px] bg-yellow-700/30 absolute top-2/3"></div>
            <div className="w-[1px] h-full bg-yellow-700/30 absolute left-1/3"></div>
            <div className="w-[1px] h-full bg-yellow-700/30 absolute left-2/3"></div>
            <div className="w-4 h-4 border border-yellow-700/30 rounded-sm absolute"></div>
          </div>
          <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14c-.3-1.3-.3-2.7 0-4"/>
            <path d="M11.5 16.5c-.8-2.5-.8-5.5 0-8"/>
            <path d="M14.5 19c-1.3-4-1.3-9 0-13"/>
            <path d="M17.5 21.5c-1.8-5.5-1.8-12.5 0-18"/>
          </svg>
        </div>

        {/* Balance (Middle) */}
        <div className="relative z-10 mt-2">
          <div className="flex items-baseline gap-1 drop-shadow-md">
            <span className="text-3xl font-bold tracking-tight">
              {state.balance.toLocaleString('ru-RU')}
            </span>
            <span className="text-xl font-medium opacity-90">₽</span>
          </div>
        </div>

        {/* Bottom row: Card Number, Name, Expiry */}
        <div className="flex justify-between items-end relative z-10 mt-2">
          <div>
            <div className="font-mono text-sm tracking-[0.15em] opacity-90 mb-1 drop-shadow-sm">
              4276 •••• •••• 1337
            </div>
            <div className="text-[10px] font-medium tracking-widest uppercase opacity-80 drop-shadow-sm">
              VOROBYOV
            </div>
          </div>
          <div className="text-right">
            <div className="text-[8px] uppercase opacity-70 tracking-wider mb-0.5">Valid Thru</div>
            <div className="font-mono text-sm tracking-wider opacity-90 drop-shadow-sm">12/30</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="w-full max-w-md flex gap-2 mt-6 shrink-0">
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[1.5rem] p-2 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-1">
          <div className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold truncate">{t('Доход', state.language)}</div>
          <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">+{state.passiveIncome} <span className="text-[10px] font-medium text-zinc-500">₽/с</span></div>
        </div>
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[1.5rem] p-2 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-1">
          <div className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold truncate">{t('Клик', state.language)}</div>
          <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">+{state.clickPower} <span className="text-[10px] font-medium text-zinc-500">₽</span></div>
        </div>
      </div>

      {/* Party Stats */}
      <div className="w-full max-w-md flex gap-2 mt-2 mb-4 shrink-0">
        <div className="flex-[1.5] bg-red-50 dark:bg-red-900/20 rounded-[1.5rem] p-2 border border-red-100 dark:border-red-800/30 flex flex-col items-center justify-center">
          <div className="text-[9px] text-red-600 dark:text-red-400 uppercase tracking-wider font-bold">{t('Соц. рейтинг', state.language)}</div>
          <div className="text-sm font-black text-red-700 dark:text-red-500">{state.socialCredit}</div>
        </div>
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[1.5rem] p-2 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">{t('Кошка-жена', state.language)}</div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">{state.catWives}</div>
        </div>
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[1.5rem] p-2 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">{t('Миска риса', state.language)}</div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">{state.riceBowls}</div>
        </div>
      </div>

      {/* Clicker Avatar */}
      <div className="relative flex-1 flex items-center justify-center w-full min-h-[280px]">
        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={handleImageClick}
          className="relative w-64 h-64 rounded-full bg-white dark:bg-zinc-800 shadow-2xl shadow-yellow-500/10 flex items-center justify-center cursor-pointer overflow-hidden select-none touch-manipulation border-4 border-white dark:border-zinc-700"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <img
            src={currentSkinObj.avatarUrl}
            alt={currentSkinObj.name}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          <AnimatePresence>
            {clicks.map((click) => (
              <motion.div
                key={click.id}
                initial={{ opacity: 1, y: click.y - 20, x: click.x - 10, scale: 0.5 }}
                animate={{ opacity: 0, y: click.y - 100, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute text-2xl font-bold text-yellow-600 dark:text-yellow-500 pointer-events-none drop-shadow-sm"
              >
                +{click.value}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
