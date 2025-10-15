import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import { setIO } from "./realtime/io.js";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import session from "express-session";

// Routes
import catalogueRoutes from "./routes/catalogueRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import financeIncomeRoutes from "./routes/financeIncomeRoutes.js";
import financeExpenseRoutes from "./routes/financeExpenseRoutes.js";
import archiveRoutes from "./routes/archiveRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import inventoryRoutes from "./routes/InventoryRoutes.js";
import supplierRoutes from "./routes/SupplierRoutes.js";
import purchaseOrderRoutes from "./routes/PurchaseOrderRoutes.js";
import dashboardRoutes from "./routes/InvenDashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { requireAuth, requireRole, requireAnyStaff } from "./middleware/authz.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import JobProgressRoutes from "./routes/JobProgressRoutes.js";

// Middleware
import ratelimiter from "./middleware/rateLimiter.js";
import upload from "./middleware/multer.js";

// Database connection
import connectDB from "./config/db.js";
import { initializeAppointmentScheduler } from "./utils/appointmentScheduler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});
setIO(io);
const PORT = process.env.PORT || 5001;


app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // frontend URLs
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);


app.options("*", cors());


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 
    },
  })
);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method !== "GET") {
    console.log("Body:", req.body);
  }
  if (Object.keys(req.query).length > 0) {
    console.log("Query params:", req.query);
  }
  next();
});

//Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

//API Routes
// Authentication and User routes
app.use("/api/auth", authRoutes);
app.use("/api/users", requireRole('admin', 'receptionist'), userRoutes);

// Vehicle routes
app.use("/api/vehicles", vehicleRoutes);

// Package and Appointment routes with rate limiting
app.use("/api/packages", ratelimiter, catalogueRoutes);
app.use("/api/appointments", ratelimiter, appointmentRoutes);

//Job Progress routes

app.use("/api/jobs", JobProgressRoutes); 
app.use("/api/jobs/staff", JobProgressRoutes);
// Payment routes
app.use("/api/payment", paymentRoutes);

// Finance routes
app.use("/api/finance-income", requireRole('finance_manager','admin'), financeIncomeRoutes);
app.use("/api/finance-expenses", requireRole('finance_manager','admin'), financeExpenseRoutes);
app.use("/api/finance-archives", archiveRoutes);

// Inventory routes
app.use("/inventory", requireRole('inventory_manager','admin'), inventoryRoutes);
app.use("/suppliers", requireRole('inventory_manager','admin'), supplierRoutes);
app.use("/orders", requireRole('inventory_manager','admin'), purchaseOrderRoutes);
app.use("/dashboard", requireAnyStaff, dashboardRoutes);
app.use("/api/dashboard", dashboardRoutes);

//File upload 
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      message: "File uploaded successfully",
      file: req.file,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});


app.get("/health", (req, res) => {
  const dbState =
    mongoose.connection?.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: dbState,
    uptime: process.uptime(),
  });
});


app.get("/", (req, res) => {
  res.json({
    message: "AutoCare Service Management API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      vehicles: "/api/vehicles",
      packages: "/api/packages",
      appointments: "/api/appointments",
      payment: "/api/payment",
      financeIncome: "/api/finance-income",
      financeExpenses: "/api/finance-expenses",
      financeArchives: "/api/finance-archives",
      inventory: "/inventory",
      suppliers: "/suppliers",
      orders: "/orders",
      dashboard: "/dashboard",
      upload: "/api/upload",
      health: "/health",
    },
  });
});


app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});


app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});


io.on("connection", (socket) => {
  socket.on("register", (data) => {
    const customerId = data?.customerId;
    if (customerId) {
      socket.join(`customer:${customerId}`);
    }
  });
});

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(` ✅ Server running on port ${PORT}`);
      console.log(`🌍 Base URL: http://localhost:${PORT} `);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(` 📊 Database: Connected         `);
      
      // Initialize appointment scheduler after DB connection
      initializeAppointmentScheduler();
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  });

// shutdown 
process.on("SIGINT", async () => {
  console.log("\n🛑 SIGINT received. Shutting down gracefully...");
  try {
    await mongoose.connection.close();
    console.log("📡 MongoDB connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM received. Shutting down gracefully...");
  try {
    await mongoose.connection.close();
    console.log("📡 MongoDB connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Promise Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

export default app;