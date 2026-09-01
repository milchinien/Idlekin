import type { Area, CharacterSnapshot, PlayerSnapshot } from '@idlekin/shared';
export interface ClientState { status: string; latency: number; player?: PlayerSnapshot; character?: CharacterSnapshot; area?: Area }
class Store {
  state: ClientState = { status: 'getrennt', latency: 0 };
  private listeners = new Set<(state: ClientState) => void>();
  patch(value: Partial<ClientState>) { this.state = { ...this.state, ...value }; for (const listener of this.listeners) listener(this.state); }
  subscribe(listener: (state: ClientState) => void) { this.listeners.add(listener); listener(this.state); return () => this.listeners.delete(listener); }
}
export const store = new Store();
