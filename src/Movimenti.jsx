import { useMemo, useState } from 'react'
import { useCategorie } from './useCategorie'
import { useMovimenti } from './useMovimenti'

function oggiISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const giorno = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${giorno}`
}

function Movimenti() {
  const { categorie } = useCategorie()
  const { movimenti, loading, aggiungiMovimento, rimuoviMovimento } = useMovimenti()

  const [tipo, setTipo] = useState('spesa')
  const [importo, setImporto] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [data, setData] = useState(oggiISO())
  const [ricorrenza, setRicorrenza] = useState('nessuna')
  const [descrizione, setDescrizione] = useState('')

  const [filtroMese, setFiltroMese] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  const categorieFiltrate = categorie.filter((c) => c.tipo === tipo)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!importo || !categoriaId) return
    await aggiungiMovimento({ data, importo, tipo, categoriaId, ricorrenza, note: descrizione })
    setImporto('')
    setDescrizione('')
  }

  const movimentiFiltrati = useMemo(() => {
    return movimenti.filter((m) => {
      if (filtroMese && !m.data.startsWith(filtroMese)) return false
      if (filtroCategoria && m.categoriaId !== filtroCategoria) return false
      if (filtroTipo && m.tipo !== filtroTipo) return false
      return true
    })
  }, [movimenti, filtroMese, filtroCategoria, filtroTipo])

  function nomeCategoria(id) {
    return categorie.find((c) => c.id === id)?.nome || '—'
  }

  return (
    <section className="movimenti">
      <h2>Nuovo movimento</h2>
      <form onSubmit={handleSubmit} className="movimento-form">
        <div className="row">
          <input
            type="text"
            placeholder="Descrizione (es. Spesa supermercato)"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Importo €"
            value={importo}
            onChange={(e) => setImporto(e.target.value)}
            required
          />
        </div>
        <div className="row">
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
          <select value={tipo} onChange={(e) => { setTipo(e.target.value); setCategoriaId('') }}>
            <option value="spesa">Spesa</option>
            <option value="entrata">Entrata</option>
          </select>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            <option value="">Categoria...</option>
            {categorieFiltrate.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div className="row">
          <select value={ricorrenza} onChange={(e) => setRicorrenza(e.target.value)}>
            <option value="nessuna">Una tantum</option>
            <option value="mensile">Ricorrenza mensile</option>
            <option value="annuale">Ricorrenza annuale</option>
          </select>
        </div>
        <button type="submit">Aggiungi movimento</button>
      </form>

      <h2>Movimenti</h2>
      <div className="filtri">
        <input
          type="month"
          value={filtroMese}
          onChange={(e) => setFiltroMese(e.target.value)}
        />
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="">Tutte le categorie</option>
          {categorie.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Tutti i tipi</option>
          <option value="entrata">Entrate</option>
          <option value="spesa">Spese</option>
        </select>
      </div>

      {loading ? (
        <p>Caricamento movimenti...</p>
      ) : (
        <ul className="movimento-lista">
          {movimentiFiltrati.map((m) => (
            <li key={m.id} className={m.tipo}>
              <div>
                <strong>{m.note || nomeCategoria(m.categoriaId)}</strong>
                <span className="data">
                  {m.data} · {nomeCategoria(m.categoriaId)}
                </span>
                {m.ricorrenza !== 'nessuna' && (
                  <span className="badge">{m.ricorrenza}</span>
                )}
              </div>
              <div className="importo-azioni">
                <span className="importo">
                  {m.tipo === 'entrata' ? '+' : '-'}€{m.importo.toFixed(2)}
                </span>
                <button className="del-btn" onClick={() => rimuoviMovimento(m.id)}>×</button>
              </div>
            </li>
          ))}
          {movimentiFiltrati.length === 0 && <li className="empty">Nessun movimento</li>}
        </ul>
      )}
    </section>
  )
}

export default Movimenti
