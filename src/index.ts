import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import shortenRouter from "./routes/shorten";
import AppError from "./utils/app-error";
import { globalErrorHandler } from "./utils/error-handler";

dotenv.config({ path: "/.env" });
const app = express();

// CORS
app.use(cors());

// RATE LIMITING
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many requests, please try again after an hour.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req, res, _next, options) =>
    res.status(options.statusCode).json({
      status: "error",
      message: options.message,
    }),
  // store: ... , // Redis, Memcached, etc. See below.
});
app.use("/api", apiLimiter);

// BODY PARSER
app.use(express.json());

// ROUTES
app.use("/api/shorten", shortenRouter);

// UNHANDLED ROUTES
app.use((req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

// Create a server on 127.0.0.1:8000
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started ${port} 🖐`);
});
