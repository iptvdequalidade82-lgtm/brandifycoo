"use client"

import * as React from "react"

/**
 * Works Wheel — um índice de portfólio que é uma roda que se gira.
 *
 * Parada, a roda é um anel de cartões em volta de um título, cada cartão tangente ao círculo. O primeiro giro da
 * rolagem abre o anel num tambor vertical: o cartão da frente fica reto e no tamanho cheio, e os de cima e de baixo
 * giram para longe em perspectiva forte e saem pelas bordas. Continuando a girar, o tambor traz a próxima peça para a
 * frente. O nome da peça da frente aparece à esquerda dela, e a lista à direita leva direto a cada uma.
 *
 * Tudo é um número só, turn: 0 é o anel, 1 é o tambor com a peça 0 na frente, e cada inteiro depois disso é mais uma
 * peça girada. Uma passada por quadro aproxima turn do alvo e escreve os transforms direto no DOM, sem render do React;
 * com a roda parada, o laço dorme.
 *
 * Gira com a rolagem do mouse ou do trackpad (nas pontas, a rolagem volta para a página), arrastando (com o dedo, no
 * celular), com as setas ↑ e ↓ e pela lista. Um clique num cartão que não está na frente gira a roda até ele; no da
 * frente, o link segue. Com autoPlay, a roda gira sozinha em loop enquanto está na tela, até alguém mexer nela. Com
 * "reduzir movimento" ligado no sistema, ela vai direto para o lugar, sem deslizar, e o autoPlay não roda.
 *
 * Tudo se mede pelo tamanho da roda, não da tela, inclusive o texto (com um piso de leitura): ela funciona numa seção,
 * num cartão ou na tela inteira. Autocontido: o React é o único import. Sem Tailwind, sem bibliotecas, sem arquivo CSS.
 */

export interface WorksWheelItem {
  /** O nome da peça: ao lado do cartão da frente e na lista. */
  title: string
  /** A capa. Qualquer src que um <img> aceita. */
  image: string
  /** O texto da capa para o leitor de tela. Sem ele, vale o título. */
  alt?: string
  /** Para onde o cartão leva. Sem href, a roda só mostra. */
  href?: string
}

export interface WorksWheelProps extends Omit<React.ComponentPropsWithoutRef<"section">, "children"> {
  items: WorksWheelItem[]
  /** O título no meio do anel. */
  label?: string
  /** O selo que aparece no hover dos cartões com link. Vazio, sem selo. */
  action?: string
  /** As cores: para fundo escuro (o padrão) ou claro. */
  theme?: "dark" | "light"
  /** A roda gira sozinha em loop enquanto está na tela, até alguém mexer nela. */
  autoPlay?: boolean
  /** Com autoPlay, os milissegundos em cada parada (no anel, uma vez e meia isso). */
  interval?: number
  /** Drive the wheel using the scroll of the page instead of a nested wheel listener. */
  scrollDriven?: boolean
}

/* A geometria. O cartão se mede pela roda; todo o resto se mede pelo cartão, então numa roda estreita, em que o cartão
   é limitado pela largura e não pela altura, a roda inteira encolhe junto, em vez de sobrar um cartão pequeno girando
   num tambor enorme. Os três que importam andam juntos: STEP contra DRUM diz o quanto os vizinhos giram para longe, e
   DRUM contra LENS decide se eles caem dentro do quadro ou saem por ele. */
const CARD_H = 0.38 // a altura do cartão da frente, em relação à roda
const CARD_MAX_W = 0.34 // ... mas nunca mais largo que isto da largura da roda
const CARD_RATIO = 1.45 // largura / altura do cartão
const STEP = 40 // graus entre os cartões no tambor
const DRUM = 2.22 // o raio do tambor, em alturas de cartão (e tudo daqui para baixo também)
const LENS = 2.7 // a distância da perspectiva
const RING_R = 1.14 // o raio do anel
/* Sozinho, o tambor penduraria as peças num fio de prumo. Mas a faixa se curva num arco com o centro à ESQUERDA: a peça
   da frente fica no ponto do arco mais perto de quem olha, bem no centro, e as vizinhas já voltaram para a esquerda,
   além de subir e descer. BOW é o raio desse arco; é ele que faz a diferença entre uma pilha de cartões e uma roda
   vista de lado. */
const BOW = 1.82
const TITLE = 0.124 // o título do anel e o da peça da frente
const INDEX = 0.04 // a lista à direita
/** O piso das letras, em px: numa roda pequena (a de um celular) a lista ficaria com 3 px. */
const MIN_TITLE = 16
const MIN_INDEX = 11
/** Quantas peças de cada lado da frente ainda vale desenhar. Depois disso o cartão está de lado, e mais adiante ele se
    empilharia no ponto de fuga. */
const CULL = 1.6

/** Quanto de rolagem (em px) vale uma peça. */
const WHEEL_UNITS = 900
/** Quanto de arraste vale uma peça, em alturas da roda como ela aparece na tela: em px fixos, numa roda pequena (a de um
    celular, ou uma encolhida com transform: scale) o dedo atravessaria a roda inteira sem girar uma peça. */
const DRAG_SHARE = 0.45
/** O silêncio depois da última rolagem antes de a roda assentar numa peça, em ms. */
const SETTLE = 140
/** A menor rolagem, em peças, que ainda conta como um gesto (abaixo disso, o tremor do trackpad volta para onde estava). */
const MIN_GESTURE = 0.04
/** A fração da distância que falta fechada a cada quadro (de 60 Hz; em telas mais rápidas, a mesma velocidade). */
const EASE = 0.12
/** Quanto o ponteiro anda, em px, antes de virar arraste: menos que isso é clique. */
const DRAG_SLOP = 4
/** O menor arraste, em peças, que ao soltar ainda leva à peça seguinte (abaixo disso, a roda volta para onde estava). */
const MIN_DRAG = 0.1

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rad = (deg: number) => (deg * Math.PI) / 180

/** O quanto o arco levou para a esquerda uma peça que girou drumDeg para longe da frente. Zero na frente, então a peça
    que se está lendo fica no centro. */
const bowAt = (drumDeg: number, bow: number) => -bow * (1 - Math.cos(rad(drumDeg)))

/** Os dois estados numa cadeia só: os termos do anel somem conforme m chega ao tambor, e os do tambor ainda são zero
    enquanto o anel está montado. O arco vem primeiro, no plano da própria roda, então ele desliza o cartão para o lado
    em vez de girar junto, e a perspectiva continua encolhendo o cartão com a distância. */
function place(ringDeg: number, drumDeg: number, ringR: number, drumR: number, bow: number, m: number) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  )
}

// no servidor não há layout: lá o efeito comum, para o React 18 não reclamar
const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

type Stage = { w: number; h: number }

export function WorksWheel({
  items,
  label = "Obras '26",
  action = "Ver",
  theme = "dark",
  autoPlay = false,
  interval = 1800,
  scrollDriven = false,
  className,
  ...props
}: WorksWheelProps) {
  const uid = React.useId()
  const stageRef = React.useRef<HTMLDivElement>(null)
  const wheelRef = React.useRef<HTMLDivElement>(null)
  const cardRefs = React.useRef<(HTMLElement | null)[]>([])
  const labelRef = React.useRef<HTMLDivElement>(null)
  const titleRef = React.useRef<HTMLDivElement>(null)

  // Onde a roda está e para onde ela vai. Só a peça da frente (active) é estado: o resto vai direto para o DOM, então
  // girar a roda não é render.
  const turn = React.useRef(0)
  const target = React.useRef(0)
  const wake = React.useRef<() => void>(() => {})
  const [active, setActive] = React.useState(0)
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 })

  // o arraste em andamento, e se o último gesto foi arraste (o clique que vem logo depois dele não vale)
  // (px: quanto vale uma peça na tela; from: a peça em que o arraste começou)
  const drag = React.useRef<{ id: number; y: number; start: number; px: number; from: number; moved: boolean } | null>(null)
  const dragged = React.useRef(false)
  // alguém mexeu na roda: o autoPlay para
  const taken = React.useRef(false)

  const count = items.length
  const last = Math.max(count - 1, 0)

  // Lido depois da montagem, não no render: no servidor não há matchMedia, e decidir por ele no render daria erro de
  // hidratação. Com "reduzir movimento", a roda vai direto para onde foi mandada, em vez de deslizar até lá.
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const read = () => setReduced(query.matches)
    read()
    query.addEventListener("change", read)
    return () => query.removeEventListener("change", read)
  }, [])

  // o tamanho da roda pelo clientWidth e pelo clientHeight, que não mudam com um transform: scale em volta
  React.useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const metrics = React.useMemo(() => {
    const { w, h } = stage
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * CARD_MAX_W)
    const cardH = cardW / CARD_RATIO
    const ringR = cardH * RING_R
    // os cartões do anel encolhem até o círculo parecer um laço fechado, e não contas num fio, com qualquer número
    // de peças
    const ringScale = count ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1) : 1
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR: cardH * DRUM,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: Math.max(cardH * TITLE, MIN_TITLE),
      index: Math.max(cardH * INDEX, MIN_INDEX),
    }
  }, [stage, count])

  // Uma passada por quadro: aproxima turn do alvo e escreve todos os transforms. Quando turn chega ao alvo, o laço
  // dorme até o próximo to().
  useIsoLayoutEffect(() => {
    if (!stage.h) return
    const { ringR, ringScale, drumR, bow } = metrics
    let frame = 0
    let then = 0

    const paint = () => {
      const t = turn.current
      const m = clamp(t, 0, 1)
      const pos = Math.max(0, t - 1)

      // O tambor recua para a face da frente cair no plano da imagem. O recuo tem de chegar junto com o tambor, ou o
      // anel ficaria no fundo da perspectiva e apareceria com metade do tamanho.
      if (wheelRef.current) wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`

      for (let i = 0; i < count; i++) {
        const card = cardRefs.current[i]
        if (!card) continue
        const d = i - pos
        card.style.transform = place(d * (360 / count), d * STEP, ringR, drumR, bow, m)
        // Escondido pela distância, não pelo ângulo: numa volta inteira o lado de trás volta a ficar de frente, e tudo
        // depois das vizinhas cairia empilhado no ponto de fuga. Escondido também não pega clique.
        const hidden = m > 0.5 && Math.abs(d) > CULL
        card.style.opacity = hidden ? "0" : "1"
        card.style.visibility = hidden ? "hidden" : ""
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2))
        const face = card.firstElementChild as HTMLElement | null
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m)
      if (titleRef.current) titleRef.current.style.opacity = String(m)
      return clamp(Math.round(pos), 0, last)
    }

    const step = (now: number) => {
      frame = 0
      const dt = then ? Math.min((now - then) / 1000, 0.1) : 1 / 60
      then = now
      const gap = target.current - turn.current
      if (Math.abs(gap) < 0.0005) turn.current = target.current
      else turn.current += gap * (reduced ? 1 : 1 - Math.pow(1 - EASE, dt * 60))
      const near = paint()
      setActive((prev) => (prev === near ? prev : near))
      if (turn.current !== target.current) frame = requestAnimationFrame(step)
      else then = 0
    }

    wake.current = () => {
      if (!frame) frame = requestAnimationFrame(step)
    }
    paint()
    wake.current()
    return () => {
      cancelAnimationFrame(frame)
      wake.current = () => {}
    }
  }, [metrics, stage.h, count, last, reduced])

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1)
      wake.current()
    },
    [last],
  )

  // Continuous page scroll is the single source of truth. The section is pinned
  // by CSS but the browser keeps handling scroll and touch naturally.
  React.useEffect(() => {
    if (!scrollDriven) return
    const scene = stageRef.current?.closest<HTMLElement>("[data-ww-scroll-scene]")
    if (!scene) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = scene.getBoundingClientRect()
      const travel = Math.max(scene.offsetHeight - window.innerHeight, 1)
      const header = parseFloat(getComputedStyle(scene).getPropertyValue("--bcw-header")) || 80
      const progress = clamp((header - rect.top) / travel, 0, 1)
      to(progress * (last + 1))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(frame)
    }
  }, [scrollDriven, last, to])

  // The index and keyboard can seek within the story without changing the
  // navigation model: they move the document instead of a nested carousel.
  const navigateTo = React.useCallback((next: number) => {
    const step = clamp(next, 0, last + 1)
    if (!scrollDriven) return to(step)
    const scene = stageRef.current?.closest<HTMLElement>("[data-ww-scroll-scene]")
    if (!scene) return
    const sceneTop = window.scrollY + scene.getBoundingClientRect().top
    const travel = Math.max(scene.offsetHeight - window.innerHeight, 1)
    const header = parseFloat(getComputedStyle(scene).getPropertyValue("--bcw-header")) || 80
    window.scrollTo({ top: sceneTop - header + step / (last + 1) * travel, behavior: reduced ? "auto" : "smooth" })
  }, [scrollDriven, last, reduced, to])

  // Ouvinte nativo, porque a rolagem tem de poder ser cancelada; e ela só é cancelada enquanto a roda ainda tem para
  // onde ir, então nas pontas a página continua rolando em vez de prender quem lê.
  React.useEffect(() => {
    const el = stageRef.current
    if (!el || scrollDriven) return
    let settling = 0
    // onde a rajada de rolagem começou
    let from: number | null = null
    const onWheel = (event: WheelEvent) => {
      // em linhas (o Firefox, com mouse de roda) ou em páginas, convertido para px
      const dy = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * el.clientHeight : event.deltaY
      const next = target.current + dy / WHEEL_UNITS
      if (next > 0 && next < last + 1) event.preventDefault()
      taken.current = true
      if (from === null) from = Math.round(target.current)
      to(next)
      // Uma rolagem chega como uma rajada de eventos sem fim marcado, então a roda pararia no ponto em que ela parou de
      // chegar: entre dois cartões, sem nada na frente e com os dois vizinhos meio virados. Ela assenta numa peça, e
      // pelo menos uma adiante no sentido da rolagem: um dente da roda do mouse (100 px) já abre o anel ou troca a peça.
      window.clearTimeout(settling)
      settling = window.setTimeout(() => {
        const start = from ?? 0
        const moved = target.current - start
        const near = Math.round(target.current)
        from = null
        if (moved > MIN_GESTURE) to(Math.max(near, start + 1))
        else if (moved < -MIN_GESTURE) to(Math.min(near, start - 1))
        else to(near)
      }, SETTLE)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      el.removeEventListener("wheel", onWheel)
      window.clearTimeout(settling)
    }
  }, [to, last, scrollDriven])

  // autoPlay: anel, cada peça na frente, e de volta ao anel; só enquanto a roda está na tela
  React.useEffect(() => {
    const el = stageRef.current
    if (!el || !autoPlay || reduced || !count || scrollDriven) return
    let timer = 0
    const hold = (at: number) => (at === 0 ? interval * 1.5 : interval)
    const tick = () => {
      if (taken.current) return
      const at = Math.round(target.current)
      const next = at >= last + 1 ? 0 : at + 1
      to(next)
      timer = window.setTimeout(tick, hold(next))
    }
    const io = new IntersectionObserver((entries) => {
      window.clearTimeout(timer)
      if (entries[entries.length - 1].isIntersecting && !taken.current) {
        timer = window.setTimeout(tick, hold(Math.round(target.current)))
      }
    })
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearTimeout(timer)
    }
  }, [autoPlay, reduced, count, last, interval, to, scrollDriven])

  return (
    <section
      aria-label={label}
      className={"ww-root" + (scrollDriven ? " ww-scroll-driven" : "") + (className ? " " + className : "")}
      data-theme={theme}
      {...props}
    >
      {/* o CSS cru: como filho de texto, o SSR do React 18 escaparia as aspas e quebraria os seletores */}
      <style dangerouslySetInnerHTML={{ __html: WW_CSS }} />
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={label}
        aria-activedescendant={count ? `${uid}-${active}` : undefined}
        className="ww-stage"
        style={{ perspective: `${metrics.depth}px` }}
        onPointerDown={(event) => {
          if (scrollDriven || event.button !== 0) return
          // a altura na tela, com o transform em volta: é nela que o ponteiro anda
          const px = Math.max(event.currentTarget.getBoundingClientRect().height * DRAG_SHARE, 1)
          drag.current = {
            id: event.pointerId,
            y: event.clientY,
            start: event.clientY,
            px,
            from: Math.round(target.current),
            moved: false,
          }
          dragged.current = false
        }}
        onPointerMove={(event) => {
          if (scrollDriven) return
          const d = drag.current
          if (!d || d.id !== event.pointerId) return
          if (!d.moved) {
            if (Math.abs(event.clientY - d.start) < DRAG_SLOP) return
            // agora é arraste: o ponteiro fica com a roda até soltar, mesmo saindo dela
            d.moved = true
            dragged.current = true
            taken.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
          }
          to(target.current + (d.y - event.clientY) / d.px)
          d.y = event.clientY
        }}
        onPointerUp={(event) => {
          if (scrollDriven) return
          const d = drag.current
          if (!d || d.id !== event.pointerId) return
          drag.current = null
          if (!d.moved) return
          // Assenta numa peça (ou no anel), em vez de parar entre duas, e como a rolagem, pelo menos uma adiante no sentido
          // do arraste: uma passada curta do dedo já troca a peça.
          const moved = target.current - d.from
          const near = Math.round(target.current)
          if (moved > MIN_DRAG) to(Math.max(near, d.from + 1))
          else if (moved < -MIN_DRAG) to(Math.min(near, d.from - 1))
          else to(near)
          window.setTimeout(() => (dragged.current = false), 0)
        }}
        onPointerCancel={() => {
          if (scrollDriven) return
          if (drag.current?.moved) to(Math.round(target.current))
          drag.current = null
          dragged.current = false
        }}
        onClickCapture={(event) => {
          if (scrollDriven || !dragged.current) return
          dragged.current = false
          event.preventDefault()
          event.stopPropagation()
        }}
        onKeyDown={(event) => {
          const at = Math.round(target.current)
          if (event.key === "ArrowDown") navigateTo(at + 1)
          else if (event.key === "ArrowUp") navigateTo(at - 1)
          else if (event.key === "Home") navigateTo(0)
          else if (event.key === "End") navigateTo(last + 1)
          else if (event.key === "Enter" && at >= 1) cardRefs.current[at - 1]?.click()
          else return
          taken.current = true
          event.preventDefault()
        }}
      >
        <div ref={wheelRef} className="ww-wheel">
          {items.map((item, i) => {
            const card = {
              id: `${uid}-${i}`,
              role: "option",
              "aria-selected": i === active,
              className: "ww-card",
              style: {
                width: metrics.cardW,
                height: metrics.cardH,
                marginLeft: -metrics.cardW / 2,
                marginTop: -metrics.cardH / 2,
              },
              ref: (node: HTMLElement | null) => {
                cardRefs.current[i] = node
              },
              // fora da frente, o clique gira a roda até o cartão; na frente, o link segue
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                if (Math.round(target.current) === i + 1) return
                event.preventDefault()
                taken.current = true
                navigateTo(i + 1)
              },
            }
            const face = (
              <span className="ww-face">
                <img src={item.image} alt={item.alt ?? item.title} draggable={false} decoding="async" className="ww-img" />
                {action && item.href ? (
                  <span className="ww-action" aria-hidden="true">
                    <svg viewBox="0 0 12 12" focusable="false">
                      <path
                        d="M3 9 9 3M4 3h5v5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {action}
                  </span>
                ) : null}
              </span>
            )
            // os cartões ficam fora do Tab: a roda é uma lista só, que se percorre pelas setas (e o Enter segue o link)
            return item.href ? (
              <a key={i} href={item.href} tabIndex={-1} draggable={false} {...card}>
                {face}
              </a>
            ) : (
              <div key={i} {...card}>
                {face}
              </div>
            )
          })}
        </div>
      </div>

      {/* O título do anel e o da peça da frente trocam de lugar na passagem. A letra se mede pela roda, não pela tela,
          então a roda guarda as proporções num cartão e na tela inteira. */}
      <div ref={labelRef} className="ww-label" style={{ fontSize: metrics.title }}>
        {label}
      </div>
      <div ref={titleRef} className="ww-title" style={{ fontSize: metrics.title }}>
        {items[active]?.title}
      </div>

      <ol className="ww-index" style={{ fontSize: metrics.index }}>
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              aria-current={i === active || undefined}
              onClick={() => {
                taken.current = true
                navigateTo(i + 1)
              }}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default WorksWheel

const WW_CSS = `
/* o que o projeto pode trocar com uma classe (altura, largura, margem): na camada base, que vem antes das classes de
   componente e dos utilitários (Tailwind v4) e perde para o CSS fora de camada (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .ww-root { position: relative; width: 100%; height: 100%; min-height: 24rem; margin: 0; }
}
.ww-root[hidden] { display: none; }
.ww-root {
  --ww-bg: #0a0a0a;
  --ww-fg: #fafafa;
  --ww-muted: #a1a1aa;
  --ww-card: #27272a;
  --ww-shadow: rgba(250, 250, 250, .12);
  --ww-chip: rgba(10, 10, 10, .85);
  box-sizing: border-box;
  overflow: hidden;
  isolation: isolate;
  background: var(--ww-bg);
  color: var(--ww-fg);
  /* nada de texto herdado da página: a roda fica igual em qualquer projeto */
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  line-height: 1.5;
  letter-spacing: normal;
  word-spacing: normal;
  text-align: left;
  text-transform: none;
  text-indent: 0;
  text-shadow: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.ww-root[data-theme="light"] {
  --ww-bg: #ffffff;
  --ww-fg: #0a0a0a;
  --ww-muted: #71717a;
  --ww-card: #f4f4f5;
  --ww-shadow: rgba(10, 10, 10, .12);
  --ww-chip: rgba(255, 255, 255, .85);
}
.ww-root *, .ww-root *::before, .ww-root *::after { box-sizing: border-box; }

/* a roda: pega a rolagem, o arraste na vertical (o dedo na horizontal continua rolando a página para o lado) e o teclado */
.ww-stage {
  position: absolute;
  inset: 0;
  margin: 0;
  cursor: grab;
  touch-action: pan-x;
  outline: none;
}
.ww-stage:active { cursor: grabbing; }
.ww-scroll-driven .ww-stage, .ww-scroll-driven .ww-stage:active { cursor: default; touch-action: pan-y; }
.ww-stage:focus-visible { outline: 2px solid var(--ww-fg); outline-offset: -4px; }
.ww-wheel { position: absolute; top: 50%; left: 50%; margin: 0; transform-style: preserve-3d; }

.ww-card {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  margin: 0;
  padding: 0;
  color: inherit;
  text-decoration: none;
  outline: none;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-user-drag: none;
}
.ww-face {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: var(--ww-card);
  box-shadow: 0 18px 40px -18px var(--ww-shadow);
}
.ww-img {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  object-fit: cover;
  -webkit-user-drag: none;
}

/* o selo do hover, embaixo à direita do cartão com link */
.ww-action {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 4px 10px;
  border-radius: 9999px;
  background: var(--ww-chip);
  color: var(--ww-fg);
  font-size: .7rem;
  line-height: 1.5;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity .15s cubic-bezier(.4, 0, .2, 1), transform .15s cubic-bezier(.4, 0, .2, 1);
}
.ww-action svg { display: block; flex-shrink: 0; width: 10px; height: 10px; }
@media (hover: hover) {
  .ww-card:hover .ww-action { opacity: 1; transform: translateY(0); }
}

/* o título do anel, no centro, e o da peça da frente, à esquerda dela */
.ww-label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  letter-spacing: -.025em;
  white-space: nowrap;
  pointer-events: none;
}
.ww-title {
  position: absolute;
  top: 50%;
  left: 8%;
  margin: 0;
  letter-spacing: -.025em;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(-50%);
  pointer-events: none;
}

/* a lista, no alto à direita */
.ww-index {
  position: absolute;
  top: 7.5%;
  right: 2.5%;
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: right;
  line-height: 1.75;
  color: var(--ww-muted);
}
.ww-index li { margin: 0; padding: 0; }
.ww-index button {
  display: inline;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-align: inherit;
  text-transform: none;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: color .15s cubic-bezier(.4, 0, .2, 1);
}
.ww-index button[aria-current] { color: var(--ww-fg); font-weight: 500; }
.ww-index button:focus-visible { outline: 1px solid var(--ww-fg); }

@media (prefers-reduced-motion: reduce) {
  .ww-root, .ww-root * { transition-duration: .01ms !important; }
}
`
