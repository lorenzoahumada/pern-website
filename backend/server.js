import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

import productRoutes from "./routes/productRoutes.js";
import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.json());
app.use(cors());
app.use(helmet(
  {
    contentSecurityPolicy: false
  }
));
app.use(morgan("dev"));

app.use(async (req, res, next) => {
  try{
    const decision = await aj.protect(req, {
      requested: 1
    });

    if(decision.isDenied()){
      if(decision.reason.isRateLimit()){
        res.status(429).json({success: false, message: "Rate limit exceeded"});
      } else if(decision.reason.isBot()){
        res.status(403).json({success: false, message: "Bots are not allowed"});
      } else {
        res.status(403).json({success: false, message: "You are not allowed"});
      }

      return;
    }

    if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
      res.status(403).json({success: false, message: "Spoofed bot detected"});
      return;
    }

    next();
  } catch (error){}
});

app.use("/api/products", productRoutes);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

async function initDB() {
  try {
    await sql `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Database initialized");
  } catch (e) {
    console.error("Database connection failed");
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });
});
