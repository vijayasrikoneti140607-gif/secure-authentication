const express = require("express");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
throw new Error("JWT_SECRET must be set to a secret of at least 32 characters.");
}

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));

app.use("/api/auth", rateLimit({
windowMs: 15 * 60 * 1000,
max: 20,
standardHeaders: true,
legacyHeaders: false
}));

const db = new Database(process.env.DB_PATH || "users.db");

db.exec(`  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

const createUser = db.prepare(
"INSERT INTO users (username, password_hash) VALUES (?, ?)"
);

const findUser = db.prepare(
"SELECT id, username, password_hash FROM users WHERE username = ?"
);

const findUserById = db.prepare(
"SELECT id, username FROM users WHERE id = ?"
);

function authenticateToken(req, res, next) {
const header = req.headers.authorization;
const token = header && header.startsWith("Bearer ")
? header.slice(7)
: null;

if (!token) {
return res.status(401).json({ error: "Authentication required." });
}

try {
req.user = jwt.verify(token, JWT_SECRET);
next();
} catch {
return res.status(401).json({ error: "Invalid or expired token." });
}
}

app.get("/", (req, res) => {
res.json({
message: "Secure Authentication API",
endpoints: [
"POST /api/auth/register",
"POST /api/auth/login",
"GET /api/auth/me"
]
});
});

app.post("/api/auth/register", async (req, res) => {
const { username, password } = req.body || {};

if (
typeof username !== "string" ||
typeof password !== "string" ||
!/^[a-zA-Z0-9_]{3,30}$/.test(username) ||
password.length < 12 ||
Buffer.byteLength(password, "utf8") > 72
) {
return res.status(400).json({
error: "Username must be 3–30 letters, numbers or underscores. Password must be 12–72 UTF-8 bytes."
});
}

try {
const passwordHash = await bcrypt.hash(password, 12);
const result = createUser.run(username, passwordHash);

```
return res.status(201).json({
  message: "Registration successful.",
  user: { id: Number(result.lastInsertRowid), username }
});
```

} catch (error) {
if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
return res.status(409).json({ error: "Username already exists." });
}

```
console.error("Registration failed:", error.message);
return res.status(500).json({ error: "Unable to register user." });
```

}
});

app.post("/api/auth/login", async (req, res) => {
const { username, password } = req.body || {};

if (
typeof username !== "string" ||
typeof password !== "string" ||
username.length > 30 ||
Buffer.byteLength(password, "utf8") > 72
) {
return res.status(400).json({ error: "Valid username and password are required." });
}

try {
const user = findUser.get(username);

```
if (!user || !(await bcrypt.compare(password, user.password_hash))) {
  return res.status(401).json({ error: "Invalid username or password." });
}

const token = jwt.sign(
  { sub: String(user.id), username: user.username },
  JWT_SECRET,
  { expiresIn: "1h", algorithm: "HS256" }
);

return res.json({
  message: "Login successful.",
  token,
  expiresIn: 3600
});
```

} catch (error) {
console.error("Login failed:", error.message);
return res.status(500).json({ error: "Unable to log in." });
}
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
const user = findUserById.get(Number(req.user.sub));

if (!user) {
return res.status(401).json({ error: "User no longer exists." });
}

return res.json({ user });
});

app.use((err, req, res, next) => {
if (err instanceof SyntaxError && "body" in err) {
return res.status(400).json({ error: "Invalid JSON request body." });
}

console.error("Unexpected error:", err.message);
return res.status(500).json({ error: "Internal server error." });
});

const server = app.listen(PORT, () => {
console.log(`Authentication API listening on port ${PORT}`);
});

function shutdown() {
server.close(() => {
db.close();
process.exit(0);
});
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
