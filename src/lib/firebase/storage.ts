import { getStorage, type FirebaseStorage } from "firebase/storage";
import { app } from "./app";

let storage: FirebaseStorage | null = null;

if (app) {
  storage = getStorage(app);
}

export { storage };
