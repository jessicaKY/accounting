"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createCloudRecord,
  deleteCloudRecord,
  ensureAnonymousUser,
  subscribeToRecords,
  subscribeToSummary,
} from "@/lib/accounting-repository";
import { getFirebaseServices, type FirebaseServices } from "@/lib/firebase";
import type {
  AccountingRecord,
  AccountingSummary,
  DataMode,
  NewAccountingRecord,
} from "@/types/accounting";

const LOCAL_STORAGE_KEY = "accounting-records-v1";

const SAMPLE_RECORDS: AccountingRecord[] = [
  {
    id: "sample-meal",
    kind: "expense",
    amount: 1200,
    description: "吃大餐",
    createdAt: 4,
  },
  {
    id: "sample-coffee",
    kind: "expense",
    amount: 500,
    description: "咖啡十杯",
    createdAt: 3,
  },
  {
    id: "sample-supplies",
    kind: "expense",
    amount: 200,
    description: "生活用品",
    createdAt: 2,
  },
  {
    id: "sample-salary",
    kind: "income",
    amount: 50000,
    description: "十月份薪資",
    createdAt: 1,
  },
];

function saveLocalRecords(records: AccountingRecord[]) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
}

function loadLocalRecords() {
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return SAMPLE_RECORDS;

  try {
    const records = JSON.parse(stored) as AccountingRecord[];
    return Array.isArray(records) ? records : SAMPLE_RECORDS;
  } catch {
    return SAMPLE_RECORDS;
  }
}

export function useAccountingRecords() {
  const [records, setRecords] = useState<AccountingRecord[]>([]);
  const [mode, setMode] = useState<DataMode>("loading");
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const servicesRef = useRef<FirebaseServices | null>(null);
  const userIdRef = useRef("");

  useEffect(() => {
    const services = getFirebaseServices();
    servicesRef.current = services;
    let cancelled = false;

    if (!services) {
      queueMicrotask(() => {
        if (cancelled) return;
        setRecords(loadLocalRecords());
        setMode("local");
      });
      return () => {
        cancelled = true;
      };
    }

    let unsubscribeRecords = () => {};
    let unsubscribeSummary = () => {};

    void ensureAnonymousUser(services)
      .then((user) => {
        if (cancelled) return;
        userIdRef.current = user.uid;
        unsubscribeRecords = subscribeToRecords(
          services,
          user.uid,
          (nextRecords) => {
            setRecords(nextRecords);
            setMode("firebase");
            setError("");
          },
          () => {
            setError("Firestore 讀取失敗，請檢查資料庫與安全規則");
            setMode("firebase");
          },
        );
        unsubscribeSummary = subscribeToSummary(
          services,
          user.uid,
          setSummary,
        );
      })
      .catch(() => {
        if (cancelled) return;
        setError("Firebase Authentication 登入失敗，請確認匿名登入已啟用");
        setMode("firebase");
      });

    return () => {
      cancelled = true;
      unsubscribeRecords();
      unsubscribeSummary();
    };
  }, []);

  const balance = useMemo(
    () =>
      records.reduce(
        (total, record) =>
          total + (record.kind === "income" ? record.amount : -record.amount),
        0,
      ),
    [records],
  );

  const addRecord = useCallback(
    async (input: NewAccountingRecord) => {
      setBusy(true);
      setError("");
      try {
        const services = servicesRef.current;
        const userId = userIdRef.current;
        if (services && userId) {
          await createCloudRecord(services, userId, input, records);
          return;
        }

        const nextRecords: AccountingRecord[] = [
          { ...input, id: crypto.randomUUID(), createdAt: Date.now() },
          ...records,
        ];
        setRecords(nextRecords);
        saveLocalRecords(nextRecords);
      } catch {
        setError("新增記錄失敗，請稍後再試");
      } finally {
        setBusy(false);
      }
    },
    [records],
  );

  const deleteRecord = useCallback(
    async (recordId: string) => {
      setBusy(true);
      setError("");
      try {
        const services = servicesRef.current;
        const userId = userIdRef.current;
        if (services && userId) {
          await deleteCloudRecord(services, userId, recordId, records);
          return;
        }

        const nextRecords = records.filter((record) => record.id !== recordId);
        setRecords(nextRecords);
        saveLocalRecords(nextRecords);
      } catch {
        setError("刪除記錄失敗，請稍後再試");
      } finally {
        setBusy(false);
      }
    },
    [records],
  );

  return {
    records,
    balance,
    mode,
    summary,
    error,
    busy,
    addRecord,
    deleteRecord,
  };
}
