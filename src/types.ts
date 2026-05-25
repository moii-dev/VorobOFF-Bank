export interface Transaction {
  id: string;
  type: 'transfer' | 'purchase' | 'random' | 'income' | 'dep';
  amount: number;
  title: string;
  date: number;
  comment?: string;
}

export interface DepGameResult {
  bet: number;
  payout: number;
  isWin: boolean;
  winChance: number;
  totalSlots: number;
  winningSlots: number;
  losingSlots: number;
  resultSlotIndex: number;
  resultSlotCenterAngle: number;
  ratingPenalty: number;
  partyMessage: string;
  balanceChange: number;
}

export interface Skin {
  id: string;
  name: string;
  price: number;
  avatarUrl: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
}

export interface PartyDemand {
  itemId: string;
  expiresAt: number;
}

export interface GameState {
  balance: number;
  clickPower: number;
  passiveIncome: number;
  inventory: Record<string, number>;
  transactions: Transaction[];
  ownedSkins: string[];
  currentSkin: string;
  recentContacts: Contact[];
  socialCredit: number;
  catWives: number;
  riceBowls: number;
  partyDemand?: PartyDemand | null;
  language: 'ru' | 'zh';
  isGameOver: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  type: 'passive' | 'click';
  value: number;
  icon: string;
  category: 'food' | 'drinks' | 'tech' | 'misc';
}

export interface AppNotification {
  message: string;
  comment?: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'mcd' | 'vkusn' | 'party' | 'transfer';
}
