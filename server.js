const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// 🔒 Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync("users.json", "utf8"));

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// 🟢 Serve dashboard page
app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// 🟢 Upload route (with unique naming and folders)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  const folder = req.body.folder || "root";
  const name = req.body.name;
  const file = req.file;

  if (!file || !name) {
    return res.status(400).json({ message: "File and name are required." });
  }

  const folderPath = path.join(__dirname, "uploads", folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const filePath = path.join(folderPath, name);

  // Check if file already exists to enforce unique naming
  if (fs.existsSync(filePath)) {
    return res.status(400).json({ message: "File with that name already exists." });
  }

  fs.writeFile(filePath, file.buffer, (err) => {
    if (err) {
      console.error("Error saving file:", err);
      return res.status(500).json({ message: "Error saving file." });
    }

    res.json({ message: "File uploaded successfully!" });
  });
});

// 🟢 List all files (recursively) from uploads folder
app.get("/files", (req, res) => {
  const allFiles = [];

  function readFilesRecursively(folderPath) {
    const items = fs.readdirSync(folderPath);

    for (const item of items) {
      const fullPath = path.join(folderPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        readFilesRecursively(fullPath);
      } else {
        allFiles.push(path.relative(path.join(__dirname, "uploads"), fullPath));
      }
    }
  }

  readFilesRecursively(path.join(__dirname, "uploads"));
  res.json(allFiles);
});

// 🟡 Rename file or folder route
app.post("/rename", (req, res) => {
  const { type, oldName, newName, folder = "root" } = req.body;
  const basePath = path.join(__dirname, "uploads", folder);
  const oldPath = path.join(basePath, oldName);
  const newPath = path.join(basePath, newName);

  if (!fs.existsSync(oldPath)) {
    return res.status(404).json({ error: `${type} not found` });
  }

  if (fs.existsSync(newPath)) {
    return res.status(400).json({ error: `New ${type} name already exists` });
  }

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Rename failed" });
    }
    res.json({ message: `${type} renamed successfully` });
  });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
