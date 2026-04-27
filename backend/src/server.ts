import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";

import routes from "./routes/matchRoutes";
import { initSocket } from "./sockets/socket";
import { updateMatches, setSocket } from "./jobs/updateMatches";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Football Analytics API", status: "running" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

// Socket
const io = initSocket(server);
setSocket(io);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});