import type { CSSProperties } from 'react'

const paths = {
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  check: 'm5 12 4 4L19 6',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3',
  shield: 'M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7l-9-4Zm-4 9 3 3 5-6',
  clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  leaf: 'M12 22V11m0 5C3 17 2 10 3 5c7-1 11 4 9 11Zm0-6C12 3 16 1 21 2c1 6-2 10-9 8Z',
  copy: 'M9 9h12v12H9zM15 9V3H3v12h6',
  external: 'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',
  question: 'M9 8a3 3 0 1 1 5 2.2c-1.6 1.1-2 1.3-2 3.8m0 3v.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  close: 'm6 6 12 12M6 18 18 6',
} as const

export default function Icon({ name, className = '', style }: { name: keyof typeof paths; className?: string; style?: CSSProperties }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`size-5 shrink-0 ${className}`} style={style}><path d={paths[name]} /></svg>
}
