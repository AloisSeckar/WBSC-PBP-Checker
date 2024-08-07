// NOTE: typically there should be absolutely no issues with the incomming data
// but this is implemented to make a rock-solid check before diving into them

export function analyzeInput(appData: WBSCAppData): string[] {
  console.log('Analyzing input data')

  const issues: string[] = []

  if (appData) {
    if (!appData.tournamentInfo) {
      issues.push('Data object `tournamentInfo` not found')
    }
    if (!appData.gameData) {
      issues.push('Data object `gameData` not found')
    }
    if (!appData.gameData.assignments) {
      issues.push('Data object `gameData.assignments` not found')
    }
    if (!appData.gamePlays.all) {
      issues.push('Data object `gameData.gamePlays.all` not found')
    }
  } else {
    issues.push('Data object not defined')
  }

  return issues
}
