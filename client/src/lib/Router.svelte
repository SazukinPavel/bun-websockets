<script>
  import { Router, Route } from "svelte-routing";
  import Login from "../views/Login.svelte";
  import Chat from "../views/Chat.svelte";
</script>

<main>
  <Router>
    <Route path="/chat">
      <Chat />
    </Route>
    <Route path="/">
      <Login />
    </Route>
  </Router>
</main>
