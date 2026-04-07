import { config } from "./config.js";
import express from "express";
import threadRoutes from "./routes/llm-threads.js";

const app = express();
app.use(express.json());
app.use(threadRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
