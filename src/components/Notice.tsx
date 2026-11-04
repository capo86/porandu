import type { ReactNode } from 'react'
import Icon from '@/components/Icon'

export default function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div role={error ? 'alert' : undefined} className={`flex gap-3 rounded-xl border p-4 text-sm leading-relaxed ${error ? 'border-red-200 bg-red-50 text-red-900' : 'border-line bg-white/50 text-muted'}`}><Icon name={error ? 'question' : 'shield'} className="mt-0.5" /><div>{children}</div></div>
}
