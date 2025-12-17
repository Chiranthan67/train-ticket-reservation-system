import mongoose from "mongoose";
import User from "./models/User.js";

mongoose.connect("mongodb://localhost:27017/train_reservation").then(async () => {
  const result = await User.updateOne(
    { email: "admin@railway.com" },
    { $set: { isAdmin: true } }
  );
  console.log("Update result:", result);
  const admin = await User.findOne({ email: "admin@railway.com" });
  console.log("Admin:", admin);
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
