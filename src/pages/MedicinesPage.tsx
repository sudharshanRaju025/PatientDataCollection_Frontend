import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError, api, isAbortError } from '../api/client'
import { money } from '../lib/format'
import type { MedicineList } from '../types/pharmacy'

export function MedicinesPage() {
  const [params, setParams] = useSearchParams()
  const lowOnly = params.get('low') === '1'
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [list, setList] = useState<MedicineList | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebounced(query.trim())
      setPage(1)
    }, 250)
    return () => window.clearTimeout(handle)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    const search = new URLSearchParams({
      search: debounced,
      lowStock: String(lowOnly),
      page: String(page),
      pageSize: '10'
    })
    api<MedicineList>(`/api/medicines?${search.toString()}`, { signal: controller.signal })
      .then((next) => {
        setList(next)
        setError('')
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return
        setError(caught instanceof ApiError ? caught.message : 'The formulary could not be loaded.')
      })
    return () => controller.abort()
  }, [debounced, lowOnly, page])

  const total = list?.total ?? 0
  const pageSize = list?.pageSize ?? 10
  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="page rise">
      <header className="page-head">
        <div>
          <p className="eyebrow">Formulary</p>
          <h1>Medicine shelf</h1>
        </div>
        <Link className="button primary" to="/medicines/new">Add medicine</Link>
      </header>
      <section className="panel">
        <div className="toolbar">
          <label className="search">
            <span className="sr-only">Search medicines</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, generic, category, or maker" />
          </label>
          <button className={lowOnly ? 'chip on' : 'chip'} type="button" onClick={() => { setParams(lowOnly ? {} : { low: '1' }); setPage(1) }}>
            Low stock
          </button>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="registry">
          {list?.items.map((medicine) => (
            <Link key={medicine.id} className="registry-row medicine-row" to={`/medicines/${medicine.id}/edit`}>
              <span className="who">
                <strong>{medicine.name}</strong>
                <small>{medicine.genericName}</small>
              </span>
              <span className="meta">{medicine.strength}<br />{medicine.form}</span>
              <span className="meta">{medicine.category}<br />{medicine.manufacturer}</span>
              <span className={medicine.lowStock ? 'status low' : 'status on'}>{medicine.stockQuantity} in stock</span>
              <span className="when">{money(medicine.unitPrice)}<br /><em>Reorder at {medicine.reorderLevel}</em></span>
            </Link>
          ))}
          {list && total === 0 ? <div className="empty"><h2>Nothing on this shelf</h2><p>Add a medicine or clear the filter.</p></div> : null}
        </div>
        <footer className="pager">
          <span>{total === 0 ? 'No medicines' : `${total} stocked`}</span>
          <div>
            <button className="button ghost" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
            <button className="button ghost" type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </footer>
      </section>
    </div>
  )
}
