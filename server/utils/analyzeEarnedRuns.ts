export async function analyzeEarnedRuns(gamePlays: WBSCGamePlays): Promise<string[]> {
  console.log('Analyzing earned runs')

  const erIssues: string[] = []

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
    erIssues.push(...await analyzeInvalidER(gamePlays[inn]!.top, opts))
    opts.top = false
    erIssues.push(...await analyzeInvalidER(gamePlays[inn]!.bot, opts))
  }

  return erIssues
}

async function analyzeInvalidER(plays: WBSCGamePlay[], opts: { inn: number, top: boolean, substitutions: number }) {
  const issues: string[] = []

  if (!plays) {
    console.log(`No plays found for inning ${opts.inn} (${opts.top ? 'TOP' : 'BOT'})`)
    return issues
  }

  const runners: PBPERAnalysisRunner[] = []
  let opportunites = 0

  for (let i = 0; i < plays.length - 1; i++) {
    try {
      const play = plays[i]!

      // initial "Play ball" has no detail => skip
      if (play.playorder === 0) {
        continue
      }

      // get the PBP text
      const narrative = play.narrative
      // extract all parts (sentences)
      const narratives = narrative.split('. ')

      // substitutions (including pinch hitter/runner) don't have their own play => adjust the offset
      if (narrative.includes('Change:') || narrative.includes('Substitution:') || narrative.includes('Pinch')) {
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

      // check real outs
      if (narrative.includes('1 out.')) {
        opportunites++
      } else if (narrative.includes('2 out.')) {
        opportunites++
      }

      // attention: during tiebreak, we need to place player on 2nd base
      if (narrative === '-') {
        runners.push({
          runner: 'tiebreak', // name is not really important here
          pitcher: play.pitcherid,
          reachedOnError: false,
          scoredAfter3rdOpportunity: false,
          run: false,
          tiebreak: true,
          // all tiebreak runners are unearned
          earnedRun: false,
        })
      }

      // attention: there might be pinch runner
      // example: 'Pinch Runner: #8 KALáBEK for #7 KLACL at 1st'
      if (narrative.includes('Pinch Runner')) {
        const substitution = narrative.match(/Pinch Runner:\s#\d+\s(.*)\sfor\s#\d+\s(.*)\sat\s(.*)/)
        const runnerOut = substitution!.at(2)!
        const runnerIn = substitution!.at(1)!
        runners.find(r => r.runner.includes(runnerOut) || r.tiebreak)!.runner = runnerIn
      }

      // look for batters reaching the base and add them as runners
      const batterPlay = narratives[0]!
      if (batterPlay.includes('singles') || batterPlay.includes('doubles') || batterPlay.includes('triples') || batterPlay.includes('homers') || batterPlay.includes('reaches') || batterPlay.includes('Hit By Pitch') || batterPlay.includes('walks') || batterPlay.includes('is intentionally walked')) {
        const newRunner = {
          runner: batterPlay.match(/^(.*)\s(singles|doubles|triples|homers|reaches|Hit By Pitch|walks|is intentionally walked)/)?.[1] || '???',
          pitcher: play.pitcherid,
          reachedOnError: false,
          scoredAfter3rdOpportunity: false,
          tiebreak: false,
          run: false,
          // no more runs after 3rd opportunity can be earned
          earnedRun: opportunites < 3,
        }

        // error plays
        // possible variants from PBP - 'reaches on *':
        // - fielding error
        // - throwing error
        // - muffed catch error
        // - dropped fly error
        // - obstruction
        // - error
        // - a strikeout passed ball
        // - a strikeout error
        if (batterPlay.includes('error') || batterPlay.includes('strikeout passed ball') || batterPlay.includes('obstruction')) {
          // TODO this might be not necessary...
          newRunner.reachedOnError = true
          // run cannot be earned
          newRunner.earnedRun = false
          // +1 "virtual" out
          opportunites++
        }

        runners.push(newRunner)
      }

      // look for scoring plays
      if (narrative.includes('scores') || narrative.includes('homers')) {
        // mark runners who scored during this play
        for (const n of narratives) {
          if (n.includes('scores') || n.includes('homers')) {
            const scoringPlayer = n.match(/^(.*)\s(scores|homers)/)?.[1] || '???'

            // try getting runner by name
            let runner = runners.find(r => scoringPlayer.includes(r.runner))
            if (!runner) {
              // if runner not found by name, it might be a tiebreaker runner
              // (the name is not easily extractable)
              runner = runners.find(r => scoringPlayer.includes(r.runner))
            }

            if (!runner) {
              console.warn(`Runner not found for scoring player ${scoringPlayer} in inning ${opts.inn} (${opts.top ? 'TOP' : 'BOT'})`)
              continue
            }

            // run was made
            runner.run = true
            // how many out opportunities were there?
            runner.scoredAfter3rdOpportunity = opportunites >= 3
            // run cannot be earned:
            // - after 3rd opportunity
            // - if runner reached on error
            // - if it tiebreaker runner
            runner.earnedRun = !runner.reachedOnError && !runner.scoredAfter3rdOpportunity && !runner.tiebreak
          }
        }

        // check how many R/ER should be scored for this play
        const pitchers: PBPERAnalysisPitcher[] = []
        for (const r of runners) {
          // if runner scored
          if (r.run) {
            // get pitcher or create new record
            let pitcher = pitchers.find(p => p.pitcher === r.pitcher)
            if (!pitcher) {
              pitcher = { pitcher: r.pitcher, runs: 0, earnedRuns: 0 }
              pitchers.push(pitcher)
            }
            // increase R/ER
            pitcher.runs++
            if (r.earnedRun) {
              pitcher.earnedRuns++
            }
          }
        }

        // check how many R/ER were scored in PBP
        let erIssues = 0
        for (const p of pitchers) {
          // get pitcher ER before and after the play
          const pitcherBefore = await getPitcherDetails(play.gameid, p.pitcher, playOrder - 1)
          const pitcherCurrent = await getPitcherDetails(play.gameid, p.pitcher, playOrder)

          // comment this out for debugging / DO NOT DELETE
          // const rBefore = pitcherBefore?.PITCHR || 0
          // const rCurrent = pitcherCurrent?.PITCHR || 0
          // const runsScored = rCurrent - rBefore

          const erBefore = pitcherBefore?.PITCHER || 0
          const erCurrent = pitcherCurrent?.PITCHER || 0
          const earnedRunsScored = erCurrent - erBefore

          if (earnedRunsScored !== p.earnedRuns) {
            erIssues = earnedRunsScored > p.earnedRuns ? 1 : 2
            issues.push(`Inning ${opts.inn} (${opts.top ? 'TOP' : 'BOT'}) - Pitcher ${pitcherCurrent?.name} got ${earnedRunsScored} ER, but should be credited ${p.earnedRuns} ER based on the PBP analysis`)
          }
        }

        if (erIssues === 1) {
          for (const r of runners.filter(r => r.run && !r.earnedRun)) {
            if (r.scoredAfter3rdOpportunity) {
              issues.push(`Inning ${opts.inn} (${opts.top ? 'TOP' : 'BOT'}) - Runner ${r.runner} scored after 3rd opportunity, the run should be UNEARNED`)
            }
            if (r.reachedOnError) {
              issues.push(`Inning ${opts.inn} (${opts.top ? 'TOP' : 'BOT'}) - Runner ${r.runner} reached on error and scored, the run should be UNEARNED`)
            }
            if (r.tiebreak) {
              issues.push(`Inning ${opts.inn} (${opts.top ? 'TOP' : 'BOT'}) - Runner ${r.runner} scored as a tiebreaker runner, the run should be UNEARNED`)
            }
          }
        } else if (erIssues === 2) {
          for (const r of runners.filter(r => r.run && r.earnedRun)) {
            issues.push(`Inning ${opts.inn} (${opts.top ? 'TOP' : 'BOT'}) - Runner ${r.runner} should be scored as earned`)
          }
        }

        // remove runners who scored from further iteration
        while (runners.some(r => r.run)) {
          const index = runners.findIndex(r => r.run)
          runners.splice(index, 1)
        }
      }
    } catch (err) {
      console.error((err as Error)?.message || 'unknown')
      console.log('Error context: ', plays[i]?.playorder, plays[i]?.narrative)
    }
  }

  return issues
}

async function getPitcherDetails(gameId: number, pitcherId: number, playOrder: number): Promise<WBSCGamePlayDetailBoxScore | undefined> {
  const playDetail = await $fetch<WBSCGamePlayDetail>(`https://s3-eu-west-1.amazonaws.com/game.wbsc.org/gamedata/${gameId}/play${playOrder}.json`)

  let pitcher: WBSCGamePlayDetailBoxScore | undefined
  for (const key of Object.keys(playDetail.boxscore)) {
    const boxscore = playDetail.boxscore[key]!
    if (parseInt(boxscore.playerid) === pitcherId && boxscore.PITCHER) {
      pitcher = boxscore
    }
  }

  return pitcher
}
