Bun.serve({
  port: 3000,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response("Upgrade failed :(", { status: 500 });
  },
  websocket: {
    message(ws, message) {
      ws.send(`From server ${message}`);
    },
    open(ws) {
      console.log("socket open");
    },
    close(ws, code, message) {
      console.log("socket close");
    },
  },
});
