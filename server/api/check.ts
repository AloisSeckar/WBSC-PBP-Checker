import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export default defineEventHandler(async (event): Promise<PBPCheck> => {
  const body = await readBody(event) as PBPGameCheckRequest
  const gameLinks = body?.gameLinks

  const executablePath = await chromium.executablePath()
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  })
  const gamePage = await browser.newPage()

  const games: PBPGameCheck[] = []

  for (const gameLink of gameLinks) {
    const problems: string[] = []

    let gameTitle = 'UNKNOWN'
    let gameScorer = 'UNKNOWN'
    let gameData
    let appData
    let gamePlays: WBSCGamePlays
    try {
      await gamePage.goto(gameLink)
      await gamePage.waitForSelector('#app')
      const rawData = await gamePage.$eval('#app', el => el.getAttribute('data-page'))
      appData = JSON.parse(rawData).props.viewData.original as WBSCAppData

      if (appData) {
        // analyze input data
        const inputProblems = analyzeInput(appData)
        if (inputProblems.length > 0) {
          problems.push(...inputProblems)
        }
      }

      if (appData && problems.length == 0) {
        let innings = 0
        let homeTeamId = 0
        let awayTeamId = 0

        let variant: PBPVariant = 'baseball'
        let winner: PBPWinner = 'home'

        variant = appData.tournamentInfo.innings === 9 ? 'baseball' : 'softball'

        gameData = appData.gameData
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
        const scorers: string[] = []
        gameData.assignments.forEach((a) => {
          if (a.type === 1) { // 0 = Umpires, 1 = scorers, 2 = TCs
            scorers.push(a.person?.label || 'UNKNOWN')
          }
        })
        gameScorer = scorers.join(', ')
        console.log(gameScorer)

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
        // TODO for now not working as intended - fix or remove
        // const runProblems = analyzeEarnedRuns(gamePlays)
        // if (runProblems.length > 0) {
        //   problems.push(...runProblems)
        // }

        // analyze batting / fielding // TODO refactor to separate check

        // cycle through plays
        const inn = Object.keys(gamePlays).map(p => parseInt(p))
        inn.forEach((key) => {
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
