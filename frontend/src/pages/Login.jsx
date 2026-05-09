import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Alert } from '../components/ui/UI'
import styles from './Auth.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⬡</span>
          <span className={styles.brandName}>TeamFlow</span>
        </div>
        <h1 className={styles.headline}>Manage teams.<br />Ship faster.</h1>
        <p className={styles.tagline}>Role-based task management for modern teams.</p>
        <div className={styles.decorGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.decorCell} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Welcome back</h2>
          <p className={styles.formSub}>Sign in to your workspace</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Alert message={error} />
            <Input label="Email" name="email" type="email" placeholder="Email"
              value={form.email} onChange={handleChange} required />
            <Input label="Password" name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign in
            </Button>
          </form>

          <p className={styles.switchText}>
            No account? <Link to="/signup" className={styles.switchLink}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
