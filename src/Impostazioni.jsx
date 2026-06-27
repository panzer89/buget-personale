import { useState } from 'react'
import { collection, getDocs, writeBatch } from 'firebase/firestore'
import { db } from './firebase'

async function svuotaCollezione(nomeCollezione) {
  const snap = await getDocs(collection(db, nomeCollezione))
  const docs = snap.docs
  // Firestore permette max 500 operazioni per batch
  for (let i = 0; i < docs.length; i += 450) {
    const batch = writeBatch(db)
    docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  return docs.length
}

async function svuotaProgrammateConStato(stati) {
  const snap = await getDocs(collection(db, 'speseProgrammate'))
  const docs = snap.docs.filter((d) => stati.includes(d.data().stato))
  for (let i = 0; i < docs.length; i += 450) {
    const batch = writeBatch(db)
    docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  return docs.length
}

function Impostazioni() {
  const [messaggio, setMessaggio] = useState('')
  const [lavorando, setLavorando] = useState(false)

  async function esegui(azione, etichetta, testoConferma) {
    if (!window.confirm(testoConferma)) return
    setLavorando(true)
    setMessaggio('')
    try {
      const n = await azione()
      setMessaggio(`${etichetta}: ${n} elementi eliminati.`)
    } catch (err) {
      setMessaggio(`Errore durante "${etichetta}": ${err.message}`)
    } finally {
      setLavorando(false)
    }
  }

  return (
    <section className="impostazioni">
      <h2>Impostazioni</h2>
      <p className="hint">
        Le azioni qui sotto sono <strong>permanenti</strong> e cancellano i dati sia
        dall'app che dal database (Firestore). Non si possono annullare.
      </p>

      <div className="impostazioni-azioni">
        <button
          className="danger-btn"
          disabled={lavorando}
          onClick={() =>
            esegui(
              () => svuotaCollezione('movimenti'),
              'Movimenti azzerati',
              'Sei sicuro di voler eliminare TUTTI i movimenti (entrate e spese)? Questa azione è irreversibile.'
            )
          }
        >
          Azzera tutti i movimenti
        </button>

        <button
          className="danger-btn"
          disabled={lavorando}
          onClick={() =>
            esegui(
              () => svuotaProgrammateConStato(['in attesa']),
              'Programmate in attesa azzerate',
              'Sei sicuro di voler eliminare tutte le spese/entrate programmate ancora "in attesa"? Questa azione è irreversibile.'
            )
          }
        >
          Azzera programmate in attesa
        </button>

        <button
          className="danger-btn"
          disabled={lavorando}
          onClick={() =>
            esegui(
              () => svuotaProgrammateConStato(['confermata', 'ignorata']),
              'Programmate concluse azzerate',
              'Sei sicuro di voler eliminare tutte le spese/entrate programmate già concluse (confermate o ignorate)? Questa azione è irreversibile.'
            )
          }
        >
          Azzera programmate concluse
        </button>

        <button
          className="danger-btn"
          disabled={lavorando}
          onClick={() =>
            esegui(
              () => svuotaCollezione('categorie'),
              'Categorie azzerate',
              'Sei sicuro di voler eliminare TUTTE le categorie? I movimenti esistenti perderanno il riferimento alla categoria. Questa azione è irreversibile.'
            )
          }
        >
          Azzera categorie
        </button>
      </div>

      {lavorando && <p className="hint">Operazione in corso...</p>}
      {messaggio && <p className="impostazioni-messaggio">{messaggio}</p>}
    </section>
  )
}

export default Impostazioni
