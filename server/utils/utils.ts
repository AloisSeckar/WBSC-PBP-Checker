export function findPitcher(playerId: number, pitchers: PBPPitcherAnalysis[]) {
  return pitchers?.find((p: PBPPitcherAnalysis) => p.id === playerId)
}

export function checkCorrectTeam(pitcher: PBPPitcherAnalysis, teamId: number) {
  return pitcher.teamId === teamId
}

export function checkEnoughInnings(pitcher: { pitch_ip: string }, innings: number, variant: string) {
  const ip = pitcher.pitch_ip

  if (variant === 'softball') {
    switch (innings) {
      case 3:
        return ip >= '2.0'
      case 4:
      case 5:
        return ip >= '3.0'
      default:
        return ip >= '4.0'
    }
  } else {
    if (innings < 6) {
      return ip >= '4.0'
    } else {
      return ip >= '5.0'
    }
  }
}
