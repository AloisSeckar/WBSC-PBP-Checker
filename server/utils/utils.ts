export function findPitcher (playerId: string, pitchers: any) {
  return pitchers?.find((p: any) => p.playerid === playerId)
}

export function checkCorrectTeam (pitcher: any, teamId: number) {
  return pitcher.teamid === teamId
}

export function checkEnoughInnings (pitcher: any, innings: number, variant: string) {
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
    // eslint-disable-next-line no-lonely-if
    if (innings < 6) {
      return ip >= '4.0'
    } else {
      return ip >= '5.0'
    }
  }
}
