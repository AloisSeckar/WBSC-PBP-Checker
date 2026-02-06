export function analyzeEarnedRuns(gamePlays: WBSCGamePlays): string[] {
  console.log('Analyzing earned runs')

  const issues: string[] = []

  for (const inn in gamePlays) {
    issues.push(...analyzeInvalidER(gamePlays[inn]!.top, inn, true))
    issues.push(...analyzeInvalidER(gamePlays[inn]!.bot, inn, false))
  }

  return issues
}

function analyzeInvalidER(plays: WBSCGamePlay[], inn: string, top: boolean) {
  const issues: string[] = []

  const reachedOnError: string[] = []
  plays?.forEach((play) => {
    const situation = play.narrative
    // if player reaches on error, note him down for later
    if (situation.includes('reaches') && situation.includes('error')) {
      const reachingPlayer = situation.substring(0, situation.indexOf('reaches') - 1)
      console.log(reachingPlayer + ' reached on error')
      reachedOnError.push(reachingPlayer)
    }
    // if player scores, check if he was scored as "unearned"
    // more than one player can score during one play
    const subSituations = situation.split('. ')
    subSituations.forEach((s) => {
      if (s.includes('scores')) {
        console.log(s)
        const scoringPlayer = s.match(/^(.*)\sscores/)?.[1]
        console.log(scoringPlayer + ' scored')
        // TODO WIP not working correctly (where to get ER/UE info?)
        if (scoringPlayer && reachedOnError.includes(scoringPlayer)) {
          issues.push(`Inning ${inn} (${top ? 'TOP' : 'BOT'}) - ${scoringPlayer} reached on error, his run should be UNEARNED`)
        }
      }
    })
  })

  return issues
}
