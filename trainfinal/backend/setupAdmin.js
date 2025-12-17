import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const setupAdmin = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/train_reservation");
    
    // Delete any existing admin
    await User.deleteMany({ email: "admin@railway.com" });
    
    // Create admin with proper password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    
    const admin = new User({
      name: "Admin",
      email: "admin@railway.com", 
      password: hashedPassword,
      isAdmin: true
    });
    
    await admin.save();
    
    console.log("✅ Admin created successfully:");
    console.log("Email:", admin.email);
    console.log("isAdmin:", admin.isAdmin);
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

setupAdmin();