const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

// Load users from JSON
const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));

// File upload config
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, req.body.name + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Handle login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) res.json({ success: true });
  else res.json({ success: false, message: "Invalid credentials" });
});

// Handle file upload
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ message: "✅ File uploaded successfully!" });
});

// Serve file list
app.get("/files", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to list files" });
    res.json(files);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
