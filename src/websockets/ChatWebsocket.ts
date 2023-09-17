import { ServerWebSocket } from "bun";
import { WebSocketData } from "../types";
import { BaseWebsocket } from "../types/BaseWebsocket";

class ChatWebsocket extends BaseWebsocket<WebSocketData> {
  async message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
    const { topic } = ws.data;

    ws.publish(topic, message, true);
  }

  async close(ws: ServerWebSocket<WebSocketData>) {
    const {
      topic,
      user: { username },
    } = ws.data;

    ws.publish(topic, `${username} leave chat`, true);
  }

  async open(ws: ServerWebSocket<WebSocketData>) {
    try {
      const {
        topic,
        user: { username },
      } = ws.data;

      ws.subscribe(topic);
      ws.publish(topic, `${username} join chat`, true);
    } catch (e) {
      ws.close(1011, "You not authorized");
    }
  }
}

export default ChatWebsocket;
