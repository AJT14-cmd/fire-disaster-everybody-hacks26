import cron from "node-cron";
import { db } from "../config/firebase.js";
import { getFireIntelligence } from "../services/fireDataService.js";
import { emitEvent } from "../services/websocketService.js";
import { logger } from "../utils/logger.js";

const WATCH_LOCATIONS = [
  { lat: 34.0522, lng: -118.2437, key: "los-angeles" },
  { lat: 37.7749, lng: -122.4194, key: "san-francisco" }
];

export function startFireUpdateJob() {
  cron.schedule("*/5 * * * *", async () => {
    try {
      for (const location of WATCH_LOCATIONS) {
        const snapshot = await getFireIntelligence(location.lat, location.lng);
        await db.collection("fireSnapshots").doc(location.key).set(snapshot, { merge: true });
        emitEvent("fire.update", snapshot);
      }
    } catch (error) {
      logger.error("Fire update job failed:", error.message);
    }
  });
}
