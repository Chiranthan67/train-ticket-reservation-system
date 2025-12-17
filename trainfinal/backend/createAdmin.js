import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/train_reservation");
    
    const adminEmail = "admin@railway.com";
    
    // Delete existing admin if any
    await User.deleteOne({ email: adminEmail });
    
    // Create fresh admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    
    const admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
    });
    
    console.log("✅ Admin user created:", {
      email: admin.email,
      isAdmin: admin.isAdmin,
      id: admin._id
    });
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

createAdmin();
