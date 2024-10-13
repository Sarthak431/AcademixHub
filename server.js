import app from "./app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;

const DB_STRING = process.env.DB_STRING.replace("<db_password>", process.env.DB_PASSWORD);

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(DB_STRING);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down...`);
  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
};

// Handle termination signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  gracefulShutdown("Unhandled promise rejection");
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  gracefulShutdown("Uncaught exception");
});

// Start the application
startServer();
