import "./style.css";
import { setupDiscordSdk } from "./authentication.js";

// Set up the Discord SDK and authenticate the user
const { discordSdk, auth } = await setupDiscordSdk();
// Get the app element
const app = document.querySelector("#app");