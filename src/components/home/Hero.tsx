import styles from './Hero.module.css'

export default function Hero() {
  return (
    <div className={styles.hero}>
      <div className={`container ${styles.heroContent}`}>
        <h1 className={styles.title}>Jelajahi Wisata <span className="text-gradient">Banten</span></h1>
        <p className={styles.subtitle}>Temukan pantai, gunung, budaya, dan kuliner di Banten</p>
      </div>
    </div>
  )
}
