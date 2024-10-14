import app from "./app.js"; // Import your Express app
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;
const DB_STRING = process.env.DB_STRING?.replace("<db_password>", process.env.DB_PASSWORD);

if (!DB_STRING) {
  console.error("Database connection string must be set.");
  process.exit(1);
}

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
  const server = app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down...`);
    server.close(async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  };

  // Handle termination signals
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  // Handle unhandled promise rejections and uncaught exceptions
  process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
    gracefulShutdown("Unhandled promise rejection");
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    gracefulShutdown("Uncaught exception");
  });
};

// Start the application
startServer();
