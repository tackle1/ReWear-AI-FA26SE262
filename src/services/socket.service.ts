import envConfig from '../config/env.config';

type MessageHandler = (data: unknown) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();

  public connect(token?: string): void {
    const url = `${envConfig.wsUrl}${token ? `?token=${token}` : ''}`;
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const eventHandlers = this.handlers.get(payload.event);
        if (eventHandlers) {
          eventHandlers.forEach((handler) => handler(payload.data));
        }
      } catch (err) {
        console.error('WebSocket parse error', err);
      }
    };

    this.socket.onclose = () => {
      // Reconnection logic
    };
  }

  public subscribe(event: string, handler: MessageHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  public unsubscribe(event: string, handler: MessageHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  public emit(event: string, data: unknown): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
