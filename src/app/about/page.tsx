import styles from './About.module.css'

export const metadata = {
  title: 'Tentang Kami - Jelajah Nusantara',
  description: 'Mengenal lebih dekat tentang Jelajah Nusantara',
}

export default function AboutPage() {
  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.heroBackground}>
        <img src="/img/About_us.jpg" alt="About Us" className={styles.bgImage} />
        <div className={styles.darkOverlay}></div>
      </div>
      
      <main className={styles.mainContent}>
        <div className={styles.glassCard}>
          <h1 className={styles.title}>Tentang Jelajah Nusantara</h1>
          <div className={styles.divider}></div>
          <p className={styles.description}>
            Selamat datang di <strong>Jelajah Nusantara</strong>, platform utama Anda untuk menemukan keindahan tersembunyi, 
            kekayaan budaya, dan destinasi menakjubkan di seluruh pelosok Indonesia.
          </p>
          <p className={styles.description}>
            Kami percaya bahwa setiap sudut Nusantara memiliki cerita yang layak untuk dibagikan. Misi kami adalah 
            menghubungkan para pelancong dengan pesona alam dan budaya lokal yang otentik, mempromosikan pariwisata 
            yang berkelanjutan, dan mendukung perekonomian komunitas setempat.
          </p>
          <p className={styles.description}>
            Melalui platform ini, kami mengajak Anda untuk menjelajahi keajaiban Indonesia dari Sabang hingga Merauke. 
            Mari bersama-sama merayakan keberagaman dan melestarikan warisan alam Nusantara untuk generasi mendatang.
          </p>
        </div>
      </main>
    </div>
  )
}
