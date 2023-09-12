import { SignJWT, jwtVerify } from "jose";

type WebSocketData = {
  token: string;
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

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const alg = "HS256";

      const token = await new SignJWT({ username })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer(process.env.JWT_ISSUER!)
        .setAudience(process.env.JWT_AUDIENCE!)
        .setExpirationTime("24h")
        .sign(secret);

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
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const {
        payload: { username },
      } = await jwtVerify(ws.data.token, secret, {
        issuer: process.env.JWT_ISSUER!,
        audience: process.env.JWT_AUDIENCE!,
      });

      ws.send(`User ${username} Message ${message}`);
    },
    open(ws) {
      console.log("socket open");
    },
    close(ws, code, message) {
      console.log("socket close");
    },
  },
});
