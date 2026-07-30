// import { getFirestore, type Firestore } from "firebase/firestore";
// import { app } from "./app";

// let db: Firestore | null = null;

// if (typeof window !== "undefined" && app) {
//   db = getFirestore(app);
//   console.log("Firestore Instance:", db);
// }

// export { db };

import { initializeFirestore, type Firestore } from "firebase/firestore";
import { app } from "./app";

let db: Firestore | null = null;

if (typeof window !== "undefined" && app) {
  db = initializeFirestore(app, {}, "default");
  console.log("Firestore Instance:", db);
}

export { db };