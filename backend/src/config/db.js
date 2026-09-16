import mongoose from "mongoose";

/**
 * Connects to MongoDB using the URI provided in process.env.MONGO_URI.
 * On failure, logs the error and exits the process so the app never
 * runs silently without a database connection.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not defined in the environment.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

export default connectDB;
