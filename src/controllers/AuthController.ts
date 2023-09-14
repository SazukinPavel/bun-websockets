import { Controller, Route } from "../decorators";
import { BaseController } from "../types/BaseController";

@Controller("auth")
class AuthController extends BaseController {
  @Route({ method: "post", path: "login" })
  async login(req: Request) {
    const data = await req.json();
    if (!data.username) {
      return new Response("Bad username", { status: 400 });
    }

    const { username } = data;

    const token = await this.app.jwtService.sign({ username });

    return Response.json({ token }, { status: 200 });
  }
}

export default AuthController