import { Link } from 'react-router-dom'
import Icon from '@/components/Icon'

export default function Brand() {
  return <Link to="/" aria-label="porandu, inicio" className="inline-flex items-center gap-2.5 text-forest"><span className="grid size-9 place-items-center rounded-full bg-forest text-sage"><Icon name="leaf" className="size-5" /></span><span className="text-[27px] font-semibold tracking-[-1.3px]">porandu<span className="text-clay">.</span></span></Link>
}
