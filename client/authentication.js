import { DiscordSDK } from "@discord/embedded-app-sdk";

/**
 * @typedef {Object} AuthResult
 * @property {DiscordSDK} discordSdk
 * @property {{
*   access_token: string;
*   user: {
*     username: string;
*     discriminator: string;
*     id: string;
*     public_flags: number;
*     avatar?: string | null | undefined;
*     global_name?: string | null | undefined;
*   };
*   scopes: (
*     -1 | "identify" | "email" | "connections" | "guilds" | "guilds.join" | "guilds.members.read" | "gdm.join" | "rpc" | "rpc.notifications.read" | "rpc.voice.read" | "rpc.voice.write" | "rpc.video.read" | "rpc.video.write" | "rpc.screenshare.read" | "rpc.screenshare.write" | "rpc.activities.write" | "bot" | "webhook.incoming" | "messages.read" | "applications.builds.upload" | "applications.builds.read" | "applications.commands" | "applications.commands.update" | "applications.commands.permissions.update" | "applications.store.update" | "applications.entitlements" | "activities.read" | "activities.write" | "relationships.read" | "voice" | "dm_channels.read" | "role_connections.write"
*   )[];
*   expires: string;
*   application: {
*     id: string;
*     description: string;
*     name: string;
*     icon?: string | null | undefined;
*     rpc_origins?: string[] | undefined;
*   };
* }} auth
*/

/**
* @returns {Promise<AuthResult>}
*/
export async function setupDiscordSdk() {
  const app = document.querySelector("#app");
  app.innerHTML = `
<div>
  <h1>Authenticating...</h1>
    <div id="loading-bar-container">
    <div id="loading-bar" style="width: 0%"></div>
  </div>
</div>`;
  const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
  // Set the loading bar to 0%
  const progress_bar = app.querySelector("#loading-bar");
  progress_bar.style.width = "0%";
  // Wait for the discord sdk to be ready
  await discordSdk.ready();
  // Increase progress bar
  progress_bar.style.width = "20%";  
  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify"
    ],
  });
  // Increase progress bar
  progress_bar.style.width = "60%";
  // Retrieve an access_token from your activity's server
  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });
  const { access_token } = await response.json();
  // Increase progress bar
  progress_bar.style.width = "80%";
  // Authenticate with the access_token
  const auth = await discordSdk.commands.authenticate({
    access_token,
  });
  // Increase progress bar

  progress_bar.style.width = "95%";
  if (auth == null) {
    app.querySelector("h1").innerText = "Authentication error";
    throw new Error("Authenticate command failed");
  }

  progress_bar.style.width = "100%";

  // wait 0.15 seconds because it's weird to see the bar disappear before the animation finishes
  await new Promise(resolve => setTimeout(resolve, 150));
  app.innerHTML = '<div></div>'

  return { discordSdk, auth };
}