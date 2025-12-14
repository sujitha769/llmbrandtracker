import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: "../.env" });  // ⬅ IMPORTANT

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminEmail = "sujithaneelam4@gmail.com";

    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
      { 
        $set: { 
          role: "admin",
          name: "Admin User"
        } 
      },
      { upsert: true, new: true }
    );

    console.log("✅ Admin created:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createAdmin();
console.log("Loaded Mongo URI:", process.env.MONGODB_URI);
