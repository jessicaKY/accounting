import { signInAnonymously, type User } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import type {
  AccountingRecord,
  AccountingSummary,
  NewAccountingRecord,
} from "@/types/accounting";

import type { FirebaseServices } from "./firebase";

function recordsPath(userId: string) {
  return `users/${userId}/records`;
}

function summaryPath(userId: string) {
  return `users/${userId}/accountingSummary`;
}

function calculateBalance(records: AccountingRecord[]) {
  return records.reduce(
    (total, record) =>
      total + (record.kind === "income" ? record.amount : -record.amount),
    0,
  );
}

async function writeSummary(
  services: FirebaseServices,
  userId: string,
  records: AccountingRecord[],
) {
  const summary: AccountingSummary = {
    balance: calculateBalance(records),
    count: records.length,
    updatedAt: Date.now(),
  };

  await set(ref(services.realtimeDatabase, summaryPath(userId)), summary);
}

export async function ensureAnonymousUser(
  services: FirebaseServices,
): Promise<User> {
  if (services.auth.currentUser) return services.auth.currentUser;
  return (await signInAnonymously(services.auth)).user;
}

export function subscribeToRecords(
  services: FirebaseServices,
  userId: string,
  onRecords: (records: AccountingRecord[]) => void,
  onError: (error: Error) => void,
) {
  const recordsQuery = query(
    collection(services.firestore, recordsPath(userId)),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    recordsQuery,
    (snapshot) => {
      onRecords(
        snapshot.docs.map((recordDocument) => ({
          id: recordDocument.id,
          ...(recordDocument.data() as Omit<AccountingRecord, "id">),
        })),
      );
    },
    onError,
  );
}

export function subscribeToSummary(
  services: FirebaseServices,
  userId: string,
  onSummary: (summary: AccountingSummary | null) => void,
) {
  return onValue(ref(services.realtimeDatabase, summaryPath(userId)), (snapshot) => {
    onSummary(snapshot.exists() ? (snapshot.val() as AccountingSummary) : null);
  });
}

export async function createCloudRecord(
  services: FirebaseServices,
  userId: string,
  input: NewAccountingRecord,
  currentRecords: AccountingRecord[],
) {
  const recordWithoutId = { ...input, createdAt: Date.now() };
  const recordDocument = await addDoc(
    collection(services.firestore, recordsPath(userId)),
    recordWithoutId,
  );
  const record: AccountingRecord = {
    id: recordDocument.id,
    ...recordWithoutId,
  };
  await writeSummary(services, userId, [record, ...currentRecords]);
}

export async function deleteCloudRecord(
  services: FirebaseServices,
  userId: string,
  recordId: string,
  currentRecords: AccountingRecord[],
) {
  await deleteDoc(doc(services.firestore, recordsPath(userId), recordId));
  await writeSummary(
    services,
    userId,
    currentRecords.filter((record) => record.id !== recordId),
  );
}
