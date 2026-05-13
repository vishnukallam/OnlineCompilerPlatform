
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const path = require("path");
const fs = require("fs-extra");

const { executeJava, executePython, installPipModule } = require("./execution");

const app = express();
const server = http.createServer(app);

/* -------------------- FILE STORAGE SETUP -------------------- */

const STORAGE_DIR = path.join(__dirname, "temp"); // Reuse temp as persistent storage
fs.ensureDirSync(STORAGE_DIR);



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
        const pythonWrapper = `
import sys
import base64
import io

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    
    def _custom_show(*args, **kwargs):
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        b64 = base64.b64encode(buf.read()).decode('utf-8')
        print("\\nVISUAL_OUTPUT:" + b64 + "END_VISUAL_OUTPUT\\n", flush=True)
        plt.clf()

    plt.show = _custom_show
except Exception as e:
    print(f"DEBUG: Matplotlib patch failed: {e}", file=sys.stderr)

try:
    import plotly.io as pio
    
    def _custom_plotly_show(*args, **kwargs):
        try:
            fig = args[0]
            html_str = pio.to_html(fig, include_plotlyjs="cdn", full_html=True)
            b64 = base64.b64encode(html_str.encode('utf-8')).decode('utf-8')
            print("\\nVISUAL_OUTPUT:HTML:" + b64 + "END_VISUAL_OUTPUT\\n", flush=True)
        except Exception as e:
            print(f"DEBUG: Plotly show failed: {e}", file=sys.stderr)

    pio.show = _custom_plotly_show
except Exception as e:
    print(f"DEBUG: Plotly patch failed: {e}", file=sys.stderr)

` + code;

        currentProcess = await executePython(pythonWrapper, {
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

  /* ---------- PIP INSTALL ---------- */

  socket.on("install-pip", async (moduleName) => {
    const onOutput = (data) => socket.emit("stdout", data);
    const onError = (data) => socket.emit("stderr", data);
    const onStatus = (status) => socket.emit("status", status);

    try {
      const success = await installPipModule(moduleName, { onOutput, onError, onStatus });
      if (success) {
        onOutput(`\r\nSuccessfully installed ${moduleName}\r\n`);
        try {
          const dockerfilePath = path.join(__dirname, 'Dockerfile');
          const content = await fs.readFile(dockerfilePath, 'utf8');
          const lines = content.split('\n');
          const verifyIndex = lines.findIndex(l => l.includes('# Verify packages using venv python directly'));
          if (verifyIndex !== -1) {
            let lastPkgLineIdx = verifyIndex - 1;
            while(lastPkgLineIdx > 0 && lines[lastPkgLineIdx].trim() === '') {
              lastPkgLineIdx--;
            }
            if (!lines[lastPkgLineIdx].includes(moduleName)) {
              lines[lastPkgLineIdx] += ' \\';
              lines.splice(lastPkgLineIdx + 1, 0, '    ' + moduleName);
              await fs.writeFile(dockerfilePath, lines.join('\n'), 'utf8');
              onOutput(`\r\nUpdated Dockerfile with ${moduleName}\r\n`);
            }
          }
        } catch(e) {
          onError(`\r\nFailed to update Dockerfile: ${e.message}\r\n`);
        }
      } else {
        onError(`\r\nFailed to install ${moduleName}\r\n`);
      }
    } catch (e) {
      onError(`\r\nInstallation error: ${e.message}\r\n`);
    }
    socket.emit("pip-installed");
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
