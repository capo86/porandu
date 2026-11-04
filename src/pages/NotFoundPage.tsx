import { Link } from 'react-router-dom'

export function Component() {
  return <div className="narrow-shell py-24"><p className="eyebrow mb-4">404 · NOS SALIMOS DEL CAMINO</p><h1 className="page-title">Por acá todavía no.</h1><p className="mt-5 text-muted">No encontramos la página que buscás.</p><Link to="/" className="btn btn-primary mt-8">Volver al inicio</Link></div>
}
