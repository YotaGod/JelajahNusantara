import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={styles.pagination}>
      <button
        className="btn btn-outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={18} />
        <span className={styles.label}>Sebelumnya</span>
      </button>
      <div className={styles.info}>
        Halaman <span className={styles.current}>{currentPage}</span> dari {totalPages}
      </div>
      <button
        className="btn btn-outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className={styles.label}>Selanjutnya</span>
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
