import { Serve, Server, ServerWebSocket } from "bun";
import JwtService from "./services/JwtService";
import { UserJwtPayload, WebSocketData } from "./types";

export default class App {
  private serverOptions: Serve<WebSocketData>;

  private jwtService: JwtService<UserJwtPayload>;

  constructor() {
    this.jwtService = new JwtService();
    this.serverOptions = {
      port: process.env.PORT,
      fetch: this.fetch.bind(this),
      websocket: {
        message: this.socketMessage.bind(this),
        close: this.socketClose.bind(this),
        open: this.openSocket.bind(this),
      },
    };
  }

  private async fetch(req: Request, server: Server) {
    const url = new URL(req.url);
    if (url.pathname === "/login") {
      const data = await req.json();
      if (!data.username) {
        return new Response("Bad username", { status: 400 });
      }

      const { username } = data;

      const token = await this.jwtService.sign({ username });

      return Response.json({ token }, { status: 200 });
    }
    if (url.pathname === "/chat") {
      if (
        server.upgrade(req, {
          data: {
            token: req.headers.get("X-Token"),
          },
        })
      ) {
        return;
      }
      return new Response("Upgrade failed :(", { status: 500 });
    }
    return new Response("Not Founded", { status: 404 });
  }

  private async openSocket(ws: ServerWebSocket<WebSocketData>) {
    try {
      if (!ws.data.token) {
      }
      const { username } = await this.jwtService.verify(ws.data.token);

      ws.send(`Hello ${username}`);
    } catch {
      ws.close(1011, "You not authorized");
    }
  }

  private async socketClose() {
    console.log("socket close");
  }

  private async socketMessage(
    ws: ServerWebSocket<WebSocketData>,
    message: string
  ) {
    const { username } = await this.jwtService.verify(ws.data.token);

    ws.send(`User ${username} Message ${message}`);
  }

  start() {
    return Bun.serve(this.serverOptions);
  }
}
