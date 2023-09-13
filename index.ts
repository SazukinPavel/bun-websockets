import JwtService from "./services/JwtService";

type WebSocketData = {
  token: string;
};

type JwtPayload = {
  username: string;
};

Bun.serve<WebSocketData>({
  port: 3000,
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/login") {
      const data = await req.json();
      if (!data.username) {
        return new Response("Bad username", { status: 400 });
      }

      const { username } = data;

      const token = await new JwtService<JwtPayload>().sign({ username });

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
  },
  websocket: {
    async message(ws, message) {
      const { username } = await new JwtService<JwtPayload>().verify(
        ws.data.token
      );

      ws.send(`User ${username} Message ${message}`);
    },
    async open(ws) {
      try {
        if (!ws.data.token) {
        }
        const { username } = await new JwtService<JwtPayload>().verify(
          ws.data.token
        );

        ws.send(`Hello ${username}`);
      } catch {
        ws.close(1011, "You not authorized");
      }
    },
    close(ws, code, message) {
      console.log("socket close");
    },
  },
});
