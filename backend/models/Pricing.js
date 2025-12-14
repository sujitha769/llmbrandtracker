import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema({
  // STATIC INTERNAL PLAN NAME
  // Admin CANNOT change this (should always be one of these)
  name: { 
    type: String, 
    enum: ["basic", "business", "pro"],
    required: true 
  },

  // Admin CAN change these:
  title: { type: String, required: true },        // display title
  keywords: { type: Number, required: true },     // keyword limit
  price: { type: Number, required: true },        // price
  popular: { type: Boolean, default: false }      // "Most popular" badge
});

export default mongoose.model("Pricing", pricingSchema);
