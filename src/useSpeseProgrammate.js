import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

// Usa SEMPRE i componenti data locali (anno/mese/giorno), mai toISOString(),
// che convertendo in UTC può far slittare il giorno in base al fuso orario.
function toISO(dateObj) {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function oggiISO() {
  return toISO(new Date())
}

function parseISO(dataStr) {
  const [y, m, d] = dataStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addMesiClamped(dateObj, n) {
  const giorno = dateObj.getDate()
  const nuovo = new Date(dateObj.getFullYear(), dateObj.getMonth() + n, 1)
  const ultimoGiornoMese = new Date(nuovo.getFullYear(), nuovo.getMonth() + 1, 0).getDate()
  nuovo.setDate(Math.min(giorno, ultimoGiornoMese))
  return nuovo
}

// Genera le date mensili dalla prima occorrenza >= oggi fino al 31 dicembre di quell'anno
function generaDateMensili(dataInizio) {
  const oggi = parseISO(oggiISO())
  let cursore = parseISO(dataInizio)
  let n = 0

  while (cursore < oggi) {
    n += 1
    cursore = addMesiClamped(parseISO(dataInizio), n)
  }

  const fineAnno = new Date(cursore.getFullYear(), 11, 31)
  const date = []
  while (cursore <= fineAnno) {
    date.push(toISO(cursore))
    n += 1
    cursore = addMesiClamped(parseISO(dataInizio), n)
  }
  return date
}

export function useSpeseProgrammate() {
  const [speseProgrammate, setSpeseProgrammate] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'speseProgrammate'), orderBy('data'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSpeseProgrammate(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function aggiungiSpesaProgrammata({ nome, importo, data, categoriaId, tipo, ricorrenza }) {
    const base = {
      nome,
      importo: Number(importo),
      categoriaId: categoriaId || '',
      tipo: tipo || 'spesa',
      ricorrenza: ricorrenza || 'nessuna',
      stato: 'in attesa'
    }

    if (ricorrenza === 'mensile') {
      const date = generaDateMensili(data)
      const batch = writeBatch(db)
      date.forEach((d) => {
        const ref = doc(collection(db, 'speseProgrammate'))
        batch.set(ref, { ...base, data: d })
      })
      await batch.commit()
    } else {
      await addDoc(collection(db, 'speseProgrammate'), { ...base, data })
    }
  }

  async function aggiornaStato(id, stato) {
    await updateDoc(doc(db, 'speseProgrammate', id), { stato })
  }

  async function rimandaADomani(id) {
    const domani = new Date()
    domani.setDate(domani.getDate() + 1)
    await updateDoc(doc(db, 'speseProgrammate', id), { promemoriaDa: toISO(domani) })
  }

  async function rimuoviSpesaProgrammata(id) {
    await deleteDoc(doc(db, 'speseProgrammate', id))
  }

  return {
    speseProgrammate,
    loading,
    aggiungiSpesaProgrammata,
    aggiornaStato,
    rimandaADomani,
    rimuoviSpesaProgrammata
  }
}
