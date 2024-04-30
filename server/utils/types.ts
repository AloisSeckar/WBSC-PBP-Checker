// custom types for PBP checker

export type PBPVariant = 'baseball' | 'softball'

export type PBPWinner = 'home' | 'away'

export type PBPResult = 'OK' | 'ERR'

export type PBPGameCheckRequest = {
  gameLinks: string[]
}

export type PBPGameCheck = {
  link: string
  game: string
  result: PBPResult
  problems: string[]
}

export type PBPCheck = {
  date: Date
  result: PBPResult
  games: PBPGameCheck[]
}

export type PBPGameAnalysis = {
  variant: 'baseball' | 'softball'
  homeTeamId: number
  awayTeamId: number
  innings: number
  winner: 'home' | 'away'
}

export type PBPPitcherAnalysis = {
  id: number
  pbpName: string
  fullName: string
  pitch_ip: string
  starting?: boolean
  win?: boolean
  loss?: boolean
  save?: boolean
}

export type PBPPitchingAnalysis = {
  homePitchers: PBPPitcherAnalysis[]
  currentHomePitcher?: PBPPitcherAnalysis
  homePoints: number
  homeTeamIsAhead: boolean
  awayPitchers: PBPPitcherAnalysis[]
  currentAwayPitcher?: PBPPitcherAnalysis
  awayPoints: number
  awayTeamIsAhead: boolean
}

// types derived from WBSC data object

export type WBSCTournamentInfo = {
  innings: number
}

export type WBSCGameData = {
  gamenumber: number
  homeid: number
  homeioc: string
  awayid: number
  awayioc: string
  start: string
  innings: number
  homeruns: number
  awayruns: number
}

export type WBSCPitcher = {
  id: number
  fullName: string
  era: number
}

export type WBSCPitchers = {
  win?: WBSCPitcher
  loss?: WBSCPitcher
  save?: WBSCPitcher
}

export type WBSCPlayerStats = {
  playerid: number
  teamid: number
  uniform: string
  firstname: string
  lastname: string
  sub: number
  pitch_ip: string
}

export type WBSCStats = {
  1: WBSCPlayerStats[]
  2: WBSCPlayerStats[]
  3: WBSCPlayerStats[]
  4: WBSCPlayerStats[]
  5: WBSCPlayerStats[]
  6: WBSCPlayerStats[]
  7: WBSCPlayerStats[]
  8: WBSCPlayerStats[]
  9: WBSCPlayerStats[]
  90: WBSCPlayerStats[]
}

export type WBSCBoxScore = {
  [key: string]: WBSCStats | WBSCPitchers
  pitchers: WBSCPitchers
}

export type WBSCGamePlay = {
  batterid: number
  pitcherid: number
  runs: number
  narrative: string
}

export type WBSCGamePlays = {
  [key: number]: {
    top: WBSCGamePlay[]
    bot: WBSCGamePlay[]
  }
}

export type WBSCAllGamePlays = {
  all: WBSCGamePlays
}

export type WBSCAppData = {
  tournamentInfo: WBSCTournamentInfo
  gameData: WBSCGameData
  boxScore: WBSCBoxScore
  gamePlays: WBSCAllGamePlays
}
