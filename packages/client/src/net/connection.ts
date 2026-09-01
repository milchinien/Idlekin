import type { ClientMessage, ServerMessage } from '@idlekin/shared';
import { store } from './store.js';

type Handler = (message: ServerMessage) => void;
export class Connection {
  private socket?: WebSocket; private token = ''; private retry = 250; private queue: ClientMessage[] = []; private handler?: Handler; private pings: number[] = []; private pingTimer?: number;
  onMessage(handler: Handler) { this.handler = handler; }
  connect(token: string) { this.token = token; this.open(); }
  send(message: ClientMessage) { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message)); else this.queue.push(message); }
  private open() {
    store.patch({ status: 'verbinde …' });
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.socket = new WebSocket(`${protocol}//${location.host}/ws`);
    this.socket.addEventListener('open', () => { this.retry = 250; store.patch({ status: 'verbunden' }); this.send({ t: 'auth', token: this.token }); while (this.queue.length) this.send(this.queue.shift()!); this.pingTimer = window.setInterval(() => this.send({ t: 'ping', sent: performance.now() }), 2000); });
    this.socket.addEventListener('message', event => { const message = JSON.parse(String(event.data)) as ServerMessage; if (message.t === 'authFail') this.token = ''; if (message.t === 'pong') { const latency = performance.now() - message.sent; this.pings.push(latency); if (this.pings.length > 5) this.pings.shift(); store.patch({ latency: this.pings.reduce((a, b) => a + b, 0) / this.pings.length }); } this.handler?.(message); });
    this.socket.addEventListener('close', () => { if (this.pingTimer) clearInterval(this.pingTimer); if (!this.token) { store.patch({ status: 'Anmeldung erforderlich' }); return; } store.patch({ status: 'getrennt – neuer Versuch' }); window.setTimeout(() => this.open(), this.retry); this.retry = Math.min(10_000, this.retry * 2); });
  }
}
