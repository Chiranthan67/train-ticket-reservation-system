import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/train_reservation");
    
    // Find and update admin user
    const adminUser = await User.findOneAndUpdate(
      { email: "admin@railway.com" },
      { 
        name: "Admin",
        email: "admin@railway.com",
        password: "admin123",
        isAdmin: true 
      },
      { 
        upsert: true, // Create if doesn't exist
        new: true,
        runValidators: false // Skip validation to avoid password re-hashing
      }
    );

    console.log("✅ Admin user fixed:", {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

fixAdmin();