export default function HeroArtwork() {
  return <div className="relative mx-auto w-full max-w-[440px]" aria-hidden="true">
    <svg viewBox="0 0 460 390" fill="none" className="w-full">
      <defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".8" fill="#245447" opacity=".16" /></pattern></defs>
      <circle cx="240" cy="192" r="169" fill="url(#dots)" />
      <path d="M219 334V144a82 82 0 1 1 164 0v81a109 109 0 0 1-109 109h-55Z" fill="#DCE4D2" />
      <path d="M121 307V140a87 87 0 0 1 174 0v164" stroke="#245447" strokeWidth="1.2" />
      <path d="M144 307V140a64 64 0 0 1 128 0v164M167 307V140a41 41 0 0 1 82 0v164M190 307V140a18 18 0 0 1 36 0v164" stroke="#245447" strokeWidth="1.2" opacity=".5" />
      <path d="M101 307h211" stroke="#245447" strokeWidth="1.2" />
      <circle cx="333" cy="95" r="36" fill="#D29B75" />
      <circle cx="333" cy="95" r="25" stroke="#F8F7F2" strokeWidth="1.2" />
      <path d="M333 83v24m-12-12h24m-20-8 16 16m0-16-16 16" stroke="#F8F7F2" strokeWidth="1.2" />
      <path d="M99 262c-27-3-33-22-27-41 19 0 33 13 27 41Zm0 0c-4-30 9-47 31-49 6 24-7 46-31 49Zm0 38v-58" fill="#245447" stroke="#245447" strokeWidth="1.5" />
      <circle cx="208" cy="274" r="13" fill="#245447" />
      <path d="M208 259V196m0 0 25-24m-25 24-25-24" stroke="#245447" strokeWidth="1.5" />
      <circle cx="183" cy="168" r="5" fill="#D29B75" /><circle cx="234" cy="168" r="5" fill="#D29B75" />
      <rect x="261" y="248" width="164" height="49" rx="24.5" fill="#F8F7F2" stroke="#DADFD3" />
      <circle cx="284" cy="272" r="10" fill="#E8EDDF" /><path d="m280 272 3 3 6-6" stroke="#245447" strokeWidth="1.5" />
      <text x="304" y="277" fill="#245447" fontSize="13" fontFamily="DM Sans, sans-serif">A tu propio ritmo.</text>
      <path d="m116 91-5-10m-6 18-11-3m32-17 1-10" stroke="#D29B75" strokeWidth="2" strokeLinecap="round" />
    </svg>
    <p className="absolute right-12 bottom-0 rotate-[-5deg] font-display text-xl text-muted">Cada persona, un mundo.</p>
  </div>
}
