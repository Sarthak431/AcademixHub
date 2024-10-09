import express from "express";
import globalErrorHandler from "./utils/errorHandler.js";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();

app.use(express.json());

/*
app.get("/", (req, res, next) => {
  res.send("hello there !!");
});
*/

app.use("/api/v1/courses", courseRoutes);

app.use(globalErrorHandler);

export default app;
