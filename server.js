import app from "./app.js";
import mongoose from "mongoose";
import { createLogger, transports, format } from "winston"; // For logging



const PORT = process.env.PORT || 3000;

// Replace <db_password> with actual password from environment variable
const DB_STRING = process.env.DB_STRING.replace(
  "<db_password>",
  process.env.DB_PASSWORD
);

// Logger configuration
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" })
  ]
});

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(DB_STRING);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process if there's an error
  }
};

// Start the server
const startServer = async () => {
  await connectDB(); // Ensure MongoDB connection is established

  app.listen(PORT, () => {
    logger.info(`Server is running on PORT ${PORT}`);
  });
};

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  mongoose.connection.close(() => {
    logger.info("MongoDB connection closed.");
    process.exit(0);
  });
};

// Handle process termination signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  logger.error("Unhandled promise rejection:", error);
  gracefulShutdown(); // Call graceful shutdown
});

// Start the application
startServer();
