"use client";

import type { FirebaseError } from "firebase/app";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/AuthProvider";

import styles from "./auth.module.css";

function authMessage(error: unknown) {
  const code = (error as FirebaseError)?.code;
  if (code === "auth/invalid-credential") return "Email 或密碼不正確";
  if (code === "auth/email-already-in-use") return "這個 Email 已經註冊過";
  if (code === "auth/weak-password") return "密碼至少需要 6 個字元";
  if (code === "auth/invalid-email") return "請輸入有效的 Email";
  if (code === "firebase-not-configured") return "Firebase 尚未設定完成";
  return "操作失敗，請稍後再試";
}

export function AuthPage() {
  const router = useRouter();
  const { user, loading, configured, signIn, signUp, logOut } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(
    event: FormEvent<HTMLFormElement>,
    action: (email: string, password: string) => Promise<void>,
  ) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await action(String(data.get("email")), String(data.get("password")));
    } catch (nextError) {
      setError(authMessage(nextError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <h1>React 練習專案</h1>
        </header>

        <div className={styles.content}>
          {loading ? <p>正在確認登入狀態…</p> : null}

          {!loading && user ? (
            <section className={styles.signedIn}>
              <p>已經使用 {user.email} 登入</p>
              <div className={styles.actions}>
                <Link className={styles.button} href="/accounting">
                  立刻開始
                </Link>
                <button className={styles.button} type="button" onClick={logOut}>
                  登出
                </button>
              </div>
            </section>
          ) : null}

          {!loading && !user ? (
            <>
              <form className={styles.form} onSubmit={(event) => submit(event, signIn)}>
                <h2>登入系統</h2>
                <label>
                  <span>電郵</span>
                  <input name="email" type="email" autoComplete="email" required />
                </label>
                <label>
                  <span>密碼</span>
                  <input name="password" type="password" autoComplete="current-password" minLength={6} required />
                </label>
                <button type="submit" disabled={busy || !configured}>登入</button>
              </form>

              <form className={styles.form} onSubmit={(event) => submit(event, signUp)}>
                <h2>註冊帳戶</h2>
                <label>
                  <span>電郵</span>
                  <input name="email" type="email" autoComplete="email" required />
                </label>
                <label>
                  <span>密碼</span>
                  <input name="password" type="password" autoComplete="new-password" minLength={6} required />
                </label>
                <button type="submit" disabled={busy || !configured}>註冊</button>
              </form>
            </>
          ) : null}

          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          {!configured ? <p className={styles.error}>Firebase 尚未設定完成</p> : null}

          <button className={styles.homeLink} type="button" onClick={() => router.push("/")}>
            返回首頁
          </button>
        </div>
      </section>
    </main>
  );
}
