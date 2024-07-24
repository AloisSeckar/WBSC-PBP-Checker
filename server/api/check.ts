import { parse } from 'node-html-parser'

export default defineEventHandler(async (event): Promise<PBPCheck> => {
  const body = await readBody(event) as PBPGameCheckRequest
  const gameLinks = body?.gameLinks

  const games: PBPGameCheck[] = []

  for (const gameLink of gameLinks) {
    const problems: string[] = []

    let gameTitle = 'UNKNOWN'
    let gameScorer = 'UNKNOWN'
    let gameData
    let appData
    let gamePlays: WBSCGamePlays
    try {
      const pbpHTMLData = await $fetch<string>(gameLink)
      const pbpHTMLPage = parse(pbpHTMLData)

      const app = pbpHTMLPage.querySelector('#app')
      const appDataString = app?.attrs['data-page']
      if (appDataString) {
        appData = JSON.parse(appDataString).props.viewData.original as WBSCAppData
      }

      if (appData) {
        let innings = 0
        let homeTeamId = 0
        let awayTeamId = 0

        let variant: PBPVariant = 'baseball'
        let winner: PBPWinner = 'home'

        const tournamentInfo = appData.tournamentInfo
        if (tournamentInfo) {
          variant = tournamentInfo.innings === 9 ? 'baseball' : 'softball'
        } else {
          problems.push('Data object `tournamentInfo` not found')
        }

        gameData = appData.gameData
        if (gameData) {
          homeTeamId = gameData.homeid
          awayTeamId = gameData.awayid

          innings = gameData.innings

          // elaborate winning team
          const homePoints = gameData.homeruns
          const awayPoints = gameData.awayruns
          if (homePoints === awayPoints) {
            problems.push(`Game ended with a tie (${homePoints}:${awayPoints})`)
          }
          winner = homePoints > awayPoints ? 'home' : 'away'

          // build game title
          gameTitle = `#${gameData.gamenumber} - ${gameData.homeioc} ${homePoints} vs. ${awayPoints} ${gameData.awayioc} (${gameData.start})`

          // get scorer(s) name
          if (gameData.assignments) {
            console.log(gameData.assignments)
            const scorers: string[] = []
            gameData.assignments.forEach((a) => {
              if (a.type === 1) { // 0 = Umpires, 1 = scorers, 2 = TCs
                scorers.push(a.person?.label || 'UNKNOWN')
              }
            })
            gameScorer = scorers.join(', ')
            console.log(gameScorer)
          } else {
            problems.push('Data object `assignments` not found')
          }
        } else {
          problems.push('Data object `gameData` not found')
        }

        const gameAnalysis: PBPGameAnalysis = {
          variant,
          homeTeamId,
          awayTeamId,
          innings,
          winner,
        }

        // analyze pitching
        const pitchingProblems = analyzePitching(gameAnalysis, appData)
        if (pitchingProblems.length > 0) {
          problems.push(...pitchingProblems)
        }

        gamePlays = appData.gamePlays.all

        // analyze earned runs
        const runProblems = analyzeEarnedRuns(gamePlays)
        if (runProblems.length > 0) {
          problems.push(...runProblems)
        }

        // analyze batting / fielding // TODO refactor to separate check
        if (gamePlays) {
          // cycle through plays
          const innings = Object.keys(gamePlays).map(p => parseInt(p))
          innings.forEach((key) => {
            // top of inning
            gamePlays[key].top?.forEach((_play) => {
              // console.log(play.narrative)
              // TODO check hits + forced outs (singles/doubles/triples)
            })
            // bottom of inning
            gamePlays[key].bot?.forEach((_play) => {
              // console.log(play.narrative)
              // TODO check hits + forced outs (singles/doubles/triples)
            })
          })
        } else {
          problems.push('Data object `gamePlays` not found')
        }
      } else {
        problems.push('Data object for game not found')
      }
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        problems.push(err.message)
      }
    }

    games.push({
      link: gameLink,
      game: gameTitle,
      scorer: gameScorer,
      result: problems.length === 0 ? 'OK' : 'ERR',
      problems,
    })
  }

  // return JSON data
  return {
    date: new Date(),
    result: 'OK',
    games,
  }
})
