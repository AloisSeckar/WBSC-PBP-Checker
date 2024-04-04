export function findPitcher (playerId: string, pitchers: any) {
  return pitchers?.find((p: any) => p.playerid === playerId)
}
