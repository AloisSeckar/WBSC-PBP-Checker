export type Result = 'OK' | 'ERR'

export type PBPGameCheck = {
    game: string,
    result: Result,
    problems: string[]
}

export type PBPCheck = {
    date: Date,
    result: Result,
    games: PBPGameCheck
}
