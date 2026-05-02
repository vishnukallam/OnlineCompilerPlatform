
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

const { executeJava, executePython } = require("./execution");

const app = express();
const server = http.createServer(app);

/* -------------------- FILE STORAGE SETUP -------------------- */

const STORAGE_DIR = path.join(__dirname, "temp"); // Reuse temp as persistent storage
fs.ensureDirSync(STORAGE_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, STORAGE_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

/* -------------------- CORS CONFIG -------------------- */

const allowedOrigins = [
  "http://localhost:3000",
  "https://code-compiler-sand.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development and specific Vercel URL
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

/* -------------------- SOCKET.IO SETUP -------------------- */

const io = new Server(server, {
  cors: {
    origin: "*", // Socket.io CORS can be more permissive if app CORS is restrictive enough
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

/* -------------------- HEALTH CHECK -------------------- */

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    engine: "Native Java & Python (Socket.io Enabled)"
  });
});

/* -------------------- FILE EXPLORER ROUTES -------------------- */

app.get("/api/files", async (req, res) => {
  try {
    const files = await fs.readdir(STORAGE_DIR);
    const details = await Promise.all(
      files.map(async (file) => {
        const stats = await fs.stat(path.join(STORAGE_DIR, file));
        return {
          name: file,
          size: stats.size,
          mtime: stats.mtime,
          isDir: stats.isDirectory()
        };
      })
    );
    res.json(details.filter(f => !f.isDir));
  } catch (err) {
    res.status(500).json({ error: "Failed to list files" });
  }
});

app.post("/api/files/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ message: "File uploaded successfully", file: req.file.originalname });
});

app.get("/api/files/download/:filename", (req, res) => {
  const filePath = path.join(STORAGE_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

app.delete("/api/files/:filename", async (req, res) => {
  try {
    await fs.remove(path.join(STORAGE_DIR, req.params.filename));
    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file" });
  }
});

app.post("/api/files/save", async (req, res) => {
  const { filename, code } = req.body;
  if (!filename || !code) return res.status(400).json({ error: "Filename and code required" });
  try {
    await fs.writeFile(path.join(STORAGE_DIR, filename), code, 'utf8');
    res.json({ message: "File saved", filename });
  } catch (err) {
    res.status(500).json({ error: "Failed to save file" });
  }
});

/* -------------------- HTTP EXECUTION (LEGACY) -------------------- */

app.post("/api/execute/java", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    const result = await executeJava(code);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------- SOCKET.IO CODE EXECUTION -------------------- */

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  let currentProcess = null;

  socket.on("run-code", async ({ language, code }) => {
    if (!code) {
      socket.emit("error", "No code provided");
      return;
    }

    const onOutput = (data) => socket.emit("stdout", data);
    const onError = (data) => socket.emit("stderr", data);
    const onStatus = (status) => socket.emit("status", status);

    socket.emit("status", "Initializing...");

    try {
      if (language.startsWith("java")) {
        currentProcess = await executeJava(code, {
          onOutput,
          onError,
          onStatus
        }, language);
      }
      else if (language.startsWith("python")) {
        currentProcess = await executePython(code, {
          onOutput,
          onError,
          onStatus
        }, language);
      }
      else {
        socket.emit("stderr", "Unsupported language");
      }

    } catch (err) {
      socket.emit("stderr", `Critical Engine Error: ${err.message}`);
    }
  });

  /* ---------- INPUT FROM TERMINAL ---------- */

  socket.on("input", (data) => {
    if (currentProcess && currentProcess.stdin && !currentProcess.killed) {
      currentProcess.stdin.write(data);
    }
  });

  /* ---------- CLIENT DISCONNECT ---------- */

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    if (currentProcess) {
      currentProcess.kill();
    }
  });
});

/* -------------------- SERVER START -------------------- */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
