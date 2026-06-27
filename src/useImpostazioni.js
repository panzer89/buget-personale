import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const REF = ['impostazioni', 'config']

export function useImpostazioni() {
  const [margine, setMargineState] = useState(15)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, ...REF), (snap) => {
      if (snap.exists()) {
        setMargineState(snap.data().marginePercentuale ?? 15)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function setMargine(valore) {
    await setDoc(doc(db, ...REF), { marginePercentuale: Number(valore) }, { merge: true })
  }

  return { margine, loading, setMargine }
}
