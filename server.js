import app from "./app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;

const DB_STRING = process.env.DB_STRING.replace(
  "<db_password>",
  process.env.DB_PASSWORD
);

mongoose
  .connect(DB_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
