import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase'

export function useMovimenti() {
  const [movimenti, setMovimenti] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'movimenti'), orderBy('data', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMovimenti(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function aggiungiMovimento({ data, importo, tipo, categoriaId, ricorrenza, note }) {
    await addDoc(collection(db, 'movimenti'), {
      data,
      importo: Number(importo),
      tipo,
      categoriaId,
      ricorrenza,
      note: note || ''
    })
  }

  async function rimuoviMovimento(id) {
    await deleteDoc(doc(db, 'movimenti', id))
  }

  return { movimenti, loading, aggiungiMovimento, rimuoviMovimento }
}
