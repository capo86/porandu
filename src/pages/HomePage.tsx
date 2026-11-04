import { Link } from 'react-router-dom'
import Icon from '@/components/Icon'
import HeroArtwork from '@/components/HeroArtwork'
import TestArtwork from '@/components/TestArtwork'
import { catalog } from '@/data/tests/catalog'

const tones = {
  heymans: 'bg-[#e9eddf] text-[#4d6243]',
  chaside: 'bg-[#f2e5d8] text-[#9a623e]',
  eysenck: 'bg-[#e5e9ed] text-[#4f6476]',
}
const steps = [
  ['Recibí tu enlace privado', 'Tu profesional te facilita el enlace correspondiente al cuestionario.'],
  ['Tomate un momento para vos', 'Abrí el enlace y respondé con tranquilidad.'],
  ['Guardá tu recorrido', 'Con tu enlace privado podés retomar el test y consultar el estado del resultado.'],
]

export function Component() {
  return <div>
    <section className="page-shell grid items-center gap-6 pt-12 pb-14 sm:pt-16 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:pt-18 lg:pb-18">
      <div className="animate-enter">
        <p className="eyebrow mb-6 flex items-center gap-2"><span className="size-1.5 rounded-full bg-clay" /> UN ESPACIO PARA VOS</p>
        <h1 className="max-w-3xl font-display text-[clamp(2.9rem,4.7vw,4.25rem)] leading-[1.08] tracking-[-.035em]">Conocerte empieza<br />con una <span className="text-forest italic">pregunta.</span></h1>
        <p className="mt-6 max-w-[420px] text-base leading-7 text-muted sm:text-lg">A veces, hacer una pausa es el primer paso. Explorá tu forma de ser y tus intereses, a tu ritmo.</p>
        <div className="mt-8 flex flex-wrap items-center gap-5"><a href="#tests" className="btn btn-primary">Encontrá tu test<Icon name="arrow" /></a><span className="flex items-center gap-2 text-xs text-muted"><Icon name="lock" className="size-4" />Sin crear una cuenta</span></div>
      </div>
      <div className="animate-enter hidden lg:block" style={{ animationDelay: '120ms' }}><HeroArtwork /></div>
    </section>
    <div className="border-y border-line bg-[#eeefe7]/60"><div className="page-shell grid grid-cols-1 gap-3 py-4 text-xs text-muted min-[480px]:grid-cols-3 sm:text-sm"><span className="flex items-center justify-center gap-2"><Icon name="shield" className="size-4" />Tu recorrido es privado</span><span className="flex items-center justify-center gap-2"><Icon name="clock" className="size-4" />Sin apuro, a tu ritmo</span><span className="flex items-center justify-center gap-2"><Icon name="leaf" className="size-4" />Un paso para conocerte</span></div></div>
    <section id="tests" className="page-shell scroll-mt-8 pt-14 sm:pt-18">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow mb-3">TRES CAMINOS PARA EXPLORAR</p><h2 className="font-display text-3xl tracking-[-.02em] sm:text-[38px]">¿Por dónde querés empezar?</h2></div><p className="max-w-[260px] text-sm leading-6 text-muted">No hay respuestas buenas o malas.<br className="hidden sm:block" /> Solo las que más se parecen a vos.</p></div>
      <div className="grid gap-5 md:grid-cols-3">
        {catalog.map((test, index) => <article key={test.code} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white/60 transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_-20px_#24544755] motion-reduce:transform-none">
          <div className={`relative flex h-40 items-center justify-center ${tones[test.code]}`}><span className="absolute top-5 left-5 text-[11px] tracking-[.14em] opacity-70">0{index + 1} / EXPLORÁ</span><TestArtwork code={test.code} className="mt-3 h-30 w-36 transition-transform duration-500 group-hover:scale-105" /><span className="absolute right-5 bottom-4 rounded-full border border-current/20 px-2.5 py-1 text-[10px]">{test.category}</span></div>
          <div className="flex flex-1 flex-col p-6"><h3 className="font-display text-[29px]">{test.name}</h3><p className="mt-2 mb-6 flex-1 text-sm leading-6 text-muted">{test.description}</p><div className="mb-5 flex items-center gap-2 text-xs text-muted"><Icon name="question" className="size-3.5" />{test.itemCount} preguntas<span className="mx-1 text-line">/</span>{test.code === 'heymans' ? 'Elegí X o Z' : 'Respuestas sí o no'}</div><Link to={`/tests/${test.code}`} aria-label={`Conocer el test ${test.name}`} className="flex min-h-11 items-center justify-between border-t border-line pt-4 text-sm font-medium text-forest">Conocer el test<Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" /></Link></div>
        </article>)}
      </div>
      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted"><Icon name="question" className="mt-0.5 size-4" />Para completar un cuestionario necesitás un enlace de tu profesional. La corrección está pendiente de validación profesional.</p>
    </section>
    <section id="como-funciona" className="page-shell scroll-mt-8 pt-20 sm:pt-24"><div className="grid gap-10 border-t border-line pt-12 lg:grid-cols-[.9fr_1.4fr]"><div><p className="eyebrow mb-4">SENCILLO, DE PRINCIPIO A FIN</p><h2 className="max-w-sm font-display text-3xl leading-tight sm:text-[38px]">Un momento para vos,<br /><span className="text-forest italic">paso a paso.</span></h2><p className="mt-4 max-w-xs text-sm leading-6 text-muted">Buscá un lugar tranquilo. No necesitás prepararte: alcanza con responder con sinceridad.</p></div><ol className="space-y-7">{steps.map(([title, text], index) => <li key={title} className="flex gap-5"><span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line font-display text-lg text-forest">{index + 1}</span><div><h3 className="mb-1 text-sm font-semibold">{title}</h3><p className="max-w-md text-sm leading-6 text-muted">{text}</p></div></li>)}</ol></div></section>
  </div>
}
