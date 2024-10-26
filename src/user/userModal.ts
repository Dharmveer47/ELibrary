import mongoose from "mongoose";
import { IUser } from "./types/conroller";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// users the third param is the collection name
// default is 'users' = User+s with singular
export default mongoose.model<IUser>("User", userSchema);