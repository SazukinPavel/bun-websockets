import { Server } from "bun";
import { BaseController } from "../types/BaseController";
import { Controller, Route } from "../decorators";
import { WebSocketData } from "../types";

@Controller("chat")
class ChatController extends BaseController {
  @Route()
  async chat(req: Request, server: Server) {
    try{
      const data: WebSocketData = {
        token: req.headers.get("X-Token")!,
        topic: new URL(req.url).searchParams.get("topic") || "all",
      };
  
      if (server.upgrade(req, { data })) {
        return;
      }
    }finally{
      return new Response("Upgrade failed :(", { status: 500 });
    }
  }
}

export default ChatController;
