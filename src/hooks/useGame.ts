import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Transaction } from '../types';
import { SHOP_ITEMS, SKINS, DEFAULT_CONTACTS } from '../constants';

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
};

const INITIAL_STATE: GameState = {
  balance: 0,
  clickPower: 1,
  passiveIncome: 0,
  inventory: {},
  transactions: [],
  ownedSkins: ['default'],
  currentSkin: 'default',
  recentContacts: DEFAULT_CONTACTS,
  socialCredit: 1000,
  catWives: 0,
  riceBowls: 0,
  partyDemand: null,
  language: 'ru',
  isGameOver: false,
};

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('vorobyov_bank_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...INITIAL_STATE, 
          ...parsed, 
          transactions: parsed.transactions || [],
          ownedSkins: parsed.ownedSkins || ['default'],
          currentSkin: parsed.currentSkin || 'default',
          recentContacts: parsed.recentContacts || DEFAULT_CONTACTS,
          socialCredit: parsed.socialCredit ?? 1000,
          catWives: parsed.catWives ?? 0,
          riceBowls: parsed.riceBowls ?? 0,
          partyDemand: parsed.partyDemand || null,
          language: parsed.language || 'ru',
          isGameOver: parsed.isGameOver || false,
        };
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [notification, setNotification] = useState<string | null>(null);

  const partyLovedRef = useRef<string>('book_xi');
  const partyHatedRef = useRef<string>('pooh');

  // Game Over Check
  useEffect(() => {
    if (state.socialCredit <= 0 && !state.isGameOver) {
      setState(prev => ({ ...prev, isGameOver: true }));
    }
  }, [state.socialCredit, state.isGameOver]);

  // Random Language Toggle
  useEffect(() => {
    const scheduleNext = () => {
      const delay = Math.random() * 60000 + 30000; // 30s to 90s
      return setTimeout(() => {
        setState(prev => {
          if (prev.isGameOver) return prev;
          const newLang = prev.language === 'ru' ? 'zh' : 'ru';
          setNotification(newLang === 'zh' ? 'Партия изменила язык!' : 'Язык восстановлен');
          setTimeout(() => setNotification(null), 3000);
          return { ...prev, language: newLang };
        });
        timeoutId = scheduleNext();
      }, delay);
    };
    let timeoutId = scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  // Randomize loved/hated items periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const items = SHOP_ITEMS.map(i => i.id);
      partyLovedRef.current = items[Math.floor(Math.random() * items.length)];
      partyHatedRef.current = items[Math.floor(Math.random() * items.length)];
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  // Random Party Event
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (Math.random() > 0.15 || prev.balance < 100) return prev; // 15% chance every 30s
        const penalty = Math.floor(Math.random() * 10000) + 1;
        const actualPenalty = Math.min(prev.balance, penalty);
        const creditPenalty = Math.floor(Math.random() * 50) + 10;

        const newTx: Transaction = {
          id: Date.now().toString() + Math.random(),
          type: 'random',
          amount: -actualPenalty,
          title: 'Штраф от Партии',
          date: Date.now(),
          comment: 'Вы разочаровали партию'
        };

        vibrate([100, 50, 100, 50, 100]);
        setNotification(`Партия разочарована! Штраф: -${actualPenalty} ₽, -${creditPenalty} рейтинга`);
        setTimeout(() => setNotification(null), 5000);

        return {
          ...prev,
          balance: prev.balance - actualPenalty,
          socialCredit: prev.socialCredit - creditPenalty,
          transactions: [newTx, ...prev.transactions].slice(0, 100)
        };
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Party Demand Event (Timed Quest)
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.partyDemand) return prev; // Already have a demand
        if (Math.random() > 0.2) return prev; // 20% chance every 45s

        const CHINESE_ITEMS = ['tea', 'huawei', 'book_xi', 'ticket_bj', 'pooh', 'dragon'];
        const randomItem = CHINESE_ITEMS[Math.floor(Math.random() * CHINESE_ITEMS.length)];
        const minutes = Math.floor(Math.random() * 5) + 1; // 1 to 5
        
        const itemDef = SHOP_ITEMS.find(i => i.id === randomItem);
        if (!itemDef) return prev;
        
        vibrate([100, 50, 100]);
        setNotification(`Партия требует купить: ${itemDef.name}! У вас ${minutes} мин.`);
        setTimeout(() => setNotification(null), 5000);

        return {
          ...prev,
          partyDemand: {
            itemId: randomItem,
            expiresAt: Date.now() + minutes * 60 * 1000
          }
        };
      });
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Check Expiration of Party Demand
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.partyDemand) return prev;
        if (Date.now() > prev.partyDemand.expiresAt) {
          vibrate([200, 100, 200, 100, 200]);
          setNotification("Время вышло! Партия недовольна. -100 рейтинга, -1 кошка-жена, -1 рис");
          setTimeout(() => setNotification(null), 5000);
          return {
            ...prev,
            socialCredit: prev.socialCredit - 100,
            catWives: Math.max(0, prev.catWives - 1),
            riceBowls: Math.max(0, prev.riceBowls - 1),
            partyDemand: null
          };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('vorobyov_bank_state', JSON.stringify(state));
  }, [state]);

  // Passive income
  useEffect(() => {
    if (state.passiveIncome > 0) {
      const interval = setInterval(() => {
        setState((prev) => ({ ...prev, balance: prev.balance + prev.passiveIncome }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.passiveIncome]);

  // Random McDonald's event
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        // 30% chance every 20 seconds, only if balance >= 50
        if (Math.random() > 0.3 || prev.balance < 50) return prev;

        const cost = Math.floor(Math.random() * 300) + 50; // 50 to 350
        const actualCost = Math.min(prev.balance, cost);
        
        const newTx: Transaction = {
          id: Date.now().toString() + Math.random(),
          type: 'random',
          amount: -actualCost,
          title: 'Вкусно — и точка (McDonald\'s)',
          date: Date.now()
        };

        vibrate([50, 100, 50]);
        setNotification(`Списание: Вкусно — и точка (-${actualCost} ₽)`);
        setTimeout(() => setNotification(null), 4000);

        return {
          ...prev,
          balance: prev.balance - actualCost,
          transactions: [newTx, ...prev.transactions].slice(0, 100)
        };
      });
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const click = useCallback(() => {
    setState((prev) => ({ ...prev, balance: prev.balance + prev.clickPower }));
  }, []);

  const buyItem = useCallback((itemId: string) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return;

    setState((prev) => {
      const currentCount = prev.inventory[itemId] || 0;
      const cost = Math.floor(item.basePrice * Math.pow(1.15, currentCount));

      if (prev.balance >= cost) {
        const newTx: Transaction = {
          id: Date.now().toString() + Math.random(),
          type: 'purchase',
          amount: -cost,
          title: `Покупка: ${item.name}`,
          date: Date.now()
        };

        const newState = {
          ...prev,
          balance: prev.balance - cost,
          inventory: {
            ...prev.inventory,
            [itemId]: currentCount + 1,
          },
          transactions: [newTx, ...prev.transactions].slice(0, 100)
        };

        if (item.type === 'click') {
          newState.clickPower += item.value;
        } else if (item.type === 'passive') {
          newState.passiveIncome += item.value;
        }

        // Party mechanics
        if (prev.partyDemand && prev.partyDemand.itemId === itemId) {
          newState.partyDemand = null;
          newState.socialCredit += 50;
          newState.catWives += 1;
          newState.riceBowls += 1;
          vibrate([50, 50, 50]);
          setNotification("Партия довольна вашей покорностью! +50 рейтинга, +1 кошка-жена, +1 рис");
          setTimeout(() => setNotification(null), 4000);
        } else if (itemId === partyHatedRef.current) {
          newState.catWives = Math.max(0, newState.catWives - 1);
          newState.riceBowls = Math.max(0, newState.riceBowls - 1);
          newState.socialCredit -= 150;
          vibrate([200, 100, 200]);
          setNotification("Партия в ярости! Вы купили запрещенку. -1 кошка-жена, -1 миска риса, -150 рейтинга");
          setTimeout(() => setNotification(null), 5000);
          
          const items = SHOP_ITEMS.map(i => i.id);
          partyHatedRef.current = items[Math.floor(Math.random() * items.length)];
        } else if (itemId === partyLovedRef.current) {
          newState.catWives += 1;
          newState.riceBowls += 1;
          newState.socialCredit += 100;
          vibrate([50, 50, 50, 50]);
          setNotification("Партия гордится вами! +1 кошка-жена, +1 миска риса, +100 рейтинга");
          setTimeout(() => setNotification(null), 5000);
          
          const items = SHOP_ITEMS.map(i => i.id);
          partyLovedRef.current = items[Math.floor(Math.random() * items.length)];
        }

        return newState;
      }
      return prev;
    });
  }, []);

  const transferMoney = useCallback((contactId: string, contactName: string, amount: number) => {
    setState(prev => {
      if (prev.balance >= amount && amount > 0) {
        vibrate(20);
        const newTx: Transaction = {
          id: Date.now().toString() + Math.random(),
          type: 'transfer',
          amount: -amount,
          title: `Перевод: ${contactName}`,
          date: Date.now()
        };
        
        setNotification(`Перевод выполнен: ${contactName} (-${amount} ₽)`);
        setTimeout(() => setNotification(null), 3000);

        // Update recent contacts if it's a new SBP transfer
        let newRecentContacts = prev.recentContacts;
        if (!prev.recentContacts.find(c => c.id === contactId)) {
           newRecentContacts = [
             { id: contactId, name: contactName, avatar: contactName.charAt(0).toUpperCase() },
             ...prev.recentContacts
           ].slice(0, 10); // Keep top 10
        }

        const returnAmount = Math.floor(amount * 0.1);
        if (returnAmount > 0) {
          const delay = Math.floor(Math.random() * 55000) + 5000; // 5 to 60 seconds
          setTimeout(() => {
            setState(current => {
              const COMMENTS = [
                'ты жирный',
                'это на вкусную точку тебе',
                'а это за минет',
                'на пиво',
                'возвращаю долг',
                'от души брат',
                'на новые скины'
              ];
              const randomComment = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
              const returnTx: Transaction = {
                id: Date.now().toString() + Math.random(),
                type: 'income',
                amount: returnAmount,
                title: `От: ${contactName}`,
                date: Date.now(),
                comment: randomComment
              };

              vibrate([30, 50, 30, 50, 30]);
              setNotification(`+${returnAmount} ₽ от ${contactName}`);
              setTimeout(() => setNotification(null), 4000);

              return {
                ...current,
                balance: current.balance + returnAmount,
                transactions: [returnTx, ...current.transactions].slice(0, 100)
              };
            });
          }, delay);
        }

        return {
          ...prev,
          balance: prev.balance - amount,
          transactions: [newTx, ...prev.transactions].slice(0, 100),
          recentContacts: newRecentContacts
        };
      }
      return prev;
    });
  }, []);

  const getCost = useCallback((itemId: string) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return 0;
    const currentCount = state.inventory[itemId] || 0;
    return Math.floor(item.basePrice * Math.pow(1.15, currentCount));
  }, [state.inventory]);

  const buySkin = useCallback((skinId: string) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin) return;

    setState(prev => {
      if (prev.ownedSkins.includes(skinId)) return prev;
      if (prev.balance >= skin.price) {
        vibrate([20, 50, 20]);
        const newTx: Transaction = {
          id: Date.now().toString() + Math.random(),
          type: 'purchase',
          amount: -skin.price,
          title: `Покупка скина: ${skin.name}`,
          date: Date.now()
        };

        setNotification(`Скин куплен: ${skin.name}`);
        setTimeout(() => setNotification(null), 3000);

        return {
          ...prev,
          balance: prev.balance - skin.price,
          ownedSkins: [...prev.ownedSkins, skinId],
          currentSkin: skinId,
          transactions: [newTx, ...prev.transactions].slice(0, 100)
        };
      }
      return prev;
    });
  }, []);

  const equipSkin = useCallback((skinId: string) => {
    vibrate(10);
    setState(prev => {
      if (prev.ownedSkins.includes(skinId)) {
        return { ...prev, currentSkin: skinId };
      }
      return prev;
    });
  }, []);

  return { state, click, buyItem, getCost, transferMoney, buySkin, equipSkin, notification };
}
