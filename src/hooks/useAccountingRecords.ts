"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createCloudRecord,
  deleteCloudRecord,
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

export function useAccountingRecords(userId: string | null) {
  const [records, setRecords] = useState<AccountingRecord[]>([]);
  const [mode, setMode] = useState<DataMode>("loading");
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const servicesRef = useRef<FirebaseServices | null>(null);
  const userIdRef = useRef(userId ?? "");

  useEffect(() => {
    const services = getFirebaseServices();
    servicesRef.current = services;
    let cancelled = false;

    if (!services) {
      queueMicrotask(() => setMode("unconfigured"));
      return () => {
        cancelled = true;
      };
    }

    if (!userId) {
      queueMicrotask(() => setMode("loading"));
      return () => {
        cancelled = true;
      };
    }

    userIdRef.current = userId;

    let unsubscribeRecords = () => {};
    let unsubscribeSummary = () => {};

    unsubscribeRecords = subscribeToRecords(
      services,
      userId,
      (nextRecords) => {
        if (cancelled) return;
        setRecords(nextRecords);
        setMode("firebase");
        setError("");
      },
      () => {
        if (cancelled) return;
        setError("Firestore 讀取失敗，請檢查資料庫與安全規則");
        setMode("firebase");
      },
    );
    unsubscribeSummary = subscribeToSummary(services, userId, setSummary);

    return () => {
      cancelled = true;
      unsubscribeRecords();
      unsubscribeSummary();
    };
  }, [userId]);

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
        if (!services || !userId) throw new Error("not-authenticated");
        await createCloudRecord(services, userId, input, records);
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
        if (!services || !userId) throw new Error("not-authenticated");
        await deleteCloudRecord(services, userId, recordId, records);
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
