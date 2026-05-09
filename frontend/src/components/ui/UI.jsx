import { useState } from 'react'
import styles from './UI.module.css'

// ── Button ────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', size = 'md', loading, fullWidth, ...props }) => (
  <button
    className={[styles.btn, styles[variant], styles[size], fullWidth ? styles.full : ''].join(' ')}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? <span className={styles.spinner} /> : children}
  </button>
)

// ── Input ─────────────────────────────────────────────────────
export const Input = ({ label, error, ...props }) => (
  <div className={styles.inputWrap}>
    {label && <label className={styles.label}>{label}</label>}
    <input className={error ? styles.inputError : ''} {...props} />
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
)

// ── Textarea ──────────────────────────────────────────────────
export const Textarea = ({ label, error, ...props }) => (
  <div className={styles.inputWrap}>
    {label && <label className={styles.label}>{label}</label>}
    <textarea className={error ? styles.inputError : ''} rows={3} {...props} />
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
)

// ── Select ────────────────────────────────────────────────────
export const Select = ({ label, children, ...props }) => (
  <div className={styles.inputWrap}>
    {label && <label className={styles.label}>{label}</label>}
    <select {...props}>{children}</select>
  </div>
)

// ── Badge ─────────────────────────────────────────────────────
const badgeMap = {
  TODO:        { label: 'To Do',       color: 'gray'  },
  IN_PROGRESS: { label: 'In Progress', color: 'amber' },
  DONE:        { label: 'Done',        color: 'green' },
  ADMIN:       { label: 'Admin',       color: 'accent'},
  MEMBER:      { label: 'Member',      color: 'blue'  },
}
export const Badge = ({ value }) => {
  const { label, color } = badgeMap[value] || { label: value, color: 'gray' }
  return <span className={`${styles.badge} ${styles[`badge_${color}`]}`}>{label}</span>
}

// ── Spinner ───────────────────────────────────────────────────
export const Spinner = ({ size = 24 }) => (
  <span className={styles.spinner} style={{ width: size, height: size }} />
)

// ── Card ──────────────────────────────────────────────────────
export const Card = ({ children, className = '', onClick, ...props }) => (
  <div
    className={`${styles.card} ${onClick ? styles.cardClickable : ''} ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
)

// ── Modal ─────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className={styles.empty}>
    <div className={styles.emptyIcon}>{icon}</div>
    <h3 className={styles.emptyTitle}>{title}</h3>
    {description && <p className={styles.emptyDesc}>{description}</p>}
    {action}
  </div>
)

// ── Alert ─────────────────────────────────────────────────────
export const Alert = ({ message, type = 'error' }) => {
  if (!message) return null
  return <div className={`${styles.alert} ${styles[`alert_${type}`]}`}>{message}</div>
}
