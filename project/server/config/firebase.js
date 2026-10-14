/**
 * Firebase Admin SDK Configuration
 * 
 * To use Firebase Firestore:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project (free Spark plan)
 * 3. Go to Project Settings > Service Accounts
 * 4. Click "Generate new private key"
 * 5. Save the JSON file as `serviceAccountKey.json` in this directory
 * 6. Uncomment the Firebase code below
 * 
 * Until configured, the app uses in-memory storage as fallback.
 */

let db = null;

try {
    const admin = require("firebase-admin");
    const serviceAccount = require("./serviceAccountKey.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    console.log("✅ Firebase Firestore connected");
} catch {
    console.log("⚠️  Firebase not configured. Using in-memory storage.");
    console.log("   To connect Firebase, see server/config/firebase.js");
}

module.exports = { db };
