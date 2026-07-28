import { getAuth, type Auth } from "firebase/auth";
import { app } from "./app";

let auth: Auth | null = null;

if (app) {
  auth = getAuth(app);
}

export { auth };
