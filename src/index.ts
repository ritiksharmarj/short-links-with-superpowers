import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("hello India 🇮🇳");
});

app.get("/:shortCode", (req, res) => {
  const { shortCode } = req.params;

  res.status(200).send(shortCode);
});

// Create a server on 127.0.0.1:8000
const port = 8000;
app.listen(port, () => {
  console.log(`Server started ${port} 🖐`);
});
