"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/AuthProvider";
import { useAccountingRecords } from "@/hooks/useAccountingRecords";

import { AccountingForm } from "./AccountingForm";
import { AccountingList } from "./AccountingList";
import styles from "./accounting.module.css";

const numberFormatter = new Intl.NumberFormat("zh-TW");

export function AccountingApp() {
  const router = useRouter();
  const { user, loading: authLoading, configured, logOut } = useAuth();
  const {
    records,
    balance,
    mode,
    summary,
    error,
    busy,
    addRecord,
    deleteRecord,
  } = useAccountingRecords(user?.uid ?? null);

  useEffect(() => {
    if (!authLoading && configured && !user) router.replace("/login");
  }, [authLoading, configured, router, user]);

  if (authLoading || (configured && !user)) {
    return <main className={styles.statusPage}>正在確認登入狀態…</main>;
  }

  if (!configured) {
    return (
      <main className={styles.statusPage}>
        Firebase 尚未設定，請先加入環境變數。
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p>React 練習專案</p>
            <h1>Accounting 記帳小工具</h1>
          </div>
          <div className={styles.accountArea}>
            <span className={styles.mode} data-mode={mode}>
              {mode === "loading" ? "連線中" : "Firebase 雲端同步"}
            </span>
            <span className={styles.email}>{user?.email}</span>
            <button className={styles.logoutButton} type="button" onClick={logOut}>
              登出
            </button>
          </div>
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
