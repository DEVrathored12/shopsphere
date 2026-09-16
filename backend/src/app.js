import express from "express";
import cors from "cors";
import helmet from "helmet";

import apiRoutes from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// --- Security & core middleware ---
app.use(helmet());

const clientUrl = process.env.CLIENT_URL;
app.use(
  cors({
    origin: clientUrl || false, // never fall back to a wildcard in production
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rate limiting ---
app.use("/api", apiLimiter);

// --- API routes ---
app.use("/api", apiRoutes);

// --- 404 + centralized error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
