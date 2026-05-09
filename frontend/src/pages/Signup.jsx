import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Alert } from '../components/ui/UI'
import styles from './Auth.module.css'

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.signup(form)
      login(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
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
        <h1 className={styles.headline}>Build.<br />Assign.<br />Deliver.</h1>
        <p className={styles.tagline}>Join thousands of teams moving work forward.</p>
        <div className={styles.decorGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.decorCell} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Create account</h2>
          <p className={styles.formSub}>Start managing your team today</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Alert message={error} />
            <Input label="Full name" name="name" placeholder="Your Name"
              value={form.name} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" placeholder="Email"
              value={form.email} onChange={handleChange} required />
            <Input label="Password" name="password" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required minLength={6} />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Create account
            </Button>
          </form>

          <p className={styles.switchText}>
            Already have an account? <Link to="/login" className={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
