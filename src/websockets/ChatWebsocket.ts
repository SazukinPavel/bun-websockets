import { ServerWebSocket } from "bun";
import { WebSocketData } from "../types";
import { BaseWebsocket } from "../types/BaseWebsocket";

class ChatWebsocket extends BaseWebsocket<WebSocketData> {
  async message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
    const { topic } = ws.data;

    ws.publish(topic, message);
  }

  async close(ws: ServerWebSocket<WebSocketData>) {
    const { username } = await this.app.jwtService.verify(ws.data.token);
    const { topic } = ws.data;

    ws.publish(topic, `${username} leave chat`);
  }

  async open(ws: ServerWebSocket<WebSocketData>) {
    try {
      if (!ws.data.token) {
        throw new Error();
      }
      const { username } = await this.app.jwtService.verify(ws.data.token);
      const { topic } = ws.data;

      ws.subscribe(topic);
      ws.publish(topic, `${username} join chat`);
    } catch (e) {
      ws.close(1011, "You not authorized");
    }
  }
}

export default ChatWebsocket;
