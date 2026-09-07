import kaplay, { type GameObj } from "kaplay"

const k = kaplay()

k.setBackground(k.WHITE)

window.addEventListener("contextmenu", (e) => e.preventDefault())

const cells = import.meta.glob("./assets/cells/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>

for (const [path, url] of Object.entries(cells)) {
  const name = path.match(/\/(\w+)\.png$/)![1]
  k.loadSprite(name, url)
}


const number_sprites: Record<number, string> = {
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

const cellGrid: number = 9

/**
 * ダイスをamountまでランダムに振ります
 * @returns 1-6までのダイスのスプライトを返します 
 */
function diceRoll(dice: GameObj, amount: number) {
  const result = Math.floor(Math.random() * amount) + 1
  dice.use(k.sprite(`dice${result}`))
}

/**
 * ダイスの目をセットします
 * @returns numberの数のダイスのスプライトを返します
 */
function setDice(dice: GameObj, number: number) {
  //if(number <= 0) return
  dice.use(k.sprite(`dice${number}`))

}

/**
 * 
 * 引数diceの出目を取得します
 * @returns 1 || 2 || 3 || 4 || 5 || 6
 */
function getDice(dice: GameObj) {
  switch (dice.sprite) {
    case "dice0": return 0;
    case "dice1": return 1;
    case "dice2": return 2;
    case "dice3": return 3;
    case "dice4": return 4;
    case "dice5": return 5;
    case "dice6": return 6;
    default: return 1
  }
}
k.scene("main", () => {
  const dice = k.add([
    k.pos(10 * 64 + 64, 64),
    k.area(),
    k.sprite("dice0")
  ])

  const board = []

  for (let x = 0; x < cellGrid; x++) {
    for (let y = 0; y < cellGrid; y++) {
      const id = y * cellGrid + x
      const cell = k.add([
        k.sprite("hidden"),
        k.pos(x * 64 + 64, y * 64 + 64),
        k.area(),
        k.z(10),
        k.opacity(0.5),
        `cell${id}`
      ])

      board[id] = cell
    }
  }

  k.add([
    k.sprite("wall"),
    k.area(),
    k.pos(32, 32),
    k.z(0),
  ])


  function setCellOpacity(cell: GameObj) {
    if (cell.sprite === "hidden") {
      cell.opacity = 0.5
    } else {
      cell.opacity = 1.5
    }
  }

  for (const cell of board) {
    cell.onMousePress("left", () => {
      if (!cell.isHovering()) return
      if (cell.sprite == "hidden" || cell.sprite == "open") {
        cell.use(k.sprite(number_sprites[getDice(dice)]))
        setDice(dice, 0)
        setCellOpacity(cell)
      }
    })

    cell.onMousePress("right", () => {
      if (!cell.isHovering()) return
      if (cell.sprite === "frag" || cell.sprite == "open") {
        cell.use(k.sprite("hidden"))
      } else if (cell.sprite == "hidden") {
        cell.use(k.sprite("frag"))
      }
      setCellOpacity(cell)
    })

    cell.onHover(() => {
      cell.use(k.color(k.rgb(182, 182, 182)))
      cell.opacity = 1
    })

    cell.onHoverEnd(() => {
      cell.use(k.color(k.WHITE))
      setCellOpacity(cell)
    })
  }

  dice.onClick(() => {
    if (dice.sprite == "dice0") {
      diceRoll(dice, 6)
    }
  })
})

k.onLoad(() => k.go("main")) // => http://localhost:5173/