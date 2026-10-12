import admin from "firebase-admin";
import { serviceAccount } from "../app/routes/serviceAccount";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
  } catch (error) {
    console.warn("Firebase Admin initialized with placeholder credentials.");
  }
}

export default admin;