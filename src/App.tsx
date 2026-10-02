import { useEffect, useEffectEvent, useRef, useState } from "react"
import { Application, Assets, Graphics, Sprite, } from 'pixi.js'

import shipImage from '../assets/png/retina/ships/ship_1.png'
import enemyShipImage from '../assets/png/retina/ships/ship_2.png'
import shooterShipImage from '../assets/png/retina/ships/ship_3.png'

import './App.css'

function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null)

  const [health, setHealth] = useState(100)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [endReason, setEndReason] = useState<'time' | 'death' | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [matchDuration, setMatchDuration] = useState(() => {
    const saved = localStorage.getItem('matchDuration')

    return saved ? Number(saved) : 60
  })
  const [spawnInternal, setSpawnInternal] = useState(() => {
    const saved = localStorage.getItem('spawnInternal')

    return saved ? Number(saved) : 2000
  })

  const gameOverRef = useRef(false)
  const isPausedRef = useRef(false)
  const gameStartedRef = useRef(false)
  const spawnInternalRef = useRef(spawnInternal)

  useEffect(() => {
    gameStartedRef.current = gameStarted
  }, [gameStarted])

  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          setEndReason('time')
          setGameOver(true)
          return 0
        }

        return currentTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver, isPaused])

  useEffect(() => {
    if (health <= 0) {
      setEndReason('death')
      setGameOver(true)
    }
  }, [health])

  useEffect(() => {
    spawnInternalRef.current = spawnInternal
  }, [spawnInternal])

  const saveOptions = () => {
    localStorage.setItem(
      'matchDuration',
      String(matchDuration),
    )

    localStorage.setItem(
      'spawnInternal',
      String(spawnInternal)
    )

    setShowOptions(false)
  }

  useEffect(() => {
    const app = new Application()

    let isMounted = true
    let isAppInitialized = false

    const keys: Record<string, boolean> = {}

    const handleKeyDown = (event: KeyboardEvent) => {
      keys[event.code] = true

      if (event.code === 'Escape') {
        setIsPaused((current) => !current)
        return
      }

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
      const enemyShipTexture = await Assets.load(enemyShipImage)
      const shooterShipTexture = await Assets.load(shooterShipImage)

      if (!isMounted) {
        return
      }

      const ship = new Sprite(shipTexture)

      ship.anchor.set(0.5)

      ship.x = app.screen.width / 2
      ship.y = app.screen.height / 2

      ship.scale.set(0.4)

      app.stage.addChild(ship)

      const chaser = new Sprite(enemyShipTexture)

      chaser.anchor.set(0.5)

      chaser.x = 150
      chaser.y = 150

      chaser.scale.set(0.4)

      app.stage.addChild(chaser)

      const chaserSpeed = 2

      const shooter = new Sprite(shooterShipTexture)

      shooter.anchor.set(0.5)

      shooter.x = app.screen.width - 150
      shooter.y = 150

      shooter.scale.set(0.4)

      app.stage.addChild(shooter)

      const shooterSpeed = 1.5
      const shooterRange = 300
      const shooterProjectileSpeed = 6
      const shooterCoolDown = 1200

      let lastShooterShotTime = 0

      const projectiles: {
        graphic: Graphics,
        velocityX: number
        velocityY: number
      }[] = []

      const projectileSpeed = 10
      const projectileCoolDown = 300

      const enemyProjectiles: {
        graphic: Graphics
        velocityX: number
        velocityY: number
      }[] = []

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

      const shooterShoot = () => {
        const now = Date.now()

        if (now - lastShooterShotTime < shooterCoolDown) {
          return
        }

        lastShooterShotTime = now

        const projectile = new Graphics()

        projectile.circle(0, 0, 6).fill('#ff4d4d')

        const angle = Math.atan2(
          ship.y - shooter.y,
          ship.x - shooter.x,
        )

        const spawnDistance = 25

        projectile.x = shooter.x + Math.cos(angle) * spawnDistance

        projectile.y = shooter.y + Math.sin(angle) * spawnDistance

        const velocityX = Math.cos(angle) * shooterProjectileSpeed

        const velocityY = Math.sin(angle) * shooterProjectileSpeed

        app.stage.addChild(projectile)

        enemyProjectiles.push({
          graphic: projectile,
          velocityX,
          velocityY,
        })
      }

      app.ticker.add((ticker) => {
        if (
          !gameStartedRef.current ||
          gameOverRef.current ||
          isPausedRef.current
        ) {
          return
        }

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

        const deltaX = ship.x - chaser.x
        const deltaY = ship.y - chaser.y

        const distance = Math.sqrt(
          deltaX * deltaX + deltaY * deltaY,
        )

        if (
          chaser.visible && distance > 0
        ) {
          const directionX = deltaX / distance

          const directionY = deltaY / distance

          chaser.x += directionX * chaserSpeed * ticker.deltaTime

          chaser.y += directionY * chaserSpeed * ticker.deltaTime

          const chaserAngle = Math.atan2(deltaY, deltaX)

          chaser.rotation = chaserAngle - Math.PI / 2
        }

        const collisionDistance = 45

        if (
          chaser.visible && distance < collisionDistance
        ) {
          setHealth((currentHealth) => {
            return Math.max(0, currentHealth - 25)
          })

          chaser.visible = false

          setTimeout(() => {
            chaser.x = 100 + Math.random() * (app.screen.width - 200)
            chaser.y = 100 + Math.random() * (app.screen.height - 200)

            chaser.visible = true
          }, spawnInternalRef.current)
        }

        const shooterDeltaX = ship.x - shooter.x

        const shooterDeltaY = ship.y - shooter.y

        const shooterDistance = Math.sqrt(
          shooterDeltaX * shooterDeltaX +
          shooterDeltaY * shooterDeltaY,
        )

        const shooterAngle = Math.atan2(
          shooterDeltaY,
          shooterDeltaX,
        )

        shooter.rotation = shooterAngle - Math.PI / 2

        if (
          shooter.visible &&
          shooterDistance > shooterRange
        ) {
          const shooterDirectionX = shooterDeltaX / shooterDistance

          const shooterDirectionY = shooterDeltaY / shooterDistance

          shooter.x += shooterDirectionX * shooterSpeed * ticker.deltaTime

          shooter.y += shooterDirectionY * shooterSpeed * ticker.deltaTime
        }

        if (
          shooter.visible && shooterDistance <= shooterRange
        ) {
          shooterShoot()
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

          const projectileDeltaX = chaser.x - projectile.graphic.x

          const projectileDeltaY = chaser.y - projectile.graphic.y

          const projectileDistance = Math.sqrt(
            projectileDeltaX * projectileDeltaX +
            projectileDeltaY * projectileDeltaY,
          )

          const projectileCollisionDistance = 35

          if (
            chaser.visible && projectileDistance < projectileCollisionDistance
          ) {
            chaser.visible = false

            app.stage.removeChild(projectile.graphic)
            projectile.graphic.destroy()

            projectiles.splice(i, 1)

            setScore((currentScore) => currentScore + 1)

            setTimeout(() => {
              chaser.x = 100 + Math.random() * (app.screen.width - 200)

              chaser.y = 100 + Math.random() * (app.screen.height - 200)

              chaser.visible = true
            }, spawnInternalRef.current)

            continue
          }

          const shooterProjectileDeltaX = shooter.x - projectile.graphic.x

          const shooterProjectileDeltaY = shooter.y - projectile.graphic.y

          const shooterProjectileDistance = Math.sqrt(
            shooterProjectileDeltaX * shooterProjectileDeltaX +
            shooterProjectileDeltaY * shooterProjectileDeltaY,
          )

          if (
            shooter.visible &&
            shooterProjectileDistance < projectileCollisionDistance
          ) {
            shooter.visible = false

            app.stage.removeChild(projectile.graphic)
            projectile.graphic.destroy()

            projectiles.splice(i, 1)

            setTimeout(() => {
              shooter.x = 100 + Math.random() * (app.screen.width - 200)

              shooter.y = 100 + Math.random() * (app.screen.height - 200)

              shooter.visible = true
            }, spawnInternalRef.current)

            continue
          }

          const projectileMargin = 20

          const isOutSideArena =
            projectile.graphic.x < -projectileMargin ||
            projectile.graphic.x > app.screen.width + projectileMargin ||
            projectile.graphic.y < -projectileMargin ||
            projectile.graphic.y > app.screen.height + projectileMargin

          if (isOutSideArena) {
            app.stage.removeChild(projectile.graphic)
            projectile.graphic.destroy()

            projectiles.splice(i, 1)
          }
        }

        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
          const projectile = enemyProjectiles[i]

          projectile.graphic.x += projectile.velocityX * ticker.deltaTime

          projectile.graphic.y += projectile.velocityY * ticker.deltaTime

          const deltaX = ship.x - projectile.graphic.x

          const deltaY = ship.y - projectile.graphic.y

          const disanceToPlayer = Math.sqrt(
            deltaX * deltaX +
            deltaY * deltaY,
          )

          const hitDistance = 30

          if (disanceToPlayer < hitDistance) {
            setHealth((currentHealth) =>
              Math.max(0, currentHealth - 10),
            )

            app.stage.removeChild(projectile.graphic)
            projectile.graphic.destroy()

            enemyProjectiles.splice(i, 1)

            continue
          }

          const projectileMargin = 20

          const isOutSideArena =
            projectile.graphic.x < -projectileMargin ||
            projectile.graphic.x > app.screen.width + projectileMargin ||
            projectile.graphic.y < -projectileMargin ||
            projectile.graphic.y > app.screen.height + projectileMargin

          if (isOutSideArena) {
            app.stage.removeChild(projectile.graphic)
            projectile.graphic.destroy()

            enemyProjectiles.splice(i, 1)
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
      {!gameStarted && !showOptions && (
        <div className="main-menu">
          <h1>Pirate Battle</h1>

          <button onClick={() => {
            setHealth(100)
            setScore(0)
            setTimeLeft(matchDuration)
            setGameOver(false)
            setGameStarted(true)
          }}>
            Play
          </button>

          <button onClick={() => {
            setShowOptions(true)
          }}>
            Options
          </button>
        </div>
      )}

      {showOptions && !gameStarted && (
        <div className="options-menu">
          <h2>Options</h2>

          <label>
            Match Duration

            <select value={matchDuration} onChange={(event) => setMatchDuration(Number(event.target.value),)}>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
              <option value={120}>120 seconds</option>
              <option value={180}>180 seconds</option>
            </select>
          </label>

          <label>
            Enemy Respawn

            <select value={spawnInternal} onChange={(event) => setSpawnInternal(Number(event.target.value))}>
              <option value={1000}>1 second</option>
              <option value={2000}>2 second</option>
              <option value={3000}>3 second</option>
              <option value={5000}>5 second</option>
            </select>
          </label>

          <button onClick={saveOptions}>Save</button>
          
          <button onClick={() => setShowOptions(false)}>Back</button>
        </div>
      )}

      {gameStarted && (
        <div className="hud">HP: {health} | SCORE: {score} | TIME: {timeLeft}</div>
      )}

      {isPaused && !gameOver && (
        <div className="game-over">
          <h2>Paused</h2>

          <p>Press ESC to continue</p>
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h2>
            {endReason === 'death'
              ? 'Defeated'
              : 'Time Up'}
          </h2>

          <p>Score: {score}</p>

          <p>
            {endReason === 'death'
              ? 'Your ship was destroyed.'
              : 'You survived until the end of the match.'}
          </p>

          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}

      <div ref={gameContainerRef} className="game-container" />
    </main>
  )
}

export default App
