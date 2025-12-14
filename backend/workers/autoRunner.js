// backend/workers/autoRunner.js

import User from "../models/User.js";
import History from "../models/History.js";
import { runVisibilityScan } from "./visibilityWorker.js";

export async function runAutoScanFor(subscriptionType) {
  console.log(`⚙️ Auto Scan Started for ${subscriptionType} users...`);

  const users = await User.find({ "plan.name": subscriptionType });

  for (const user of users) {
    const result = await runVisibilityScan(user);

    if (result) {
      await History.create({
        ...result,               // full analysis result
        userEmail: user.email,   // required
        timestamp: new Date(),   // same format as manual
        autoScan: true           // identify auto entry
      });

      console.log(`📌 Auto-scan saved to history for: ${user.email}`);
    } else {
      console.log(`⚠️ Auto-scan failed or empty for: ${user.email}`);
    }
  }

  console.log(`✅ Auto Scan Completed for ${subscriptionType}`);
}
