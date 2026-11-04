import { Link } from 'react-router-dom'

export default function RouteError() {
  return <div className="narrow-shell py-20"><h1 className="page-title">Necesitamos una pausa.</h1><p className="mt-4 text-muted">No pudimos cargar la página. Revisá tu conexión e intentá de nuevo.</p><div className="mt-7 flex gap-3"><button onClick={() => window.location.reload()} className="btn btn-primary">Recargar página</button><Link to="/" className="btn btn-secondary">Volver al inicio</Link></div></div>
}
