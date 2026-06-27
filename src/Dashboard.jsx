import { useMemo, useState } from 'react'
import { useCategorie } from './useCategorie'
import { useMovimenti } from './useMovimenti'
import { useImpostazioni } from './useImpostazioni'
import { useSpeseProgrammate } from './useSpeseProgrammate'

function meseCorrente() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function Dashboard() {
  const { categorie } = useCategorie()
  const { movimenti, loading } = useMovimenti()
  const { margine, setMargine } = useImpostazioni()
  const { speseProgrammate } = useSpeseProgrammate()
  const [mese, setMese] = useState(meseCorrente())

  function nomeCategoria(id) {
    return categorie.find((c) => c.id === id)?.nome || '—'
  }

  const movimentiMese = useMemo(
    () => movimenti.filter((m) => m.data.startsWith(mese)),
    [movimenti, mese]
  )

  const totaleEntrate = movimentiMese
    .filter((m) => m.tipo === 'entrata')
    .reduce((sum, m) => sum + m.importo, 0)

  const totaleSpese = movimentiMese
    .filter((m) => m.tipo === 'spesa')
    .reduce((sum, m) => sum + m.importo, 0)

  const saldo = totaleEntrate - totaleSpese

  const saldoTotale = useMemo(() => {
    return movimenti.reduce(
      (sum, m) => sum + (m.tipo === 'entrata' ? m.importo : -m.importo),
      0
    )
  }, [movimenti])

  const budgetDisponibile = totaleEntrate * (1 - margine / 100)
  const puoiSpendere = budgetDisponibile - totaleSpese

  const speseCategoria = useMemo(() => {
    const map = {}
    movimentiMese
      .filter((m) => m.tipo === 'spesa')
      .forEach((m) => {
        map[m.categoriaId] = (map[m.categoriaId] || 0) + m.importo
      })
    return Object.entries(map)
      .map(([categoriaId, importo]) => ({ categoriaId, importo }))
      .sort((a, b) => b.importo - a.importo)
  }, [movimentiMese])

  // Proiezione annuale: movimenti ricorrenti mensili * 12 mesi rimanenti dall'inizio anno,
  // + movimenti ricorrenti annuali, + movimenti una tantum già registrati nell'anno.
  const annoCorrente = mese.slice(0, 4)
  const proiezione = useMemo(() => {
    const movimentiAnno = movimenti.filter((m) => m.data.startsWith(annoCorrente))

    let entrateAnno = 0
    let speseAnno = 0

    movimentiAnno.forEach((m) => {
      if (m.ricorrenza === 'mensile') {
        const valoreAnnuo = m.importo * 12
        if (m.tipo === 'entrata') entrateAnno += valoreAnnuo
        else speseAnno += valoreAnnuo
      } else {
        if (m.tipo === 'entrata') entrateAnno += m.importo
        else speseAnno += m.importo
      }
    })

    // Le spese/entrate programmate in attesa sono già occorrenze singole
    // (la ricorrenza mensile è già espansa in più voci), quindi si somma il valore puro.
    const programmateAnno = speseProgrammate.filter(
      (s) => s.stato === 'in attesa' && s.data.startsWith(annoCorrente)
    )
    programmateAnno.forEach((s) => {
      if (s.tipo === 'entrata') entrateAnno += s.importo
      else speseAnno += s.importo
    })

    return { entrateAnno, speseAnno, saldoAnno: entrateAnno - speseAnno }
  }, [movimenti, speseProgrammate, annoCorrente])

  if (loading) return <p>Caricamento dashboard...</p>

  return (
    <section className="dashboard">
      <div className="mese-selector">
        <input
          type="month"
          value={mese}
          onChange={(e) => setMese(e.target.value)}
        />
      </div>

      <div className="riepilogo-cards">
        <div className="card entrata">
          <span className="label">Entrate</span>
          <span className="valore">€{totaleEntrate.toFixed(2)}</span>
        </div>
        <div className="card spesa">
          <span className="label">Spese</span>
          <span className="valore">€{totaleSpese.toFixed(2)}</span>
        </div>
        <div className={`card saldo ${saldo >= 0 ? 'positivo' : 'negativo'}`}>
          <span className="label">Saldo mensile</span>
          <span className="valore">€{saldo.toFixed(2)}</span>
        </div>
      </div>

      <div className={`card saldo-totale ${saldoTotale >= 0 ? 'positivo' : 'negativo'}`}>
        <span className="label">Saldo totale (tutti i movimenti)</span>
        <span className="valore">€{saldoTotale.toFixed(2)}</span>
      </div>

      <div className="analisi-box">
        <div className="analisi-header">
          <h3>Quanto puoi ancora spendere questo mese?</h3>
          <label className="margine-input">
            Margine di sicurezza
            <input
              type="number"
              min="0"
              max="100"
              value={margine}
              onChange={(e) => setMargine(e.target.value)}
            />
            %
          </label>
        </div>
        <p className={`analisi-valore ${puoiSpendere >= 0 ? 'positivo' : 'negativo'}`}>
          €{puoiSpendere.toFixed(2)}
        </p>
        <p className="hint">
          Calcolato come entrate del mese meno il {margine}% da tenere da parte, meno le
          spese già registrate questo mese.
        </p>
      </div>

      <h3>Spese per categoria</h3>
      {speseCategoria.length === 0 ? (
        <p className="empty">Nessuna spesa questo mese</p>
      ) : (
        <ul className="breakdown">
          {speseCategoria.map((s) => {
            const perc = totaleSpese > 0 ? (s.importo / totaleSpese) * 100 : 0
            return (
              <li key={s.categoriaId}>
                <div className="breakdown-row">
                  <span>{nomeCategoria(s.categoriaId)}</span>
                  <span>€{s.importo.toFixed(2)} ({perc.toFixed(0)}%)</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${perc}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <h3>Proiezione anno {annoCorrente}</h3>
      <div className="riepilogo-cards">
        <div className="card entrata">
          <span className="label">Entrate stimate</span>
          <span className="valore">€{proiezione.entrateAnno.toFixed(2)}</span>
        </div>
        <div className="card spesa">
          <span className="label">Spese stimate</span>
          <span className="valore">€{proiezione.speseAnno.toFixed(2)}</span>
        </div>
        <div className={`card saldo ${proiezione.saldoAnno >= 0 ? 'positivo' : 'negativo'}`}>
          <span className="label">Saldo stimato</span>
          <span className="valore">€{proiezione.saldoAnno.toFixed(2)}</span>
        </div>
      </div>
      <p className="hint">
        La proiezione moltiplica per 12 i movimenti con ricorrenza mensile registrati
        nell'anno, somma quelli annuali/una tantum già inseriti, e include anche le
        spese/entrate programmate ancora in attesa di conferma.
      </p>
    </section>
  )
}

export default Dashboard
