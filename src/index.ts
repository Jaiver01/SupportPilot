import "dotenv/config";
import { createApp } from "./app.js";
import { getConfig } from "./config.js";

const config = getConfig();
const app = createApp();

app
  .listen({ port: config.PORT, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`Support Pilot API listening on ${config.PORT}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
