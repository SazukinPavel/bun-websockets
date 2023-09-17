import { Serve, Server, WebSocketHandler } from "bun";
import JwtService from "./services/JwtService";
import { RouteOptions, UserJwtPayload, WebSocketData } from "./types";
import { AuthController, ChatController } from "./controllers";
import { BaseController } from "./types/BaseController";
import ChatWebsocket from "./websockets/ChatWebsocket";
import { BaseWebsocket } from "./types/BaseWebsocket";

export default class App {
  private serverOptions: Serve<WebSocketData>;
  private controllers: BaseController[];
  private websocket: BaseWebsocket<WebSocketData>;

  public jwtService: JwtService<UserJwtPayload>;

  constructor() {
    this.jwtService = new JwtService();
    this.controllers = [new AuthController(this), new ChatController(this)];
    this.websocket = new ChatWebsocket(this);

    this.serverOptions = {
      port: process.env.PORT,
      fetch: this.fetch.bind(this),
      websocket: this.getWebsocketMethods(),
    };
  }

  private getWebsocketMethods(): WebSocketHandler<WebSocketData> {
    return {
      message: this.websocket.message.bind(this.websocket),
      close: this.websocket.close.bind(this.websocket),
      open: this.websocket.open.bind(this.websocket),
      publishToSelf: true,
      perMessageDeflate: true,
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

  start() {
    return Bun.serve(this.serverOptions);
  }
}
