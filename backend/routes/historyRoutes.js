import express from "express";
import {
  saveHistory,
  getHistory,
  deleteHistory,
  clearHistory
} from "../controllers/historyController.js";

const router = express.Router();

// Save analysis result
router.post("/save", saveHistory);

// Get all history for a user
router.get("/:email", getHistory);

// Delete a single entry
router.delete("/item/:id", deleteHistory);

// Clear all history for a user
router.delete("/clear/:email", clearHistory);

export default router;
