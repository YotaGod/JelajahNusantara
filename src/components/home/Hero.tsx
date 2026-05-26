import styles from './Hero.module.css'

export default function Hero() {
  return (
    <div className={styles.hero}>
      <div className={styles.overlay}></div>
      <div className={`container ${styles.heroContent}`}>
        <h1 className={styles.title}>Jelajah Nusantara</h1>
        <p className={styles.subtitle}>Temukan Keindahan Indonesia yang Belum Pernah Anda Bayangkan</p>
      </div>
    </div>
  )
}
