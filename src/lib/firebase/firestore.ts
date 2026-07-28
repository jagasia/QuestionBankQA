import { getFirestore, type Firestore } from "firebase/firestore";
import { app } from "./app";

let db: Firestore | null = null;

if (app) {
  db = getFirestore(app);
}

export { db };
