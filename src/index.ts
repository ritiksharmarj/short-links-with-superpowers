import express from "express";
import shortenRouter from "./routes/shorten";

const app = express();

// CORS
// RATE LIMITING

app.use(express.json());

// ROUTES
app.use("/api/shorten", shortenRouter);

// // UNHANDLED ROUTES
// app.all("*", (req, res) => {
//   res.status(404).json({
//     status: "error",
//     message: `Route ${req.originalUrl} not found`,
//   });
// });

// Create a server on 127.0.0.1:8000
const port = 8000;
app.listen(port, () => {
  console.log(`Server started ${port} 🖐`);
});
