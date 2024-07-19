import type { PBPGameAnalysis, PBPPitcherAnalysis, WBSCGamePlay } from './types'

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
        // TODO - we can't guess starting pitcher from "sub" property (see line 100 and on)
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
        const savePitcher = findPitcher(pitchers.save.id, pitcherRecords)!
        // must be correct team
        if (!checkCorrectTeam(savePitcher, winner === 'home' ? homeTeamId : awayTeamId)) {
          pitchingProblems.push('Winning pitcher is from losing team')
        }
        // must have at least 0.1 IP
        if (savePitcher.pitch_ip === '0.0') {
          pitchingProblems.push('Save pitcher doesn\'t have any IP')
        }
        console.log(savePitcher?.firstname + ' ' + savePitcher?.lastname)
      }
    } else {
      pitchingProblems.push('Data object `pitchers` not found')
    }
  } else {
    pitchingProblems.push('Data object `boxScore` not found')
  }

  initPitcherAnalysis()
  homePitchersData.forEach(p => analysis.homePitchers.push(toPBPPitcherAnalysis(p)))
  analysis.currentHomePitcher = analysis.homePitchers.at(0)!
  analysis.currentHomePitcher.starting = true
  awayPitchersData.forEach(p => analysis.awayPitchers.push(toPBPPitcherAnalysis(p)))
  analysis.currentAwayPitcher = analysis.awayPitchers.at(0)!
  analysis.currentAwayPitcher.starting = true

  // go through all recorded plays
  const gamePlays = appData.gamePlays.all

  // test games
  // https://czechsoftball.wbsc.org/cs/events/extraliga-mu-2024/schedule-and-results/box-score/141458
  // https://czechsoftball.wbsc.org/cs/events/extraliga-mu-2024/schedule-and-results/box-score/141462

  // there could be pitching change before first pitch
  // if so, starting pitcher needs to be changed
  // lets find first play with "pitch_pitches: 1" (first pitch actually thrown) and check its "pitcherid"
  // there can be uknown number of "technical" plays (substitutions, comments, etc.) prior to it
  let firstAwayPlay
  let i = 0
  do {
    firstAwayPlay = gamePlays['1'].top.at(i++)
  } while (!firstAwayPlay || firstAwayPlay.pitch_pitches < 1)

  const homeStarter = firstAwayPlay.pitcherid
  if (homeStarter !== analysis.currentHomePitcher.id) {
    analysis.currentHomePitcher.starting = false
    const actualHomeStarter = analysis.homePitchers.find(p => p.id === homeStarter)
    if (actualHomeStarter) {
      actualHomeStarter.starting = true
      console.log(`HOME starting pitcher changed - ${actualHomeStarter.pbpName} threw first pitch`)
    } else {
      pitchingProblems.push(`Home starting pitcher with ID ${homeStarter} not found in data`)
    }
  }

  // although less common, away starting pitcher may also change at the begining of the bottom 1st
  let firstHomePlay
  i = 0
  do {
    firstHomePlay = gamePlays['1'].bot.at(i++)
  } while (!firstHomePlay || firstHomePlay.pitch_pitches < 1)

  const awayStarter = firstHomePlay.pitcherid
  if (awayStarter !== analysis.currentAwayPitcher.id) {
    analysis.currentAwayPitcher.starting = false
    const actualAwayStarter = analysis.awayPitchers.find(p => p.id === awayStarter)
    if (actualAwayStarter) {
      actualAwayStarter.starting = true
      console.log(`AWAY starting pitcher changed - ${actualAwayStarter.pbpName} threw first pitch`)
    } else {
      pitchingProblems.push(`Home starting pitcher with ID ${awayStarter} not found in data`)
    }
  }

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
        const nextPlay = getNextPlay(gamePlays[inn].top, play.playorder)
        changePitcher(play.narrative, nextPlay, true)
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
        const nextPlay = getNextPlay(gamePlays[inn].bot, play.playorder)
        changePitcher(play.narrative, nextPlay, false)
      }
    })
  }

  console.log(analysis.homePitchers)
  console.log(analysis.awayPitchers)

  // confront analysis with scored results

  const pitchers = appData.boxScore.pitchers

  const winningTeamPitchers = isHomeLeading() ? analysis.homePitchers : analysis.awayPitchers
  const losingTeamPitchers = isHomeLeading() ? analysis.awayPitchers : analysis.homePitchers

  // SP cannot get W, if he didn't throw enough innings
  if (winningTeamPitchers.length > 1) {
    const first = winningTeamPitchers.at(0)!
    if (first.win && !checkEnoughInnings(first, innings, variant)) {
      first.win = false
      // TODO we should analyze the "most effective" RP
      winningTeamPitchers.at(1)!.win = true
    }
  }

  const correctWin = winningTeamPitchers.find(p => p.win)!
  if (correctWin.id !== pitchers.win?.id) {
    pitchingProblems.push(`${correctWin?.fullName} should have W (${pitchers.win?.fullName} was scored)`)
  }

  const correctLoss = losingTeamPitchers.find(p => p.loss)!
  if (correctLoss.id !== pitchers.loss?.id) {
    pitchingProblems.push(`${correctLoss?.fullName} should have L (${pitchers.loss?.fullName} was scored)`)
  }

  if (winningTeamPitchers.length > 1) {
    const last = winningTeamPitchers.at(-1)!
    const hasSave = shouldHaveSave(last, correctWin.id)
    if (hasSave && last.id !== pitchers.save?.id) {
      pitchingProblems.push(`${last?.fullName} should have S (${pitchers.save?.fullName || 'N/A'} was scored)`)
    } else if (!hasSave && pitchers.save) {
      pitchingProblems.push(`No pitcher should have S (${pitchers.save.fullName} was scored)`)
    }
  }

  return pitchingProblems
}

function shouldHaveSave(pitcher: PBPPitcherAnalysis, winner: number) {
  return pitcher.id !== winner // W > S
    && (
      pitcher.pitch_ip >= '3.0' // has at least 3 IP
      || (pitcher.pitch_ip >= '1.0' && pitcher.canHaveSave3) // has at least 1 IP and entered with 3 or less runs ahead
      || (pitcher.canHaveSave) // has entered with potentional tying run
    )
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

function isCloseGame(play: WBSCGamePlay) {
  // there is always 1 batter in thr box and 1 in circle who can score 2 points
  // plus there are up to 3 runners
  let closeFactor = 2
  if (play.runner1 > 0) closeFactor++
  if (play.runner2 > 0) closeFactor++
  if (play.runner3 > 0) closeFactor++
  const difference = Math.abs(analysis.homePoints - analysis.awayPoints)
  // closer may have save, if there is potential to tie the game for the batter in circle
  return difference <= closeFactor
}

function homeTakesLead() {
  clearWLS()
  analysis.currentAwayPitcher!.loss = true
  analysis.currentHomePitcher!.win = true
  analysis.homeTeamIsAhead = true
  analysis.awayTeamIsAhead = false
}

function awayTakesLead() {
  clearWLS()
  analysis.currentAwayPitcher!.win = true
  analysis.currentHomePitcher!.loss = true
  analysis.awayTeamIsAhead = true
  analysis.homeTeamIsAhead = false
}

function gameTiedAgain() {
  clearWLS()
  analysis.homeTeamIsAhead = false
  analysis.awayTeamIsAhead = false
}

function clearWLS() {
  analysis.homePitchers.forEach((p) => {
    p.win = p.loss = p.canHaveSave = p.canHaveSave3 = false
  })
  analysis.awayPitchers.forEach((p) => {
    p.win = p.loss = p.canHaveSave = p.canHaveSave3 = false
  })
}

function changePitcher(play: string, nextPlay: WBSCGamePlay, home: boolean) {
  const subInfo = play.split(' ')
  const newPitcher = `${subInfo[2]} ${subInfo[3]}`
  if (home) {
    analysis.homePitchers.forEach((p) => {
      if (p.pbpName === newPitcher) {
        analysis.currentHomePitcher = p
        analysis.currentHomePitcher.canHaveSave = isHomeLeading() && isCloseGame(nextPlay)
        analysis.currentHomePitcher.canHaveSave3 = isHomeLeading() && analysis.homePoints - analysis.awayPoints <= 3
      }
    })
  } else {
    analysis.awayPitchers.forEach((p) => {
      if (p.pbpName === newPitcher) {
        analysis.currentAwayPitcher = p
        analysis.currentAwayPitcher.canHaveSave = isAwayLeading() && isCloseGame(nextPlay)
        analysis.currentAwayPitcher.canHaveSave3 = isAwayLeading() && analysis.awayPoints - analysis.homePoints <= 3
      }
    })
  }
}

function getNextPlay(plays: WBSCGamePlay[], order: number) {
  return plays.find(p => p.playorder = order + 1)!
}

function toPBPPitcherAnalysis(stats: WBSCPlayerStats): PBPPitcherAnalysis {
  return {
    id: stats.playerid,
    pbpName: `#${stats.uniform} ${stats.lastname}`,
    fullName: `${stats.lastname} ${stats.firstname}`,
    pitch_ip: stats.pitch_ip,
  }
}

function initPitcherAnalysis() {
  analysis.homePitchers.length = 0
  analysis.currentHomePitcher = undefined
  analysis.homePoints = 0
  analysis.homeTeamIsAhead = false

  analysis.awayPitchers.length = 0
  analysis.currentAwayPitcher = undefined
  analysis.awayPoints = 0
  analysis.awayTeamIsAhead = false
}
