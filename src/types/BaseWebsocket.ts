import { ServerWebSocket } from "bun";
import App from "../main";

export abstract class BaseWebsocket<T> {
  protected app: App;

  constructor(app: App) {
    this.app = app;
  }

  public abstract message(
    ws: ServerWebSocket<T>,
    message: string | Buffer
  ): void | Promise<void>;
  public abstract close(
    ws: ServerWebSocket<T>,
    code: number,
    reason: string
  ): void | Promise<void>;
  public abstract open(ws: ServerWebSocket<T>): void | Promise<void>;
}
