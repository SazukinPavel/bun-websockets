import { ServerWebSocket } from "bun";
import { WebSocketData } from "../types";
import { BaseWebsocket } from "../types/BaseWebsocket";

class ChatWebsocket extends BaseWebsocket<WebSocketData> {
  async message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
    const { username } = await this.app.jwtService.verify(ws.data.token);

    ws.send(`User ${username} Message ${message}`);
  }

  close() {
    console.log("socket close");
  }

  async open(ws: ServerWebSocket<WebSocketData>) {
    try {
      if (!ws.data.token) {
      }
      const { username } = await this.app.jwtService.verify(ws.data.token);

      ws.send(`Hello ${username}`);
    } catch (e) {
        console.log(e);
        
      ws.close(1011, "You not authorized");
    }
  }
}

export default ChatWebsocket;
