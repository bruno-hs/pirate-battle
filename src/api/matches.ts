import { api } from './client'

export type MatchResult = {
    id: number
    score: number
    duration: number
    result: 'time' | 'death'
    playedAt: string
}

export async function getRanking() {
    const response = await api.get<MatchResult[]>('/ranking')

    return response.data
}

export async function getHistory() {
    const response = await api.get<MatchResult[]>('/history')

    return response.data
}

export async function saveMatch(
    match: Omit<MatchResult, 'id'>,
){
    const response = await api.post<MatchResult>('/matches', match)

    return response.data
}
