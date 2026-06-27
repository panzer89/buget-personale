import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth'
import { auth } from './firebase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ricordami, setRicordami] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await setPersistence(
        auth,
        ricordami ? browserLocalPersistence : browserSessionPersistence
      )
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Email o password non corretti.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <h1>Budget Personale</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={ricordami}
            onChange={(e) => setRicordami(e.target.checked)}
          />
          Ricordami su questo dispositivo
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Accesso...' : 'Accedi'}
        </button>
      </form>
    </div>
  )
}

export default Login
