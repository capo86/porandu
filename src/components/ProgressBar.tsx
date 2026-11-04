export default function ProgressBar({ answered, total }: { answered: number; total: number }) {
  const percent = Math.round(answered / total * 100)
  return <div><div className="mb-2 flex justify-between gap-3 text-xs text-muted"><span>{answered} de {total} respuestas</span><span>{percent}% completado</span></div><div role="progressbar" aria-label="Preguntas respondidas" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={total} className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-forest transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${percent}%` }} /></div></div>
}
