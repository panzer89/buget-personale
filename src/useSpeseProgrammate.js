import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase'

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

  async function aggiungiSpesaProgrammata({ nome, importo, data, categoriaId, tipo }) {
    await addDoc(collection(db, 'speseProgrammate'), {
      nome,
      importo: Number(importo),
      data,
      categoriaId: categoriaId || '',
      tipo: tipo || 'spesa',
      stato: 'in attesa'
    })
  }

  async function aggiornaStato(id, stato) {
    await updateDoc(doc(db, 'speseProgrammate', id), { stato })
  }

  async function rimuoviSpesaProgrammata(id) {
    await deleteDoc(doc(db, 'speseProgrammate', id))
  }

  return {
    speseProgrammate,
    loading,
    aggiungiSpesaProgrammata,
    aggiornaStato,
    rimuoviSpesaProgrammata
  }
}
