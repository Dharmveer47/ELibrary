import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB");
    });

    mongoose.connection.on("error", (error) => {
      console.error("Error connecting to MongoDB:", error);
    });
    await mongoose.connect(config.databaseUrl as string);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
