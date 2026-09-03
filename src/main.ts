import kaplay, { type GameObj } from "kaplay"

const k = kaplay()

const cells = import.meta.glob("./assets/cells/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>

for (const [path, url] of Object.entries(cells)) {
  const name = path.match(/\/(\w+)\.png$/)![1]
  k.loadSprite(name, url)
}

const NUMBER_SPRITES: Record<number, string> = {
  0: "open",
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
}

type Cell = GameObj & {
  isBomb: boolean
  neighborBombs: number
  isRevealed: boolean
  isFlagged: boolean
}

function cellState(isBomb: boolean) {
  return {
    isBomb,
    neighborBombs: 0,
    isRevealed: false,
    isFlagged: false,
  }
}

function shuffleBomb(board: Cell[], amount: number) {
  const indices = board.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  for (let i = 0; i < amount; i++) {
    board[indices[i]].isBomb = true
  }
}

function countNeighborBombs(board: Cell[], id: number, grid: number) {
  const x = id % grid
  const y = Math.floor(id / grid)
  let count = 0
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || nx >= grid || ny < 0 || ny >= grid) continue
      const neighbor = board[ny * grid + nx]
      if (neighbor.isBomb) count++
    }
  }
  return count
}

k.scene("main", () => {
  const board: Cell[] = []
  const CELLGRID = 10
  const BOMBS = 10

  for (let x = 0; x < CELLGRID; x++) {
    for (let y = 0; y < CELLGRID; y++) {
      const id = y * CELLGRID + x
      const cell = k.add([
        k.sprite("hidden"),
        k.scale(0.05),
        k.pos(x * 64, y * 64),
        k.area(),
        `cell`,
        `cell${id}`,
        cellState(false),
      ]) as Cell

      board[id] = cell
    }
  }

  shuffleBomb(board, BOMBS)

  for (let i = 0; i < board.length; i++) {
    board[i].neighborBombs = countNeighborBombs(board, i, CELLGRID)
  }

  for (const cell of board) {
    cell.onClick(() => {
      if (cell.isRevealed || cell.isFlagged) return
      cell.isRevealed = true
      if (cell.isBomb) {
        cell.use(k.sprite("bomb"))
      } else {
        cell.use(k.sprite(NUMBER_SPRITES[cell.neighborBombs]))
      }
    })

    cell.onHover(() => {
      if (!cell.isRevealed) {
        cell.use(k.color(k.rgb(110, 110, 110)))
      }
    })

    cell.onHoverEnd(() => {
      if (!cell.isRevealed) {
        cell.use(k.color(k.WHITE))
      }
    })
  }
})

k.onLoad(() => k.go("main"))