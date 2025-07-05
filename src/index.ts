import cors from "cors";
import express from "express";
import shortenRouter from "./routes/shorten";
import AppError from "./utils/app-error";
import { globalErrorHandler } from "./utils/error-handler";

const app = express();

// CORS
app.use(cors());

// RATE LIMITING

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
const port = 8000;
app.listen(port, () => {
  console.log(`Server started ${port} 🖐`);
});
