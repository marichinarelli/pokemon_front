import type { ReactNode } from 'react'

/** Lente azul e LEDs do topo do aparelho (decorativos). */
export function DexLights() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="dex-lens" />
      <span className="flex gap-1.5 self-start pt-1">
        <span className="dex-led dex-led-red" />
        <span className="dex-led dex-led-yellow" />
        <span className="dex-led dex-led-green" />
      </span>
    </div>
  )
}

/** Moldura escura com a "tela" clara do aparelho. */
export function DexScreen({ children }: { children: ReactNode }) {
  return (
    <div className="dex-screen">
      <div className="dex-screen-inner">{children}</div>
    </div>
  )
}

/** Aparelho compacto e centralizado, usado no login e no cadastro. */
export function DexCompact({ children }: { children: ReactNode }) {
  return (
    <main className="dex-compact mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <div className="dex-top">
        <DexLights />
        <span className="dex-title ml-auto text-white" aria-hidden="true">Pokédex</span>
      </div>
      <DexScreen>
        <div className="flex flex-col gap-4">{children}</div>
      </DexScreen>
    </main>
  )
}
