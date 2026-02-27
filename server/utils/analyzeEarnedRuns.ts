export async function analyzeEarnedRuns(gamePlays: WBSCGamePlays): Promise<string[]> {
  console.log('Analyzing earned runs')

  const issues: string[] = []

  const opts = {
    inn: 1,
    top: true,
    // substitutions doesn't create its own play, so the playoder start to differ
    // and index must be adjusted (lowered) accordingly
    substitutions: 0,
  }

  for (const inn in gamePlays) {
    opts.inn = parseInt(inn)
    opts.top = true
    issues.push(...await analyzeInvalidER(gamePlays[inn]!.top, opts))
    opts.top = false
    issues.push(...await analyzeInvalidER(gamePlays[inn]!.bot, opts))
  }

  return issues
}

async function analyzeInvalidER(plays: WBSCGamePlay[], opts: { inn: number, top: boolean, substitutions: number }) {
  const issues: string[] = []

  if (!plays) {
    console.warn(`No plays found for inning ${opts.inn} (${opts.top ? 'TOP' : 'BOT'})`)
    return issues
  }

  const reachedOnError: string[] = []
  let twoOuts = false
  let opportunites = 0

  for (let i = 0; i < plays.length - 1; i++) {
    try {
      const play = plays[i]!

      // initial "Play ball" has no detail => skip
      if (play.playorder === 0) {
        continue
      }

      // substitutions (including pinch hitter/runner) don't have their own play => adjust the offset
      if (play.narrative.includes('Change:') || play.narrative.includes('Substitution:') || play.narrative.includes('Pinch')) {
        opts.substitutions++
      }

      const lastPlay = i === plays.length - 2

      // initial offset is "+1" (plays are indexed from 0, details from 1)
      // for the last play of the inning, offset must be "+2", because detail for last play is skipped and merged with "inning end" message
      const playOrder = (lastPlay ? play.playorder + 2 : play.playorder + 1) - opts.substitutions

      // fetch detail from WBSC API
      // comment this out for debugging / DO NOT DELETE
      // const playDetail = await $fetch<WBSCGamePlayDetail>(`https://s3-eu-west-1.amazonaws.com/game.wbsc.org/gamedata/${play.gameid}/play${playOrder}.json`)
      // console.log(play.playorder, play.narrative, playDetail.lastplayloaded + 1, playDetail.platecount[lastPlay ? 1 : 0]?.label)

      const situation = play.narrative
      if (situation.includes('1 out.')) {
        opportunites++
      } else if (situation.includes('2 out.')) {
        opportunites++
        twoOuts = true
      }

      // look for batters reaching base on error
      // if player reaches on error, note him down for later
      // TODO possible varians from PBP - reaches on *:
      // - fielding error
      // - throwing error
      // - muffed catch error
      // - dropped fly error
      // - obstruction
      // - error
      // - a strikeout passed ball
      // - a strikeout error
      if (situation.includes('reaches') && situation.includes('error')) {
        const reachingPlayer = situation.substring(0, situation.indexOf('reaches') - 1)
        // console.warn(reachingPlayer + ' reached on error')
        reachedOnError.push(reachingPlayer)
        //
        opportunites++
      }
      // look for scoring plays
      if (situation.includes('scores') || situation.includes('homeres')) {
        // TODO for some reason there are no runs after scoring plays...different pitcher maybe?

        // get pitcher ER before and after the play
        const pitcherBefore = await getPitcherDetails(play.gameid, play.pitcherid, playOrder - 1)
        const pitcherCurrent = await getPitcherDetails(play.gameid, play.pitcherid, playOrder)

        const rBefore = pitcherBefore?.PITCHR || 0
        const rCurrent = pitcherCurrent?.PITCHR || 0
        const erBefore = pitcherBefore?.PITCHER || 0
        const erCurrent = pitcherCurrent?.PITCHER || 0

        const runsScored = rCurrent - rBefore
        const earnedRunsScored = erCurrent - erBefore

        console.log(situation)
        console.warn(`Runs scored: ${runsScored}`)
        console.warn(`Earned runs scored: ${earnedRunsScored}`)

        const subSituations = situation.split('. ')
        subSituations.forEach((s) => {
          if (s.includes('scores')) {
            const scoringPlayer = s.match(/^(.*)\sscores/)?.[1]
            if (twoOuts && opportunites > 2) {
              // after 2nd out, no more runs can be earned
              issues.push(`Inning ${opts.inn} (${opts.top ? 'TOP' : 'BOT'}) - ${scoringPlayer} scored after 3rd opportunity, the run should be UNEARNED`)
            } else {
              // with less than 2 outs, if player scores, check if he was scored as "unearned"
              // more than one player can score during one play
              if (scoringPlayer && reachedOnError.includes(scoringPlayer)) {
                issues.push(`Inning ${opts.inn} (${opts.top ? 'TOP' : 'BOT'}) - ${scoringPlayer} reached on error and scored, the run should be UNEARNED`)
              }
            }
          }
        })
      }
    } catch (err) {
      console.error((err as Error)?.message || 'unknown')
      console.log(plays[i]?.playorder, plays[i]?.narrative)
    }
  }

  return issues
}

async function getPitcherDetails(gameId: number, pitcherId: number, playOrder: number): Promise<WBSCGamePlayDetailBoxScore | undefined> {
  const playDetail = await $fetch<WBSCGamePlayDetail>(`https://s3-eu-west-1.amazonaws.com/game.wbsc.org/gamedata/${gameId}/play${playOrder}.json`)

  let pitcher: WBSCGamePlayDetailBoxScore | undefined
  Object.keys(playDetail.boxscore).forEach((key) => {
    const boxscore = playDetail.boxscore[key]!
    if (parseInt(boxscore.playerid) === pitcherId && boxscore.PITCHER) {
      pitcher = boxscore
    }
  })

  return pitcher
}
