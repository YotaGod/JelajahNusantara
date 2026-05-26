import Link from 'next/link'
import styles from './Footer.module.css'
import { Phone, Mail, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.grid}>
          {/* Navigasi */}
          <div className={styles.col}>
            <h4 className={styles.title}>Navigasi</h4>
            <div className={styles.links}>
              <Link href="/">Home</Link>
              <Link href="/map">Peta Wisata</Link>
              <Link href="/about">Tentang Kami</Link>
              <Link href="/kontak">Hubungi Kami</Link>
            </div>
          </div>

          {/* Kategori Wisata */}
          <div className={styles.col}>
            <h4 className={styles.title}>Kategori Wisata</h4>
            <div className={styles.links}>
              <Link href="/?category=c0000000-0000-0000-0000-000000000001">Wisata Pantai</Link>
              <Link href="/?category=c0000000-0000-0000-0000-000000000002">Wisata Gunung</Link>
              <Link href="/?category=c0000000-0000-0000-0000-000000000003">Wisata Budaya</Link>
              <Link href="/?category=c0000000-0000-0000-0000-000000000004">Wisata Kuliner</Link>
            </div>
          </div>

          {/* Hubungi Kami */}
          <div className={styles.col}>
            <h4 className={styles.title}>Contact Info</h4>
            <div className={styles.contactLinks}>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <span>+62 254 123456</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <span>info@wisatabanten.com</span>
              </div>
              <div className={styles.contactItem}>
                <Globe size={16} />
                <span>wisatabanten.com</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className={styles.col}>
            <h4 className={styles.title}>Social Media</h4>
            <div className={styles.socialIcons}>
              <div className={styles.iconCircle}><b>F</b></div>
              <div className={styles.iconCircle}><b>I</b></div>
              <div className={styles.iconCircle}><b>X</b></div>
              <div className={styles.iconCircle}><b>Y</b></div>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <span>Powered by UI &bull; Inter</span>
        </div>
      </div>
    </footer>
  )
}
