import { useEffect, useRef } from "react"
import { Application, Assets, Graphics, Sprite, } from 'pixi.js'

import shipImage from '../assets/png/retina/ships/ship_1.png'

import './App.css'

function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const app = new Application()

    let isMounted = true
    let isAppInitialized = false

    const keys: Record<string, boolean> = {}

    const handleKeyDown = (event: KeyboardEvent) => {
      keys[event.code] = true

      if (
        event.code === 'Space'
      ) {
        event.preventDefault()
      }

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

      isAppInitialized = true

      if (!isMounted || !gameContainerRef.current) {
        app.destroy(true, {
          children: true,
        })

        return
      }

      gameContainerRef.current.replaceChildren(app.canvas)

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

      const projectiles: {
        graphic: Graphics,
        velocityX: number
        velocityY: number
      } [] = []

      const projectileSpeed = 10
      const projectileCoolDown = 300

      let lastShotTime = 0

      const shoot = () => {
        const now = Date.now()

        if (now - lastShotTime < projectileCoolDown) {
          return
        }

        lastShotTime = now

        const projectile = new Graphics()

        projectile.circle(0, 0, 6).fill('#f5d742')

        const angle = ship.rotation + Math.PI / 2

        const spawnDistance = 25

        projectile.x = ship.x + Math.cos(angle) * spawnDistance
        projectile.y = ship.y + Math.sin(angle) * spawnDistance

        const velocityX = Math.cos(angle) * projectileSpeed

        const velocityY = Math.sin(angle) * projectileSpeed

        app.stage.addChild(projectile)

        projectiles.push({
          graphic: projectile,
          velocityX,
          velocityY,
        })
      }

      const shootBroadside = (side: 'left' | 'right') => {
        const now = Date.now()

        if (now - lastShotTime < projectileCoolDown) {
          return
        }

        lastShotTime = now

        const forwardAngle = ship.rotation + Math.PI / 2

        const sideAngle = side === 'left' ? forwardAngle - Math.PI / 2 : forwardAngle + Math.PI / 2

        const spacing = 18
        const spawnDistance = 20

        for (let i = -1; i <= 1; i++) {
          const projectile = new Graphics()

          projectile.circle(0, 0, 6).fill('#f5d742')

          projectile.x = ship.x + Math.cos(forwardAngle) * (i * spacing) + Math.cos(sideAngle) * spawnDistance

          projectile.y = ship.y + Math.sin(forwardAngle) * (i * spacing) + Math.sin(sideAngle) * spawnDistance

          const velocityX = Math.cos(sideAngle) * projectileSpeed

          const velocityY = Math.sin(sideAngle) * projectileSpeed

          app.stage.addChild(projectile)

          projectiles.push({
            graphic: projectile,
            velocityX,
            velocityY,
          })
        }
      }

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

        if (keys['Space']) {
          shoot()
        }

        if (keys['KeyQ']) {
          shootBroadside('left')
        }

        if (keys['KeyE']) {
          shootBroadside('right')
        }

        for (let i = projectiles.length - 1; i >= 0; i--) {
          const projectile = projectiles[i]

          projectile.graphic.x += projectile.velocityX * ticker.deltaTime

          projectile.graphic.y += projectile.velocityY * ticker.deltaTime

          const isOutSideArena =
            projectile.graphic.x < 0 ||
            projectile.graphic.x > app.screen.width ||
            projectile.graphic.y < 0 ||
            projectile.graphic.y > app.screen.height

            if (isOutSideArena) {
              app.stage.removeChild(projectile.graphic)
              projectile.graphic.destroy()

              projectiles.splice(i, 1)
            }
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

      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)

      if (isAppInitialized) {
        app.destroy(true, {
          children: true,
        })
      }
    }
  }, [])

  return (
    <main className="game-page">
      <div ref={gameContainerRef} className="game-container" />
    </main>
  )
}

export default App
