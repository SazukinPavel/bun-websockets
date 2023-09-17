import App from "../main";

export abstract class BaseController {
  protected app: App;

  constructor(app: App) {
    this.app = app;
  }
}