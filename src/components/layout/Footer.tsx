import Link from 'next/link'
import styles from './Footer.module.css'
import { Phone, Mail, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.grid}>
          {/* Link */}
          <div className={styles.col}>
            <h4 className={styles.title}>Link</h4>
            <div className={styles.links}>
              <Link href="/">Home</Link>
              <Link href="/destinations">Destinasi</Link>
              <Link href="/about">Tentang Kami</Link>
            </div>
          </div>

          {/* Destinasi */}
          <div className={styles.col}>
            <h4 className={styles.title}>Destinasi</h4>
            <div className={styles.links}>
              <Link href="/contact">Contact Us</Link>
              <Link href="/destinasi">Destinasi</Link>
              <Link href="/kontak">Kontak</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className={styles.col}>
            <h4 className={styles.title}>Contact Info</h4>
            <div className={styles.contactLinks}>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <span>0912) 355 7779</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <span>jelajahnusantara.com</span>
              </div>
              <div className={styles.contactItem}>
                <Globe size={16} />
                <span>jelajahnusantara.com</span>
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
