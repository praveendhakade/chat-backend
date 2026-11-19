
import { firestore } from "./firebase.js";

async function checkFirebase(): Promise<void> {
  try {
    await firestore
      .collection("_health")
      .doc("connection-test")
      .set({
        status: "connected",
        checkedAt: new Date()
      });

    console.log("Firebase Firestore connection successful");
  } catch (error) {
    console.error("Firebase connection failed:", error);
    process.exitCode = 1;
  }
}

void checkFirebase();
