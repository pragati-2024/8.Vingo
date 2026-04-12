import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const uri = process.env.MONGODB_URL;
    if (!uri) {
      throw new Error("MONGODB_URL is not set");
    }
    await mongoose.connect(uri);
    console.log("db connected");
  } catch (error) {
    console.error("db error", error?.message || error);
    throw error;
  }
};

export default connectDb;
