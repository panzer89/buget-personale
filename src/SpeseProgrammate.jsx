import { useState } from 'react'
import { useCategorie } from './useCategorie'
import { useSpeseProgrammate } from './useSpeseProgrammate'
import { useMovimenti } from './useMovimenti'

function oggiISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const giorno = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${giorno}`
}

function SpeseProgrammate() {
  const { categorie } = useCategorie()
  const {
    speseProgrammate,
    loading,
    aggiungiSpesaProgrammata,
    aggiornaStato,
    rimuoviSpesaProgrammata
  } = useSpeseProgrammate()
  const { aggiungiMovimento } = useMovimenti()

  const [nome, setNome] = useState('')
  const [importo, setImporto] = useState('')
  const [data, setData] = useState(oggiISO())
  const [tipo, setTipo] = useState('spesa')
  const [categoriaId, setCategoriaId] = useState('')
  const [ricorrenza, setRicorrenza] = useState('nessuna')

  const categorieFiltrate = categorie.filter((c) => c.tipo === tipo)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim() || !importo) return
    await aggiungiSpesaProgrammata({ nome: nome.trim(), importo, data, tipo, categoriaId, ricorrenza })
    setNome('')
    setImporto('')
  }

  async function confermaOra(sp) {
    if (sp.categoriaId) {
      await aggiungiMovimento({
        data: sp.data,
        importo: sp.importo,
        tipo: sp.tipo,
        categoriaId: sp.categoriaId,
        ricorrenza: 'nessuna',
        note: sp.nome
      })
    }
    await aggiornaStato(sp.id, 'confermata')
  }

  function nomeCategoria(id) {
    return categorie.find((c) => c.id === id)?.nome || '—'
  }

  const inAttesa = speseProgrammate.filter((s) => s.stato === 'in attesa')
  const concluse = speseProgrammate.filter((s) => s.stato !== 'in attesa')

  return (
    <section className="programmate">
      <h2>Nuova spesa/entrata programmata</h2>
      <form onSubmit={handleSubmit} className="programmata-form">
        <div className="row">
          <input
            type="text"
            placeholder="Descrizione (es. Bollo auto)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
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
          <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">Categoria (opzionale)</option>
            {categorieFiltrate.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div className="row">
          <select value={ricorrenza} onChange={(e) => setRicorrenza(e.target.value)}>
            <option value="nessuna">Nessuna ricorrenza</option>
            <option value="mensile">Mensile (fino a fine anno)</option>
            <option value="annuale">Annuale</option>
          </select>
        </div>
        <button type="submit">Programma</button>
      </form>

      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <>
          <h3>In attesa</h3>
          <ul className="programmata-lista">
            {inAttesa.map((s) => (
              <li key={s.id} className={s.tipo}>
                <div>
                  <strong>{s.nome}</strong>
                  <span className="data">{s.data} {s.categoriaId && `· ${nomeCategoria(s.categoriaId)}`}</span>
                  {s.ricorrenza && s.ricorrenza !== 'nessuna' && (
                    <span className="badge">{s.ricorrenza}</span>
                  )}
                </div>
                <div className="importo-azioni">
                  <span className="importo">
                    {s.tipo === 'entrata' ? '+' : '-'}€{s.importo.toFixed(2)}
                  </span>
                  <button className="conferma-btn" onClick={() => confermaOra(s)}>Conferma</button>
                  <button className="del-btn" onClick={() => rimuoviSpesaProgrammata(s.id)}>×</button>
                </div>
              </li>
            ))}
            {inAttesa.length === 0 && <li className="empty">Nessuna spesa programmata in attesa</li>}
          </ul>

          {concluse.length > 0 && (
            <>
              <h3>Concluse</h3>
              <ul className="programmata-lista">
                {concluse.map((s) => (
                  <li key={s.id} className={`${s.tipo} conclusa`}>
                    <div>
                      <strong>{s.nome}</strong>
                      <span className="data">{s.data} · {s.stato}</span>
                    </div>
                    <div className="importo-azioni">
                      <span className="importo">
                        {s.tipo === 'entrata' ? '+' : '-'}€{s.importo.toFixed(2)}
                      </span>
                      <button className="del-btn" onClick={() => rimuoviSpesaProgrammata(s.id)}>×</button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default SpeseProgrammate
