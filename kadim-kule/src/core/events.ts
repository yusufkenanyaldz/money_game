import type { BuffId, Decimal } from './state';

export type HumaReward = 'golge' | 'armagan' | 'firtina';

export type GameEvent =
  | { type: 'tap'; amount: Decimal; crit: boolean }
  | { type: 'tapUpgrade'; level: number }
  | { type: 'circle' }
  | { type: 'buy'; creature: number; amount: number }
  | { type: 'milestone'; creature: number; count: number }
  | { type: 'harmony'; level: number; need: number }
  | { type: 'scroll'; id: string }
  | { type: 'floor'; floor: number }
  | { type: 'humaAppear' }
  | { type: 'humaLeave' }
  | { type: 'humaCatch'; reward: HumaReward; amount?: Decimal }
  | { type: 'buffEnd'; id: BuffId };
