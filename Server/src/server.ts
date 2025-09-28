import mongoose from "mongoose";
import app, { bot } from "./app";
import "dotenv/config";

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    const port = process.env.PORT || 3000;

    app.listen(port, async () => {
      console.log(`🚀 Server is running on port ${port}`);

      if (process.env.SERVER_URL?.includes("localhost")) {
        // 👉 Local dev: use polling instead of webhook
        console.log("Running locally - starting bot in polling mode");
        await bot.launch();
      } else if (process.env.SERVER_URL) {
        // 👉 Production: use webhook
        const webhookUrl = `${process.env.SERVER_URL}/api/bot`;
        try {
          await bot.telegram.setWebhook(webhookUrl);
          console.log(
            `Webhook set successfully: https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook?url=${webhookUrl}`
          );
        } catch (err) {
          console.error("❌ Error setting webhook:", err);
        }
      }
    });

    // Handle graceful shutdown
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  } catch (err) {
    console.error("❌ Error starting server:", err);
  }
}

main();
