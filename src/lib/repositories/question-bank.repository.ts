import {
  addDoc,
  collection,
  type DocumentData,
  type DocumentSnapshot,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { type QuestionBank } from "@/lib/models/question-bank";

/**
 * Firestore repository for QuestionBank persistence.
 */
export class QuestionBankRepository {
  private static readonly COLLECTION_NAME = "questionBanks";

  /**
   * Resolves the active Firestore instance from the shared Firebase module.
   */
  private getDb() {
    if (!db) {
      throw new Error("Firestore is not initialized.");
    }

    return db;
  }

  /**
   * Maps a Firestore document snapshot into a QuestionBank model.
   */
  private mapDocument(
    snapshot: DocumentSnapshot<DocumentData>,
  ): QuestionBank {
    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<QuestionBank, "id">),
    };
  }

  /**
   * Creates a new QuestionBank document and returns its generated id.
   */
  async create(questionBank: QuestionBank): Promise<string> {
    const firestore = this.getDb();
    const { id: _id, ...data } = questionBank;

    const docRef = await addDoc(
      collection(firestore, QuestionBankRepository.COLLECTION_NAME),
      data,
    );

    return docRef.id;
  }

  /**
   * Returns a QuestionBank by id, or null if it does not exist.
   */
  async getById(id: string): Promise<QuestionBank | null> {
    const firestore = this.getDb();
    const docRef = doc(firestore, QuestionBankRepository.COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return this.mapDocument(snapshot);
  }

  /**
   * Lists all QuestionBanks for a specific owner and organization, sorted by name.
   */
  async getAllForUser(
    ownerUid: string,
    organizationId: string,
  ): Promise<QuestionBank[]> {
    const firestore = this.getDb();
    const collectionRef = collection(
      firestore,
      QuestionBankRepository.COLLECTION_NAME,
    );

    const questionBanksQuery = query(
      collectionRef,
      where("ownerUid", "==", ownerUid),
      where("organizationId", "==", organizationId),
      orderBy("name", "asc"),
    );

    const snapshot = await getDocs(questionBanksQuery);

    return snapshot.docs.map((docSnapshot) => this.mapDocument(docSnapshot));
  }

  /**
   * Updates only supplied fields for a QuestionBank document.
   */
  async update(id: string, questionBank: Partial<QuestionBank>): Promise<void> {
    const firestore = this.getDb();
    const docRef = doc(firestore, QuestionBankRepository.COLLECTION_NAME, id);

    // Remove immutable/id fields and undefined values so only explicit updates are sent.
    const { id: _id, ...rest } = questionBank;
    const updates = Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== undefined),
    );

    await updateDoc(docRef, updates);
  }

  /**
   * Permanently deletes a QuestionBank document by id.
   */
  async deleteById(id: string): Promise<void> {
    const firestore = this.getDb();
    const docRef = doc(firestore, QuestionBankRepository.COLLECTION_NAME, id);

    await deleteDoc(docRef);
  }
}
