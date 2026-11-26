// the three-essay wave on my homepage. it draws into <pre class="snail-wave"> in content/index.md
const texts = [
  "I keep returning to the snail. It leaves a thin trail across the ground, its progress fragile but visible. It has encountered the world as it moved through it. Perhaps that is a useful standard for the things we make: how quickly a person can move through something, and whether they remain present when they arrive.",
  "Follow the idea, pay attention to where it takes you, leave some evidence that you were there, and know when to stop.",
  "Somebody, somewhere, had taken the time to make a website about the things they liked, and I, a complete stranger with an afternoon to spare, had taken the time to look at it.",
]
const rows = 24
const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// breaks a passage into lines that fit the column
function wrap(text: string, width: number) {
  const lines: string[] = []
  let line = ""
  for (const word of text.toUpperCase().split(" ")) {
    if ((line + " " + word).trim().length > width) {
      lines.push(line)
      line = word
    } else line = (line + " " + word).trim()
  }
  lines.push(line)
  return lines
}

function start() {
  const el = document.querySelector<HTMLElement>(".snail-wave")
  if (!el || el.dataset.on) return
  el.dataset.on = "1"

  // how many letters fit across the page
  const probe = document.createElement("span")
  probe.textContent = "X".repeat(50)
  el.appendChild(probe)
  const cols = Math.floor(el.clientWidth / (probe.getBoundingClientRect().width / 50))
  probe.remove()

  // three overlapping columns, one per essay
  const colW = Math.floor(cols * 0.42)
  const starts = [0, Math.floor(cols * 0.29), Math.floor(cols * 0.58)]
  const blocks = texts.map((text) => {
    const lines = wrap(text, colW)
    const out: string[] = []
    while (out.length < rows) out.push(...lines, "")
    return out.slice(0, rows)
  })

  // fixed randomness so letters fall apart in the same places each frame
  const noise = Array.from({ length: rows * cols * 3 }, () => Math.random())
  const swaps = noise.map(() => abc[(Math.random() * 26) | 0])

  let t = 0
  function draw() {
    t += 0.018
    const grid = Array.from({ length: rows }, () => Array(cols).fill(" "))
    blocks.forEach((lines, c) => {
      for (let y = 0; y < rows; y++) {
        // each line slides sideways a bit, which makes the wave
        const sway = Math.min(1, y / 4)
        const shift = Math.round(
          sway * cols * 0.14 * Math.sin(y * 0.28 - t + c * 2.1) +
            sway * cols * 0.05 * Math.sin(y * 0.1 + t * 0.6 + c),
        )
        // lower down, letters start to drop out and get jumbled
        const mess = Math.max(0, y / rows - 0.4)
        const line = lines[y]
        for (let j = 0; j < line.length; j++) {
          const x = starts[c] + j + shift
          if (x < 0 || x >= cols) continue
          let ch = line[j]
          const i = (c * rows + y) * cols + j
          if (ch !== " ") {
            if (noise[i] < mess * 0.9) ch = " "
            else if (noise[i] < mess * 1.8) ch = swaps[i]
            if (Math.random() < 0.003) ch = abc[(Math.random() * 26) | 0]
          }
          if (ch !== " ") grid[y][x] = ch
        }
      }
    })
    el!.textContent = grid.map((r) => r.join("")).join("\n")
  }

  draw()
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const timer = setInterval(() => (el.isConnected ? draw() : clearInterval(timer)), 120)
}

start()
document.addEventListener("nav", start)