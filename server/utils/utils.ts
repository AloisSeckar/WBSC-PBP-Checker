export function findPitcher (playerId: string, homePitchers: any, awayPitchers: any) {
  let ret = homePitchers?.find((p: any) => p.playerid === playerId)
  if (!ret) {
    ret = awayPitchers?.find((p: any) => p.playerid === playerId)
  }
  return ret
}
