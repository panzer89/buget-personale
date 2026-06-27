import { useState } from 'react'
import { useCategorie } from './useCategorie'

function Categorie() {
  const { categorie, loading, aggiungiCategoria, rimuoviCategoria } = useCategorie()
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('spesa')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    await aggiungiCategoria(nome.trim(), tipo)
    setNome('')
  }

  const entrate = categorie.filter((c) => c.tipo === 'entrata')
  const spese = categorie.filter((c) => c.tipo === 'spesa')

  return (
    <section className="categorie">
      <h2>Categorie</h2>
      <form onSubmit={handleSubmit} className="categoria-form">
        <input
          type="text"
          placeholder="Nome categoria"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="spesa">Spesa</option>
          <option value="entrata">Entrata</option>
        </select>
        <button type="submit">Aggiungi</button>
      </form>

      {loading ? (
        <p>Caricamento categorie...</p>
      ) : (
        <div className="categoria-liste">
          <div>
            <h3>Entrate</h3>
            <ul>
              {entrate.map((c) => (
                <li key={c.id}>
                  {c.nome}
                  <button className="del-btn" onClick={() => rimuoviCategoria(c.id)}>
                    ×
                  </button>
                </li>
              ))}
              {entrate.length === 0 && <li className="empty">Nessuna categoria</li>}
            </ul>
          </div>
          <div>
            <h3>Spese</h3>
            <ul>
              {spese.map((c) => (
                <li key={c.id}>
                  {c.nome}
                  <button className="del-btn" onClick={() => rimuoviCategoria(c.id)}>
                    ×
                  </button>
                </li>
              ))}
              {spese.length === 0 && <li className="empty">Nessuna categoria</li>}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

export default Categorie
