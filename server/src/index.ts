import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport"; // registers GoogleStrategy

dotenv.config();

const app = express();

// Middleware
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// Session (required for Passport to maintain login state)
const SESSION_SECRET = process.env.SESSION_SECRET || "change_this_in_production";
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Initialize passport AFTER session middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
import authRoutes from "./routes/authRoutes";
import cvRoutes from "./routes/cvRoutes";
import aiRoutes from "./routes/aiRoutes";

app.use("/auth", authRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/ai", aiRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "AI CV Generator API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
