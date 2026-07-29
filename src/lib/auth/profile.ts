import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase/firestore";

export type UserRole = "Admin" | "QA Lead" | "Reviewer" | "Viewer";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function deriveRole(email: string | null | undefined): UserRole {
  const normalized = email?.toLowerCase() ?? "";

  if (normalized.includes("admin")) {
    return "Admin";
  }

  if (normalized.includes("qa")) {
    return "QA Lead";
  }

  if (normalized.includes("review")) {
    return "Reviewer";
  }

  return "Viewer";
}

function deriveDisplayName(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }

  const localPart = email.split("@")[0] ?? "User";
  return localPart.replace(/[._-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const fallbackRole = deriveRole(user.email);
  const fallbackDisplayName = user.displayName ?? deriveDisplayName(user.email);

  if (!db) {
    return {
      uid: user.uid,
      email: user.email ?? null,
      displayName: fallbackDisplayName,
      photoURL: user.photoURL ?? null,
      role: fallbackRole,
    };
  }

  try {
    const profileRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(profileRef);
    const now = serverTimestamp();

    const profileData = {
      uid: user.uid,
      email: user.email ?? null,
      displayName: fallbackDisplayName,
      photoURL: user.photoURL ?? null,
      role: snapshot.exists() ? (snapshot.data().role ?? fallbackRole) : fallbackRole,
      createdAt: snapshot.exists() ? snapshot.data().createdAt ?? now : now,
      updatedAt: now,
    };

    await setDoc(profileRef, profileData, { merge: true });

    const refreshedSnapshot = await getDoc(profileRef);
    const data = refreshedSnapshot.data();

    return {
      uid: user.uid,
      email: data?.email ?? user.email ?? null,
      displayName: data?.displayName ?? fallbackDisplayName,
      photoURL: data?.photoURL ?? user.photoURL ?? null,
      role: (data?.role as UserRole | undefined) ?? fallbackRole,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
    };
  } catch (error) {
    console.warn("Firestore profile sync unavailable; continuing with auth-only profile", error);

    return {
      uid: user.uid,
      email: user.email ?? null,
      displayName: fallbackDisplayName,
      photoURL: user.photoURL ?? null,
      role: fallbackRole,
    };
  }
}
