import { ServerWebSocket } from "bun";
import { WebSocketData } from "../types";
import { BaseWebsocket } from "../types/BaseWebsocket";
import { ChatMessage } from "../types/ChatMessage";

class ChatWebsocket extends BaseWebsocket<WebSocketData> {
  async message(ws: ServerWebSocket<WebSocketData>, message: string) {
    const { topic, user } = ws.data;

    const chatMessage = new ChatMessage(message, user);
    this.publishTo(ws, topic, chatMessage);
  }

  async close(ws: ServerWebSocket<WebSocketData>) {
    const {
      topic,
      user: { username },
    } = ws.data;

    const message = new ChatMessage(`${username} leave chat`);

    ws.unsubscribe(topic);
    this.publishTo(ws, topic, message);
  }

  async open(ws: ServerWebSocket<WebSocketData>) {
    try {
      const {
        topic,
        user: { username },
      } = ws.data;

      ws.subscribe(topic);
      const message = new ChatMessage(`${username} join chat`);
      this.publishTo(ws, topic, message);
    } catch (e) {
      ws.close(1011, "You not authorized");
    }
  }

  publishTo(
    ws: ServerWebSocket<WebSocketData>,
    topic: string,
    message: ChatMessage
  ) {
    ws.publish(topic, JSON.stringify(message));
  }
}

export default ChatWebsocket;
