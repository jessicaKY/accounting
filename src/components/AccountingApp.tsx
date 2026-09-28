"use client";

import Link from "next/link";

import { useAccountingRecords } from "@/hooks/useAccountingRecords";

import { AccountingForm } from "./AccountingForm";
import { AccountingList } from "./AccountingList";
import styles from "./accounting.module.css";

const numberFormatter = new Intl.NumberFormat("zh-TW");

export function AccountingApp() {
  const {
    records,
    balance,
    mode,
    summary,
    error,
    busy,
    addRecord,
    deleteRecord,
  } = useAccountingRecords();

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p>React 練習專案</p>
            <h1>Accounting 記帳小工具</h1>
          </div>
          <span className={styles.mode} data-mode={mode}>
            {mode === "loading"
              ? "連線中"
              : mode === "firebase"
                ? "Firebase 雲端同步"
                : "本機示範模式"}
          </span>
        </header>

        <AccountingForm busy={busy} onAdd={addRecord} />

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <AccountingList records={records} busy={busy} onDelete={deleteRecord} />

        <div className={styles.summary} aria-live="polite">
          <strong>小計：{numberFormatter.format(balance)}</strong>
          {mode === "firebase" && summary ? (
            <small>Realtime Database 已同步 {summary.count} 筆摘要</small>
          ) : null}
        </div>

        <Link className={styles.backButton} href="/">
          返回首頁
        </Link>
      </section>
    </main>
  );
}
