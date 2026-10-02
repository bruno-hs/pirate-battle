import { http, HttpResponse } from 'msw'

type MatchResult = {
    id: number
    score: number
    duration: number
    result: 'time' | 'death'
    playedAt: string
}

const defaultMatches: MatchResult[] = [
    {
        id: 1,
        score: 8,
        duration: 60,
        result: 'time',
        playedAt: new Date().toISOString(),
    },
    {
        id: 2,
        score: 5,
        duration: 42,
        result: 'death',
        playedAt: new Date().toISOString(),
    },
]

function getMatches(): MatchResult[] {
    const savedMatches = localStorage.getItem('pirateMatches')

    if (!savedMatches) {
        localStorage.setItem(
            'pirateMatches',
            JSON.stringify(defaultMatches),
        )

        return defaultMatches
    }

    return JSON.parse(savedMatches)
}

function saveMatches(matches: MatchResult[]) {
    localStorage.setItem(
        'pirateMatches',
        JSON.stringify(matches),
    )
}

export const handlers = [
    http.get('/api/ranking', () => {
        const matches = getMatches()

        const ranking = [...matches].sort(
            (a, b) => b.score - a.score,
        )

        return HttpResponse.json(ranking)
    }),

    http.get('/api/history', () => {
        const matches = getMatches()

        return HttpResponse.json(matches)
    }),

    http.post('/api/matches', async ({ request }) => {
        const body =
            (await request.json()) as Omit<
                MatchResult,
                'id'
            >

        const match: MatchResult = {
            id: Date.now(),
            ...body,
        }

        const matches = getMatches()

        const updatedMatches = [
            match,
            ...matches,
        ]

        saveMatches(updatedMatches)

        return HttpResponse.json(match, {
            status: 201,
        })
    }),
]