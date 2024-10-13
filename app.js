import express from "express";
import globalErrorHandler from "./utils/errorHandler.js";
import courseRoutes from "./routes/courseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import notFound from './utils/notFound.js';

const app = express();

app.use(express.json());

/*
app.get("/", (req, res, next) => {
  res.send("hello there !!");
});
*/

app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/reviews", reviewRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
