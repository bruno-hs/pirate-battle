import { useEffect, useRef } from "react"
import { Application, Assets, Graphics, Sprite, } from 'pixi.js'

import shipImage from '../assets/png/retina/ships/ship_1.png'

import './App.css'

function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const app = new Application()

    let isMounted = true

    const keys: Record<string, boolean> = {}

    const handleKeyDown = (event: KeyboardEvent) => {
      keys[event.code] = true

      if (
        event.code === 'ArrowUp' ||
        event.code === 'ArrowDown' ||
        event.code === 'ArrowLeft' ||
        event.code === 'ArrowRight'
      ) {
        event.preventDefault()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keys[event.code] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const startGame = async () => {
      await app.init({
        width: 1280,
        height: 720,
        backgroundColor: '#0b5d7a',
        antialias: true,
      })

      if (!isMounted || !gameContainerRef.current) {
        app.destroy(true, true)
        return
      }

      gameContainerRef.current.appendChild(app.canvas)

      const arena = new Graphics

      arena.rect(0, 0, 1280, 720).fill('#0b5d7a')

      app.stage.addChild(arena)

      const shipTexture = await Assets.load(shipImage)

      if (!isMounted) {
        return
      }

      const ship = new Sprite(shipTexture)

      ship.anchor.set(0.5)

      ship.x = app.screen.width / 2
      ship.y = app.screen.height / 2

      ship.scale.set(0.4)

      app.stage.addChild(ship)

      const speed = 4
      const rotationSpeed = 0.05

      app.ticker.add((ticker) => {
        const movingForward = keys['KeyW'] || keys['ArrowUp']

        const movingBackward = keys['KeyS'] || keys['ArrowDown']

        const turningLeft = keys['KeyA'] || keys['ArrowLeft']

        const turningRight = keys['KeyD'] || keys['ArrowRight']

        if (turningLeft) {
          ship.rotation -= rotationSpeed * ticker.deltaTime
        }

        if (turningRight) {
          ship.rotation += rotationSpeed * ticker.deltaTime
        }

        const movementAngle = ship.rotation + Math.PI / 2

        if (movingForward) {
          ship.x += Math.cos(movementAngle) * speed * ticker.deltaTime
          ship.y += Math.sin(movementAngle) * speed * ticker.deltaTime
        }

        if (movingBackward) {
          ship.x -= Math.cos(movementAngle) * speed * ticker.deltaTime
          ship.y -= Math.sin(movementAngle) * speed * ticker.deltaTime
        }

        const margin = 30

        ship.x = Math.max(
          margin,
          Math.min(app.screen.width - margin, ship.x)
        )

        ship.y = Math.max(
          margin,
          Math.min(app.screen.height - margin, ship.y)
        )
      })
    }

    startGame()

    return () => {
      isMounted = false

      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <main className="game-page">
      <div ref={gameContainerRef} className="game-container" />
    </main>
  )
}

export default App
