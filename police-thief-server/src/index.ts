import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { setupWebSocketServer } from "./rooms/FpsRoom";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", game: "Police vs Thief FPS" });
});

app.use(express.static(path.join(__dirname, "../../playcanvas-client")));

const server = http.createServer(app);
setupWebSocketServer(server);

server.listen(2567, () => {
  console.log("Police vs Thief server running on http://localhost:2567");
  console.log("WebSocket at ws://localhost:2567/fps_room");
});
