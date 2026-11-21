require("dotenv").config();

const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Render sits behind a proxy, so this lets us see each visitor's real IP
app.set("trust proxy", 1);

app.use(express.json({ limit: "20kb" }));

// Limit 1: each visitor (IP) can send at most 3 orders per 10 minutes
const perVisitorLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many orders. Please try again in a few minutes." }
});

// Limit 2: the whole website can send at most 30 orders per hour
// (protects your Telegram bot even if spam comes from many IPs)
const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: () => "all-visitors",
  message: { error: "Orders are temporarily unavailable. Please try again later." }
});

// Receive an order from the checkout page
app.post("/api/orders", perVisitorLimiter, globalLimiter, async (req, res) => {
  const message = req.body?.message;

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 4000
  ) {
    return res.status(400).json({
      error: "Invalid order message."
    });
  }

  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    console.error("Missing Telegram environment variables.");

    return res.status(500).json({
      error: "Order notification is not configured."
    });
  }

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    const result = await telegramResponse.json();

    if (!telegramResponse.ok || !result.ok) {
      console.error("Telegram rejected the notification.");

      return res.status(502).json({
        error: "Telegram could not deliver the order."
      });
    }

    return res.json({
      success: true,
      message: "Order notification sent."
    });

  } catch (error) {
    console.error("Telegram request failed:", error.message);

    return res.status(502).json({
      error: "Could not contact Telegram."
    });
  }
});

// Serve the Handset homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "homePage.html"));
});

// Serve only the public website files (not server.js, package.json, etc.)
app.get("/homePage.html", (req, res) => {
  res.sendFile(path.join(__dirname, "homePage.html"));
});

app.get("/productPage.html", (req, res) => {
  res.sendFile(path.join(__dirname, "productPage.html"));
});

app.get("/checkoutPage.html", (req, res) => {
  res.sendFile(path.join(__dirname, "checkoutPage.html"));
});

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/style", express.static(path.join(__dirname, "style")));
app.use("/script", express.static(path.join(__dirname, "script")));
app.use("/data", express.static(path.join(__dirname, "data")));

app.listen(PORT, () => {
  console.log(`Handset Store running at http://localhost:${PORT}`);
});