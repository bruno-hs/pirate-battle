# Pirate Battle

A 2D naval battle game developed as part of the Jungle Gaming Game Developer Challenge.

The project was built with React, TypeScript and PixiJS, with mocked API integration using Axios, TanStack Query and MSW.

## Features

- Player ship movement and rotation
- Forward and reverse movement
- Frontal shooting
- Left and right broadside attacks
- Chaser enemy that follows the player
- Shooter enemy that attacks from a distance
- Player health system
- Score system
- Match timer
- Pause using `ESC`
- Automatic pause when changing browser tabs
- Configurable match duration
- Configurable enemy respawn interval
- Ranking
- Match history
- Match result persistence using `localStorage`
- Mocked API using MSW

## Controls

| Key                 | Action          |
| ------------------- | --------------- |
| `W` / `Arrow Up`    | Move forward    |
| `S` / `Arrow Down`  | Move backward   |
| `A` / `Arrow Left`  | Rotate left     |
| `D` / `Arrow Right` | Rotate right    |
| `Space`             | Front shot      |
| `Q`                 | Left broadside  |
| `E`                 | Right broadside |
| `ESC`               | Pause / Resume  |

## Technologies

- React
- TypeScript
- Vite
- PixiJS
- TanStack Query
- Axios
- MSW
- CSS
- Local Storage

## Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Enter the project directory:

```bash
cd game-developer-challenge
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL displayed by Vite in the terminal.

## How to Play

The player controls a pirate ship inside the battle arena.

The main objective is to survive until the match timer reaches zero while destroying enemy ships and earning points.

The match ends when:

- the timer reaches zero; or
- the player's health reaches zero.

At the end of each match, the score and match information are saved and become available in the Ranking and Match History screens.

## Enemies

### Chaser

The Chaser continuously follows the player's ship.

If it collides with the player, the player loses health.

When destroyed or after colliding with the player, the Chaser respawns after the configured enemy respawn interval.

### Shooter

The Shooter approaches the player until it reaches its attack range.

Once in range, it fires projectiles toward the player's ship.

When an enemy projectile hits the player, health is reduced.

The Shooter can also be destroyed by player projectiles.

## Shooting

### Front Shot

Press `Space` to fire a projectile from the front of the ship.

### Broadside

Press `Q` to fire three projectiles from the left side of the ship.

Press `E` to fire three projectiles from the right side of the ship.

## Match Settings

The Options screen allows the player to configure the match before playing.

### Match Duration

Available match durations:

- 60 seconds
- 90 seconds
- 120 seconds
- 180 seconds

### Enemy Respawn

Available enemy respawn intervals:

- 1 second
- 2 seconds
- 3 seconds
- 5 seconds

The selected options are saved in `localStorage` and remain available after refreshing the browser.

## Pause System

The game can be paused manually by pressing `ESC`.

The match is also automatically paused when the browser tab becomes hidden.

When the player returns to the tab, the game remains paused until `ESC` is pressed again.

## Ranking

The Ranking screen displays previous match scores ordered from highest to lowest.

The application retrieves ranking data through:

```text
GET /api/ranking
```

The data is provided by the mocked API using MSW.

## Match History

The Match History screen displays previously completed matches.

The application retrieves the match history through:

```text
GET /api/history
```

When a match ends, the result is submitted through:

```text
POST /api/matches
```

Each saved match contains:

- score
- match duration
- match result
- date and time

The match result can be `time` when the player survives until the end of the timer, or `death` when the player's health reaches zero.

## API Mocking

MSW is used to simulate the backend API directly in the browser.

The available mocked endpoints are:

```text
GET /api/ranking
GET /api/history
POST /api/matches
```

Axios is used as the HTTP client.

TanStack Query is responsible for:

- fetching ranking data
- fetching match history
- saving match results
- invalidating cached data after a new match is saved

The match data is persisted using `localStorage`.

## Project Structure

```text
src/
├── api/
│   ├── client.ts
│   └── matches.ts
├── mocks/
│   ├── browser.ts
│   └── handlers.ts
├── App.tsx
├── App.css
├── main.tsx
└── index.css
```

### `src/api/client.ts`

Configures the Axios client used by the application.

### `src/api/matches.ts`

Contains the functions responsible for accessing the mocked match API.

### `src/mocks/handlers.ts`

Contains the MSW request handlers for ranking, history and match creation.

### `src/mocks/browser.ts`

Configures and starts the MSW service worker in the browser.

### `src/App.tsx`

Contains the main application and game logic, including:

- PixiJS initialization
- player movement
- shooting
- enemy behavior
- collision detection
- health
- score
- timer
- menus
- pause system
- ranking
- match history

## Scripts

Start the development server:

```bash
npm run dev
```

Run the TypeScript validation:

```bash
npx tsc --noEmit
```

Build the project:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

## Known Limitations

Due to the development time available for the challenge, some features were left as possible future improvements:

- island collision system
- mobile/touch controls
- sound effects and background music
- additional visual effects
- more enemy variations
- more complete automated test coverage

## Future Improvements

Possible future improvements include:

- environmental obstacles and island collisions
- responsive touch controls for mobile devices
- additional enemy behaviors
- sound effects and music
- improved hit and damage feedback
- more detailed ranking information
- additional game modes
- expanded automated testing

## Author

Developed for the Jungle Gaming Game Developer Challenge.