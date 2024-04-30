const analysis: PBPPitchingAnalysis = {
  homePitchers: [],
  homePoints: 0,
  homeTeamIsAhead: false,
  awayPitchers: [],
  awayPoints: 0,
  awayTeamIsAhead: false,
}

export function analyzePitching(gameAnalysis: PBPGameAnalysis, appData: WBSCAppData) {
  const pitchingProblems: string[] = []

  console.log(gameAnalysis)

  const { variant, homeTeamId, awayTeamId, innings, winner } = gameAnalysis

  const homePitchersData: WBSCPlayerStats[] = []
  const awayPitchersData: WBSCPlayerStats[] = []
  const boxScore = appData.boxScore
  if (boxScore) {
    const homeStats = boxScore[homeTeamId] as WBSCStats
    homePitchersData.push(...homeStats['90'])
    if (homePitchersData.length < 1) {
      pitchingProblems.push('Stats data for `homePitchers` not found')
    }
    const awayStats = boxScore[awayTeamId] as WBSCStats
    awayPitchersData.push(...awayStats['90'])
    if (awayPitchersData.length < 1) {
      pitchingProblems.push('Stats data for `awayPitchers` not found')
    }
    const pitcherRecords = [...homePitchersData, ...awayPitchersData]

    const pitchers = boxScore.pitchers
    if (pitchers) {
      if (pitchers.win) {
        const winPitcher = findPitcher(pitchers.win.id, pitcherRecords)!
        // must be correct team
        if (!checkCorrectTeam(winPitcher, winner === 'home' ? homeTeamId : awayTeamId)) {
          pitchingProblems.push('Winning pitcher is from losing team')
        }
        // must have at least 0.1 IP
        if (winPitcher.pitch_ip === '0.0') {
          pitchingProblems.push('Winning pitcher doesn\'t have any IP')
        }
        // starter must have enough innings
        if (winPitcher.sub === 0 && !checkEnoughInnings(winPitcher, innings, variant)) {
          pitchingProblems.push('Starting pitcher doesn\'t have enough IP to get the win')
        }
        console.log(winPitcher?.firstname + ' ' + winPitcher?.lastname)
      } else {
        pitchingProblems.push('Winning pitcher not set')
      }
      if (pitchers.loss) {
        const lossPitcher = findPitcher(pitchers.loss.id, pitcherRecords)!
        // must be correct team
        if (!checkCorrectTeam(lossPitcher, winner === 'home' ? awayTeamId : homeTeamId)) {
          pitchingProblems.push('Winning pitcher is from losing team')
        }
        // must have at least 0.1 IP
        if (lossPitcher.pitch_ip === '0.0') {
          pitchingProblems.push('Losing pitcher doesn\'t have any IP')
        }
        console.log(lossPitcher?.firstname + ' ' + lossPitcher?.lastname)
      } else {
        pitchingProblems.push('Losing pitcher not set')
      }
      if (pitchers.save) {
        // TODO check if valid S
        const savePitcher = findPitcher(pitchers.save.id, pitcherRecords)!
        // must be correct team
        if (!checkCorrectTeam(savePitcher, winner === 'home' ? homeTeamId : awayTeamId)) {
          pitchingProblems.push('Winning pitcher is from losing team')
        }
        // must have at least 0.1 IP
        if (savePitcher.pitch_ip === '0.0') {
          pitchingProblems.push('Save pitcher doesn\'t have any IP')
        }
        // TODO rules must be fullfiled
        console.log(savePitcher?.firstname + ' ' + savePitcher?.lastname)
      } else {
        // TODO check if SAVE necessary
      }
    } else {
      pitchingProblems.push('Data object `pitchers` not found')
    }
  } else {
    pitchingProblems.push('Data object `boxScore` not found')
  }

  // export function analyzePitching(gamePlays: WBSCGamePlays, pitchers: WBSCPitchers, homePitchersData: WBSCPlayerStats[], awayPitchersData: WBSCPlayerStats[]): string[] {
  init()
  homePitchersData.forEach(p => analysis.homePitchers.push(toPBPPitcherAnalysis(p)))
  analysis.currentHomePitcher = analysis.homePitchers.at(0)!
  analysis.currentHomePitcher.starting = true
  awayPitchersData.forEach(p => analysis.awayPitchers.push(toPBPPitcherAnalysis(p)))
  analysis.currentAwayPitcher = analysis.awayPitchers.at(0)!
  analysis.currentAwayPitcher.starting = true

  const gamePlays = appData.gamePlays.all
  for (const inn in gamePlays) {
    gamePlays[inn].top?.forEach((play) => {
      // handle scoring plays
      if (play.narrative.includes('scores') || play.narrative.includes('homers')) {
        console.log(play.narrative)
        analysis.awayPoints += play.runs
        if (isAwayLeading() && !analysis.awayTeamIsAhead) {
          awayTakesLead()
          console.log('AWAY takes the lead', analysis.homePoints, analysis.awayPoints)
          console.log('Pitchers', analysis.currentHomePitcher?.pbpName, analysis.currentAwayPitcher?.pbpName)
        } else if (isTiedGame() && analysis.homeTeamIsAhead) {
          gameTiedAgain()
          console.log('AWAY tied the game', analysis.homePoints, analysis.awayPoints)
        }
      }
      // handle substitutions
      if (play.narrative.includes('Pitching Change')) {
        console.log(play.narrative)
        changePitcher(play.narrative, true)
      }
    })
    gamePlays[inn].bot?.forEach((play) => {
      // handle scoring plays
      if (play.narrative.includes('scores') || play.narrative.includes('homers')) {
        console.log(play.narrative)
        analysis.homePoints += play.runs
        if (isHomeLeading() && !analysis.homeTeamIsAhead) {
          homeTakesLead()
          console.log('HOME takes the lead', analysis.homePoints, analysis.awayPoints)
          console.log('Pitchers', analysis.currentHomePitcher?.pbpName, analysis.currentAwayPitcher?.pbpName)
        } else if (isTiedGame() && analysis.awayTeamIsAhead) {
          gameTiedAgain()
          console.log('HOME tied the game', analysis.homePoints, analysis.awayPoints)
        }
      }
      // handle substitutions
      if (play.narrative.includes('Pitching Change')) {
        console.log(play.narrative)
        changePitcher(play.narrative, false)
      }
    })
  }

  console.log(analysis.homePitchers)
  console.log(analysis.awayPitchers)

  // confront analysis with scored results

  const pitchers = appData.boxScore.pitchers

  const winningTeamPitchers = isHomeLeading() ? analysis.homePitchers : analysis.awayPitchers
  const losingTeamPitchers = isHomeLeading() ? analysis.awayPitchers : analysis.homePitchers

  const correctWin = winningTeamPitchers.find(p => p.win)
  if (correctWin?.id !== pitchers.win?.id) {
    if (correctWin?.starting && !checkEnoughInnings(correctWin, innings, variant)) {
      // TODO can we verify it is the best choice?
      console.log('Starting pitcher has not enough IP => someone else was correctly chosen by the scorer')
    } else {
      pitchingProblems.push(`Winning pitcher should be ${correctWin?.fullName} (${pitchers.win?.fullName} was scored)`)
    }
  }
  const correctLoss = losingTeamPitchers.find(p => p.loss)
  if (correctLoss?.id !== pitchers.loss?.id) {
    pitchingProblems.push(`Losing pitcher should be ${correctLoss?.fullName} (${pitchers.loss?.fullName} was scored)`)
  }

  return pitchingProblems
}

function isHomeLeading() {
  return analysis.homePoints > analysis.awayPoints
}

function isAwayLeading() {
  return analysis.awayPoints > analysis.homePoints
}

function isTiedGame() {
  return analysis.homePoints === analysis.awayPoints
}

function homeTakesLead() {
  clearWL()
  analysis.currentAwayPitcher!.loss = true
  analysis.currentHomePitcher!.win = true
  analysis.homeTeamIsAhead = true
  analysis.awayTeamIsAhead = false
}

function awayTakesLead() {
  clearWL()
  analysis.currentAwayPitcher!.win = true
  analysis.currentHomePitcher!.loss = true
  analysis.awayTeamIsAhead = true
  analysis.homeTeamIsAhead = false
}

function gameTiedAgain() {
  clearWL()
  analysis.homeTeamIsAhead = false
  analysis.awayTeamIsAhead = false
}

function clearWL() {
  analysis.homePitchers.forEach((p) => {
    p.win = p.loss = false
  })
  analysis.awayPitchers.forEach((p) => {
    p.win = p.loss = false
  })
}

function changePitcher(play: string, home: boolean) {
  const subInfo = play.split(' ')
  const newPitcher = `${subInfo[2]} ${subInfo[3]}`
  if (home) {
    analysis.homePitchers.forEach((p) => {
      if (p.pbpName === newPitcher) {
        analysis.currentHomePitcher = p
      }
    })
  } else {
    analysis.awayPitchers.forEach((p) => {
      if (p.pbpName === newPitcher) {
        analysis.currentAwayPitcher = p
      }
    })
  }
}

function toPBPPitcherAnalysis(stats: WBSCPlayerStats): PBPPitcherAnalysis {
  return {
    id: stats.playerid,
    pbpName: `#${stats.uniform} ${stats.lastname}`,
    fullName: `${stats.lastname} ${stats.firstname}`,
    pitch_ip: stats.pitch_ip,
  }
}

function init() {
  analysis.homePitchers.length = 0
  analysis.currentHomePitcher = undefined
  analysis.homePoints = 0
  analysis.homeTeamIsAhead = false

  analysis.awayPitchers.length = 0
  analysis.currentAwayPitcher = undefined
  analysis.awayPoints = 0
  analysis.awayTeamIsAhead = false
}
