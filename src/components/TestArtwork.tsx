import type { TestCode } from '@/data/tests/types'

export default function TestArtwork({ code, className = '' }: { code: TestCode; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 120 100" fill="none" className={className}>
    {code === 'heymans' ? <>
      <path d="M59 89V43" stroke="currentColor" strokeWidth="2" />
      <path d="M59 66C24 72 17 48 25 23c28-2 43 18 34 43Z" fill="currentColor" opacity=".16" />
      <path d="M59 66C24 72 17 48 25 23c28-2 43 18 34 43ZM59 48C56 24 75 10 97 13c5 24-11 40-38 35Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="m36 39 23 27m0-18 24-23" stroke="currentColor" strokeWidth="1.3" />
    </> : code === 'chaside' ? <>
      <circle cx="60" cy="50" r="38" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="60" cy="50" r="28" stroke="currentColor" strokeDasharray="1 7" />
      <path d="m77 29-9 28-25 14 9-28 25-14Z" fill="currentColor" opacity=".16" />
      <path d="m77 29-9 28-25 14 9-28 25-14Zm-25 14 16 14" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="60" cy="50" r="3" fill="currentColor" />
    </> : <>
      <path d="M31 83V44a29 29 0 0 1 58 0v39M41 83V45a19 19 0 0 1 38 0v38M51 83V45a9 9 0 0 1 18 0v38" stroke="currentColor" strokeWidth="1.7" />
      <path d="M31 83V44a29 29 0 0 1 58 0v39Z" fill="currentColor" opacity=".09" />
      <circle cx="60" cy="66" r="5" fill="currentColor" />
    </>}
  </svg>
}
