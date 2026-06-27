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

export function useCategorie() {
  const [categorie, setCategorie] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'categorie'), orderBy('nome'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategorie(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function aggiungiCategoria(nome, tipo) {
    await addDoc(collection(db, 'categorie'), { nome, tipo })
  }

  async function rimuoviCategoria(id) {
    await deleteDoc(doc(db, 'categorie', id))
  }

  return { categorie, loading, aggiungiCategoria, rimuoviCategoria }
}
