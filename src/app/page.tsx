import Link from "next/link";

import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <h1>React 練習專案</h1>
        </header>

        <div className={styles.hero}>
          <p>歡迎光臨我的頁面</p>
        </div>

        <div className={styles.actionArea}>
          <Link className={styles.startButton} href="/accounting">
            點此開始
          </Link>
        </div>
      </section>
    </main>
  );
}
