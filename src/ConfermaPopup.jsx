import { useEffect, useState } from 'react'
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

function ConfermaPopup() {
  const { categorie } = useCategorie()
  const { speseProgrammate, aggiornaStato, rimandaADomani } = useSpeseProgrammate()
  const { aggiungiMovimento } = useMovimenti()
  const [indice, setIndice] = useState(0)

  const oggi = oggiISO()
  const scadute = speseProgrammate.filter(
    (s) =>
      s.stato === 'in attesa' &&
      s.data <= oggi &&
      (!s.promemoriaDa || s.promemoriaDa <= oggi)
  )

  useEffect(() => {
    if (indice >= scadute.length) setIndice(0)
  }, [scadute.length, indice])

  if (scadute.length === 0) return null

  const corrente = scadute[Math.min(indice, scadute.length - 1)]

  function nomeCategoria(id) {
    return categorie.find((c) => c.id === id)?.nome || '—'
  }

  async function confermaPagata() {
    if (corrente.categoriaId) {
      await aggiungiMovimento({
        data: corrente.data,
        importo: corrente.importo,
        tipo: corrente.tipo,
        categoriaId: corrente.categoriaId,
        ricorrenza: 'nessuna',
        note: corrente.nome
      })
    }
    await aggiornaStato(corrente.id, 'confermata')
  }

  async function ignora() {
    await aggiornaStato(corrente.id, 'ignorata')
  }

  async function rimandaDomani() {
    await rimandaADomani(corrente.id)
  }

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h3>Spesa/entrata programmata</h3>
        <p>
          <strong>{corrente.nome}</strong>
          {corrente.categoriaId && ` · ${nomeCategoria(corrente.categoriaId)}`}
        </p>
        <p className="popup-data">Prevista per il {corrente.data}</p>
        <p className={`popup-importo ${corrente.tipo}`}>
          {corrente.tipo === 'entrata' ? '+' : '-'}€{corrente.importo.toFixed(2)}
        </p>
        <p className="popup-domanda">
          {corrente.tipo === 'entrata' ? 'Hai ricevuto questo importo?' : 'Hai effettuato questo pagamento?'}
        </p>
        <div className="popup-azioni">
          <button className="popup-conferma" onClick={confermaPagata}>Sì, confermo</button>
          <button className="popup-rimanda" onClick={rimandaDomani}>Richiedimelo domani</button>
          <button className="popup-ignora" onClick={ignora}>Ignora</button>
        </div>
        {scadute.length > 1 && (
          <p className="popup-contatore">{indice + 1} di {scadute.length}</p>
        )}
      </div>
    </div>
  )
}

export default ConfermaPopup
