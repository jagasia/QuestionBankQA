"use client";

import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

export default function FirestoreTest() {
  useEffect(() => {
    async function test() {
      try {
        if (!db) {
          console.log("DB is null");
          return;
        }

        const ref = doc(db, "dummy", "1");
        const snap = await getDoc(ref);

        console.log("Exists:", snap.exists());

        if (snap.exists()) {
          console.log("Data:", snap.data());
        }
      } catch (e) {
        console.error("DIRECT TEST", e);
      }
    }

    test();
  }, []);

  return <h1>Firestore Test</h1>;
}
