import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; busy?: boolean }

export default function Button({ children, variant = 'primary', busy = false, className = '', disabled, ...props }: Props) {
  return <button className={`btn btn-${variant} ${className}`} disabled={disabled || busy} aria-busy={busy} {...props}>
    {busy ? <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}{children}
  </button>
}
