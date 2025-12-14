import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,

  role: { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
  },

  plan: {
    name: { type: String, default: null },  
    maxKeywords: { type: Number, default: 0 },
    usedKeywords: { type: Number, default: 0 },
    price: { type: Number, default: 0 }
  },

  futurePlan: {
    name: { type: String, default: null },
    maxKeywords: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 }
  },

  purchaseHistory: [
    {
      planName: String,
      keywords: Number,
      price: Number,
      paidAt: Date,
      paymentMethod: String,
      transactionId: String
    }
  ],

  /* --- AUTO RUN SETTINGS --- */
  autoConfig: {
    site: { type: String, default: null },
    brand: { type: String, default: null },
    description: { type: String, default: null },
    industry: { type: String, default: null },
    region: { type: String, default: null },
    competitors: { type: [String], default: [] },
    keywords: { type: [String], default: [] }
  },

  /* --- ⭐ NEW: GOOGLE OAUTH TOKENS FOR AUTO SCANS --- */
  googleTokens: {
    access_token: { type: String, default: null },
    refresh_token: { type: String, default: null },
    expiry_date: { type: Number, default: null },
    scope: { type: String, default: null },
    token_type: { type: String, default: null }
  },

  lastAutoRun: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);