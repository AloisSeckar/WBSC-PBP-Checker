const homePitchers: PBPPitcherAnalysis[] = []
let currentHomePitcher: PBPPitcherAnalysis | undefined = undefined
let homePoints = 0
let homeTeamIsAhead = false

const awayPitchers: PBPPitcherAnalysis[] = []
let currentAwayPitcher: PBPPitcherAnalysis | undefined = undefined
let awayPoints = 0
let awayTeamIsAhead = false

export function analyzePitching(gamePlays: WBSCGamePlays, pitchers: WBSCPitchers, homePitchersData: WBSCPlayerStats[], awayPitchersData: WBSCPlayerStats[]): string[] {
  init()
  homePitchersData.forEach(p => homePitchers.push({
    id: p.playerid,
    pbpName: `#${p.uniform} ${p.lastname}`,
    fullName: `${p.lastname} ${p.firstname}`,
  }))
  currentHomePitcher = homePitchers.at(0)
  awayPitchersData.forEach(p => awayPitchers.push({
    id: p.playerid,
    pbpName: `#${p.uniform} ${p.lastname}`,
    fullName: `${p.lastname} ${p.firstname}`,
  }))
  currentAwayPitcher = awayPitchers.at(0)

  for (const inn in gamePlays) {
    gamePlays[inn].top?.forEach((play) => {
      // handle scoring plays
      if (play.narrative.includes('scores') || play.narrative.includes('homers')) {
        console.log(play.narrative)
        awayPoints += play.runs
        if (awayPoints > homePoints && !awayTeamIsAhead) {
          awayTakesLead()
          console.log('AWAY takes the lead', homePoints, awayPoints)
        } else if (awayPoints === homePoints && homeTeamIsAhead) {
          gameTied()
          console.log('AWAY tied the game', homePoints, awayPoints)
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
        homePoints += play.runs
        if (homePoints > awayPoints && !homeTeamIsAhead) {
          homeTakesLead()
          console.log('HOME takes the lead', homePoints, awayPoints)
        } else if (homePoints === awayPoints && awayTeamIsAhead) {
          gameTied()
          console.log('HOME tied the game', homePoints, awayPoints)
        }
      }
      // handle substitutions
      if (play.narrative.includes('Pitching Change')) {
        console.log(play.narrative)
        changePitcher(play.narrative, false)
      }
    })
  }

  console.log(homePitchers)
  console.log(awayPitchers)

  // confront analysis with scored results
  const pitchingProblems: string[] = []

  const winningTeamPitchers = homePoints > awayPoints ? homePitchers : awayPitchers
  const losingTeamPitchers = homePoints > awayPoints ? awayPitchers : homePitchers

  const correctWin = winningTeamPitchers.find(p => p.win)
  if (correctWin?.id !== pitchers.win?.id) {
    pitchingProblems.push(`Winning pitcher should be ${correctWin?.fullName} (${pitchers.win?.fullName} was scored)`)
  }
  const correctLoss = losingTeamPitchers.find(p => p.loss)
  if (correctLoss?.id !== pitchers.loss?.id) {
    pitchingProblems.push(`Losing pitcher should be ${correctLoss?.fullName} (${pitchers.loss?.fullName} was scored)`)
  }

  return pitchingProblems
}

function homeTakesLead() {
  homePitchers.forEach(p => p.win = false)
  awayPitchers.forEach(p => p.loss = false)
  currentAwayPitcher!.loss = true
  currentHomePitcher!.win = true
  homeTeamIsAhead = true
  awayTeamIsAhead = false
}

function awayTakesLead() {
  homePitchers.forEach(p => p.win = false)
  awayPitchers.forEach(p => p.loss = false)
  currentAwayPitcher!.win = true
  currentHomePitcher!.loss = true
  awayTeamIsAhead = true
  homeTeamIsAhead = false
}

function gameTied() {
  homePitchers.forEach(p => p.win = false)
  awayPitchers.forEach(p => p.loss = false)
  homeTeamIsAhead = false
  awayTeamIsAhead = false
}

function changePitcher(play: string, home: boolean) {
  const subInfo = play.split(' ')
  const newPitcher = `${subInfo[2]} ${subInfo[3]}`
  if (home) {
    homePitchers.forEach((p) => {
      if (p.pbpName === newPitcher) {
        currentHomePitcher = p
      }
    })
  } else {
    awayPitchers.forEach((p) => {
      if (p.pbpName === newPitcher) {
        currentAwayPitcher = p
      }
    })
  }
}

function init() {
  homePitchers.length = 0
  currentHomePitcher = undefined
  homePoints = 0
  homeTeamIsAhead = false
  awayPitchers.length = 0
  currentAwayPitcher = undefined
  awayPoints = 0
  awayTeamIsAhead = false
}
