import React, { useMemo, useRef, useState } from 'react';
import { AlertCircle, Play, ShieldAlert, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DepGameResult, GameState } from '../types';
import { calculateDepRatingPenalty, calculateDepWheelConfig } from '../game/dep';

interface DepProps {
  state: GameState;
  onPlay: (bet: number) => DepGameResult | null;
}

const getBetValidationMessage = (bet: number, balance: number) => {
  if (!Number.isFinite(bet) || bet <= 0) return 'Нельзя поставить 0 или отрицательную сумму.';
  if (bet > balance) return 'Нельзя поставить больше текущего баланса.';
  return '';
};

const buildWheelGradient = (config: ReturnType<typeof calculateDepWheelConfig>) => {
  const gap = Math.max(0.8, 5 / config.totalSlots);

  return `conic-gradient(${config.segments.map(segment => {
    const color = segment.isWin ? '#00d469' : '#ff3347';
    const start = Math.min(segment.endAngle, segment.startAngle + gap);
    const end = Math.max(start, segment.endAngle - gap);

    return `#25272d ${segment.startAngle}deg ${start}deg, ${color} ${start}deg ${end}deg, #25272d ${end}deg ${segment.endAngle}deg`;
  }).join(', ')})`;
};

export function Dep({ state, onPlay }: DepProps) {
  const [amount, setAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<DepGameResult | null>(null);
  const [error, setError] = useState('');
  const spinningRef = useRef(false);

  const bet = useMemo(() => Math.floor(Number(amount)), [amount]);
  const validationMessage = amount ? getBetValidationMessage(bet, state.balance) : '';
  const canPlay = amount !== '' && !validationMessage && !isSpinning;
  const hasValidBet = amount !== '' && !validationMessage;
  const wheelConfig = useMemo(
    () => calculateDepWheelConfig(hasValidBet ? bet : 1, hasValidBet ? state.balance : 100),
    [bet, hasValidBet, state.balance]
  );
  const projectedChance = hasValidBet ? wheelConfig.winChance : null;
  const projectedPenalty = hasValidBet
    ? Math.min(state.socialCredit, calculateDepRatingPenalty(bet, state.balance))
    : null;
  const wheelGradient = useMemo(() => buildWheelGradient(wheelConfig), [wheelConfig]);

  const handlePlay = () => {
    if (isSpinning || spinningRef.current) return;

    const nextError = getBetValidationMessage(bet, state.balance);
    if (!amount || nextError) {
      setError(nextError || 'Введите сумму ставки.');
      return;
    }

    spinningRef.current = true;
    const gameResult = onPlay(bet);
    if (!gameResult) {
      spinningRef.current = false;
      setError('Ставка не принята. Проверьте баланс и сумму.');
      return;
    }

    setError('');
    setResult(null);
    setIsSpinning(true);

    const slotAngle = 360 / gameResult.totalSlots;
    const jitter = (Math.random() - 0.5) * slotAngle * 0.45;
    const spinTurns = 5 + Math.floor(Math.random() * 3);
    const nextRotation = (Math.floor(rotation / 360) + spinTurns + 1) * 360 - gameResult.resultSlotCenterAngle + jitter;
    setRotation(nextRotation);

    window.setTimeout(() => {
      setResult(gameResult);
      setIsSpinning(false);
      spinningRef.current = false;
    }, 2400);
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-6 pb-32 bg-zinc-950 text-white">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-3xl font-black leading-none">Деп</h2>
          <p className="text-base leading-snug text-zinc-300 mt-3">Колесо фортуны под надзором партии</p>
          <div className="text-[11px] font-semibold text-zinc-500 mt-2">
            Баланс: {state.balance.toLocaleString('ru-RU')} ₽ · Рейтинг: {state.socialCredit}
          </div>
        </div>
        <div className="w-14 h-14 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/60 shadow-[0_0_28px_rgba(239,68,68,0.16)] shrink-0">
          <ShieldAlert className="w-7 h-7" />
        </div>
      </div>

      <div className="rounded-[2rem] bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.42)] border border-white/10 mb-4">
        <div className="relative aspect-square w-full max-w-[245px] mx-auto flex items-center justify-center">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-white drop-shadow-[0_8px_18px_rgba(255,255,255,0.18)]" />
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full rounded-full border-[10px] border-zinc-800 shadow-[inset_0_0_24px_rgba(0,0,0,0.35),0_16px_36px_rgba(0,0,0,0.35)] relative overflow-hidden"
            style={{ background: wheelGradient }}
          >
            <div className="absolute inset-[26%] rounded-full bg-zinc-950/82 border border-white/10 flex items-center justify-center text-center shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
              <div>
                <div className="text-3xl font-black">{isSpinning ? '...' : 'x2'}</div>
                <div className="text-sm font-black text-zinc-300 mt-1">или минус</div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="mt-3 text-center text-[11px] font-semibold text-zinc-500">
          {wheelConfig.totalSlots} слотов · {wheelConfig.winningSlots} x2 · {wheelConfig.losingSlots} минус
        </div>
      </div>

      <div className="rounded-[2rem] bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.42)] border border-white/10 mb-4">
        <label className="block text-sm font-bold text-zinc-300 mb-3">Сумма ставки</label>
        <div className="flex items-center gap-3 border-b-2 border-yellow-400 pb-3 mb-4">
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={amount}
            onChange={e => {
              setAmount(e.target.value);
              setError('');
            }}
            disabled={isSpinning}
            placeholder="0"
            className="w-full bg-transparent text-4xl font-black text-white outline-none placeholder:text-zinc-700 disabled:opacity-60"
          />
          <span className="text-4xl font-black text-zinc-300">₽</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5 text-xs font-bold">
          <div className="rounded-2xl bg-white/[0.05] px-3 py-2 text-zinc-300">
            Шанс x2: {projectedChance ? `${Math.round(projectedChance * 100)}%` : '—'}
          </div>
          <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-red-300">
            Рейтинг: {projectedPenalty !== null ? (projectedPenalty > 0 ? `-${projectedPenalty}` : '0') : '—'}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {(error || validationMessage) && !isSpinning && (
            <motion.div
              key="dep-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-2xl px-3 py-2 mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error || validationMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handlePlay}
          disabled={!canPlay}
          className="w-full py-4 rounded-full bg-yellow-500 text-white font-black text-base transition-all disabled:opacity-55 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_14px_35px_rgba(234,179,8,0.22)] hover:bg-yellow-400"
        >
          <Play className="w-5 h-5" />
          {isSpinning ? 'Колесо крутится' : 'Запустить колесо'}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isSpinning ? (
          <motion.div
            key="spinning"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-[2rem] bg-white/[0.06] border border-white/10 px-4 py-3 text-center text-sm font-medium text-zinc-300"
          >
            Ставка списана. Партия считает ваши проценты...
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-[2rem] p-4 border ${
              result.isWin
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  result.isWin ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {result.isWin ? <Trophy className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-black text-white">
                    {result.isWin ? `Выигрыш x2: +${result.bet.toLocaleString('ru-RU')} ₽` : `Проигрыш: -${result.bet.toLocaleString('ru-RU')} ₽`}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Шанс был {Math.round(result.winChance * 100)}%, слот {result.resultSlotIndex + 1}/{result.totalSlots}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-red-300">
                {result.partyMessage}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Социальный рейтинг снижен за деп.
              </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-zinc-500"
          >
            На 100, 1000, 10000 и дальше партия добавляет по одному красному слоту.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
