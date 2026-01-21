import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscribers = {
      created: [],
      updated: [],
      deleted: [],
    };
  }

  connect(onConnect) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected');
        this.subscribeToTopics();
        if (onConnect) onConnect();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    this.client.activate();
  }

  subscribeToTopics() {
    // Подписка на создание работников
    this.client.subscribe('/topic/workers/created', (message) => {
      const worker = JSON.parse(message.body);
      this.notifySubscribers('created', worker);
    });

    // Подписка на обновление работников
    this.client.subscribe('/topic/workers/updated', (message) => {
      const worker = JSON.parse(message.body);
      this.notifySubscribers('updated', worker);
    });

    // Подписка на удаление работников
    this.client.subscribe('/topic/workers/deleted', (message) => {
      const workerId = JSON.parse(message.body);
      this.notifySubscribers('deleted', workerId);
    });
  }

  onWorkerCreated(callback) {
    this.subscribers.created.push(callback);
    return () => {
      this.subscribers.created = this.subscribers.created.filter(cb => cb !== callback);
    };
  }

  onWorkerUpdated(callback) {
    this.subscribers.updated.push(callback);
    return () => {
      this.subscribers.updated = this.subscribers.updated.filter(cb => cb !== callback);
    };
  }

  onWorkerDeleted(callback) {
    this.subscribers.deleted.push(callback);
    return () => {
      this.subscribers.deleted = this.subscribers.deleted.filter(cb => cb !== callback);
    };
  }

  notifySubscribers(event, data) {
    this.subscribers[event].forEach(callback => callback(data));
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      console.log('WebSocket Disconnected');
    }
  }
}

const websocketServiceInstance = new WebSocketService();
export default websocketServiceInstance;

