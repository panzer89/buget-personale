import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Login from './Login.jsx'
import Categorie from './Categorie.jsx'
import Movimenti from './Movimenti.jsx'
import Dashboard from './Dashboard.jsx'
import SpeseProgrammate from './SpeseProgrammate.jsx'
import ConfermaPopup from './ConfermaPopup.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setChecking(false)
    })
    return unsubscribe
  }, [])

  if (checking) {
    return <div className="app-loading">Caricamento...</div>
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Budget Personale</h1>
        <button className="logout-btn" onClick={() => signOut(auth)}>
          Esci
        </button>
      </header>
      <nav className="tabs">
        <button
          className={tab === 'dashboard' ? 'active' : ''}
          onClick={() => setTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={tab === 'movimenti' ? 'active' : ''}
          onClick={() => setTab('movimenti')}
        >
          Movimenti
        </button>
        <button
          className={tab === 'programmate' ? 'active' : ''}
          onClick={() => setTab('programmate')}
        >
          Programmate
        </button>
        <button
          className={tab === 'categorie' ? 'active' : ''}
          onClick={() => setTab('categorie')}
        >
          Categorie
        </button>
      </nav>
      <main>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'movimenti' && <Movimenti />}
        {tab === 'programmate' && <SpeseProgrammate />}
        {tab === 'categorie' && <Categorie />}
      </main>
      <ConfermaPopup />
    </div>
  )
}

export default App
