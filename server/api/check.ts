import { parse } from 'node-html-parser'
import { launch } from 'puppeteer'
import type { PBPCheck } from '../utils/types'

type GamePlay = {
  narrative: string
}
type GamePlays = {
  [key: string]: { top: GamePlay[], bot: GamePlay[] }
}

type Winner = 'home' | 'away'

export default defineEventHandler(async (): Promise<PBPCheck> => {
  const browser = await launch()

  const problems: string[] = []

  let winner: Winner = 'home'
  let gameTitle = 'UNKNOWN'
  let gameData
  let appData
  let boxScore
  let pitchers
  let gamePlays: GamePlays
  try {
    // the page is client-generated => it requires headless browser to render it

    // use Puppeteer to navigate to page
    const page = await browser.newPage()
    await page.goto('https://stats.baseball.cz/cs/events/2023-extraliga/schedule-and-results/box-score/116387')

    const pbpHTMLData = await page.content()
    const pbpPage1 = parse(pbpHTMLData)
    const app = pbpPage1.querySelector('#app')
    const appDataString = app?.attrs['data-page']
    if (appDataString) {
      appData = JSON.parse(appDataString).props.viewData.original
    }

    if (appData) {
      let homeTeamId = '0'
      let awayTeamId = '0'
      gameData = appData.gameData
      if (gameData) {
        homeTeamId = gameData.homeid
        awayTeamId = gameData.awayid

        // elaborate winning team
        const homePoints = gameData.homeruns
        const awayPoints = gameData.awayruns
        if (homePoints === awayPoints) {
          problems.push(`Game ended with a tie (${homePoints}:${awayPoints})`)
        }
        winner = homePoints > awayPoints ? 'home' : 'away'

        // build game title
        gameTitle = `#${gameData.gamenumber} - ${gameData.homeioc} ${homePoints} vs. ${awayPoints} ${gameData.awayioc} (${gameData.start})`
      } else {
        problems.push('Data object `gameData` not found')
      }
      boxScore = appData.boxScore
      if (boxScore) {
        const homeStats = boxScore[homeTeamId]
        const homePitchers = homeStats?.['90']
        if (!homePitchers) {
          problems.push('Data object for `homePitchers` not found')
        }
        const awayStats = boxScore[awayTeamId]
        const awayPitchers = awayStats?.['90']
        if (!awayPitchers) {
          problems.push('Data object for `awayPitchers` not found')
        }

        pitchers = boxScore.pitchers
        if (pitchers) {
          if (pitchers.win) {
            // TODO check if valid W
            const winPitcher = findPitcher(pitchers.win.id, winner === 'home' ? homePitchers : awayPitchers)
            console.log(winPitcher?.firstname + ' ' + winPitcher?.lastname)
          } else {
            problems.push('Winning pitcher not set')
          }
          if (pitchers.loss) {
            // TODO check if valid L
            const lossPitcher = findPitcher(pitchers.loss.id, winner === 'home' ? awayPitchers : homePitchers)
            console.log(lossPitcher?.firstname + ' ' + lossPitcher?.lastname)
          } else {
            problems.push('Losing pitcher not set')
          }
          if (pitchers.save) {
            // TODO check if valid S
            const savePitcher = findPitcher(pitchers.save.id, winner === 'home' ? homePitchers : awayPitchers)
            console.log(savePitcher?.firstname + ' ' + savePitcher?.lastname)
          } else {
            // TODO check if SAVE necessary
          }
        } else {
          problems.push('Data object `pitchers` not found')
        }
      } else {
        problems.push('Data object `boxScore` not found')
      }

      gamePlays = appData.gamePlays.all
      if (gamePlays) {
        // cycle through plays
        const innings = Object.keys(gamePlays).sort((a, b) => parseInt(a) - parseInt(b))
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

  browser.close()

  // return JSON data
  return {
    date: new Date(),
    result: 'OK',
    games: {
      game: gameTitle,
      result: problems.length === 0 ? 'OK' : 'ERR',
      problems
    }
  }
})
