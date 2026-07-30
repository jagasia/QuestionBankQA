import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys: (keyof FirebaseOptions)[] = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
];

const hasRequiredConfig = requiredKeys.every((key) => {
  const value = firebaseConfig[key];
  return typeof value === "string" && value.length > 0;
});

let app: FirebaseApp | null = null;

if (hasRequiredConfig) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase App Options:", app.options);
  } else {
    app = getApp();
  }

  console.log("Firebase config projectId:", app.options.projectId);
  console.log("Firebase config authDomain:", app.options.authDomain);
  console.log("Firebase config storageBucket:", app.options.storageBucket);
  console.log("Firebase config appId:", app.options.appId);
}

export { app };
