import { Serve, Server, ServerWebSocket } from "bun";
import JwtService from "./services/JwtService";
import { RouteOptions, UserJwtPayload, WebSocketData } from "./types";
import { AuthController, ChatController } from "./controllers";
import { BaseController } from "./types/BaseController";

export default class App {
  private serverOptions: Serve<WebSocketData>;
  private controllers: BaseController[];

  public jwtService: JwtService<UserJwtPayload>;

  constructor() {
    this.jwtService = new JwtService();
    this.controllers = [new AuthController(this), new ChatController(this)];
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
    type r = RouteOptions & { controller: BaseController; methodName: string };
    let paths: r[] = [];
    this.controllers.forEach((c) => {
      const basepath = Reflect.getMetadata(
        "controller-metadata",
        c.constructor
      );

      for (const propertyName of Object.getOwnPropertyNames(
        c.constructor.prototype
      )) {
        if (typeof c.constructor.prototype[propertyName] === "function") {
          const routeData: RouteOptions | undefined = Reflect.getMetadata(
            "route-metadata",
            c.constructor.prototype,
            propertyName
          );
          if (routeData) {
            const { method, path } = routeData;
            paths.push({
              method,
              path: [basepath, path].join("/"),
              controller: c,
              methodName: propertyName,
            });
          }
        }
      }
    });

    paths = paths
      .sort((a, b) => a.path.localeCompare(b.path))
      .map((r) => {
        if (!r.path.startsWith("/")) {
          r.path = "/" + r.path;
        }

        if (r.path.endsWith("/")) {
          r.path = r.path.slice(0, r.path.length - 1);
        }

        r.path = r.path.replaceAll(/\/+/g, "/");

        return r;
      });
    let response: null | Promise<any> | any = null;
    paths.forEach((route) => {
      if (
        url.pathname === route.path &&
        (route.method === "any" || route.method === req.method.toLowerCase())
      ) {
        // @ts-ignore
        response = route.controller[route.methodName](req, server);
      }
    });

    if (response instanceof Promise) {
      return await response;
    } else if (response) {
      return response;
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
