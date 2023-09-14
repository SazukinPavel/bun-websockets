import { Server } from "bun";
import { BaseController } from "../types/BaseController";
import { Controller, Route } from "../decorators";

@Controller("chat")
class ChatController extends BaseController {
  @Route()
  async chat(req: Request, server: Server) {
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
}

export default ChatController