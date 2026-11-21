require("dotenv").config();

const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Render sits behind a proxy, so this lets us see each visitor's real IP
app.set("trust proxy", 1);

app.use(express.json({ limit: "20kb" }));

// ---------------------------------------------------------------
// Anti-spam settings
// ---------------------------------------------------------------
// For live client demos you can switch every limit off by adding
// DISABLE_ORDER_LIMITS=true in Render's Environment Variables.
const limitsOff = () => process.env.DISABLE_ORDER_LIMITS === "true";

// Limit 1: one order per visitor (IP) every 15 minutes
const every15Minutes = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1,
  skip: limitsOff,
  skipFailedRequests: true, // failed/invalid orders don't use up the visitor's chance
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "You can place only one order every 15 minutes. Please try again later."
  }
});

// Limit 2: two orders per visitor (IP) per day
const twicePerDay = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 2,
  skip: limitsOff,
  skipFailedRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "You reached the limit of 2 orders per day. Please try again tomorrow."
  }
});

// Limit 3: the whole website can send at most 30 orders per hour
// (protects your Telegram bot even if spam comes from many different IPs)
const globalPerHour = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  skip: limitsOff,
  skipFailedRequests: true,
  keyGenerator: () => "all-visitors",
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Orders are temporarily unavailable. Please try again later."
  }
});

// Limit 4: the whole website can send at most 100 orders per day
const globalPerDay = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 100,
  skip: limitsOff,
  skipFailedRequests: true,
  keyGenerator: () => "all-visitors",
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Orders are temporarily unavailable. Please try again tomorrow."
  }
});

// Block requests that come from other websites (basic protection).
// Browsers always send the Origin header on POST requests, so a request
// from a different site is rejected.
function sameSiteOnly(req, res, next) {
  const origin = req.get("origin");

  if (origin) {
    let originHost;
    try {
      originHost = new URL(origin).host;
    } catch {
      return res.status(403).json({ error: "Request blocked." });
    }

    if (originHost !== req.get("host")) {
      return res.status(403).json({ error: "Request blocked." });
    }
  }

  next();
}

// Block the exact same order message sent again within 1 hour
const recentMessages = new Map();
const DUPLICATE_WINDOW_MS = 60 * 60 * 1000;

function isDuplicate(message) {
  const now = Date.now();

  for (const [text, time] of recentMessages) {
    if (now - time > DUPLICATE_WINDOW_MS) {
      recentMessages.delete(text);
    }
  }

  if (recentMessages.has(message)) {
    return true;
  }

  recentMessages.set(message, now);
  return false;
}

// ---------------------------------------------------------------
// Receive an order from the checkout page
// ---------------------------------------------------------------
app.post(
  "/api/orders",
  sameSiteOnly,
  every15Minutes,
  twicePerDay,
  globalPerHour,
  globalPerDay,
  async (req, res) => {
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

    if (!limitsOff() && isDuplicate(message.trim())) {
      return res.status(429).json({
        error: "This order was already received."
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
  }
);

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