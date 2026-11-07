"use client"

import HalftoneWordmarkFooter, { type HalftoneWordmarkFooterProps } from "./ui/halftone-wordmark-footer"

/**
 * O rodapé no fim de uma página escura da mesma cor, na largura toda (o width: 100% importa: dentro de um flex que
 * centraliza, um item com width: auto encolhe o canvas para 0 px). As props passam para o rodapé:
 * <HalftoneWordmarkFooterDemo wordmark="estudio" dotGap={8} />, por exemplo.
 */
export default function HalftoneWordmarkFooterDemo(props: HalftoneWordmarkFooterProps) {
  return (
    <div className="hwf-demo">
      <style>{DEMO_CSS}</style>
      <HalftoneWordmarkFooter {...props} />
    </div>
  )
}

const DEMO_CSS = `
.hwf-demo {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-sizing: border-box;
  width: 100%;
  min-height: 100svh;
  background: #0c0c0b;
}
`
