import { parse } from 'node-html-parser'
import { launch } from 'puppeteer'
import type { PBPCheck } from '../utils/types'

type GamePlay = {
  narrative: string
}
type GamePlays = {
  [key: string]: { top: GamePlay[], bot: GamePlay[] }
}

export default defineEventHandler(async (): Promise<PBPCheck> => {
  const browser = await launch()

  const problems: string[] = []

  let pbpHTMLData = ''
  let appData
  let boxScore
  let pitchers
  let gamePlays: GamePlays
  try {
    // the page is client-generated => it requires headless browser to render it

    // use Puppeteer to navigate to page
    const page = await browser.newPage()
    await page.goto('https://stats.baseball.cz/cs/events/2023-extraliga/schedule-and-results/box-score/116387')

    pbpHTMLData = await page.content()
    const pbpPage1 = parse(pbpHTMLData)
    const app = pbpPage1.querySelector('#app')
    const appDataString = app?.attrs['data-page']
    if (appDataString) {
      appData = JSON.parse(appDataString).props.viewData.original
    }

    if (appData) {
      boxScore = appData.boxScore
      if (boxScore) {
        pitchers = boxScore.pitchers
        if (pitchers) {
          if (pitchers.win) {
            // TODO check if valid W
          } else {
            problems.push('Winning pitcher not set')
          }
          if (pitchers.loss) {
            // TODO check if valid L
          } else {
            problems.push('Losing pitcher not set')
          }
          if (pitchers.save) {
            // TODO check if valid S
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
          gamePlays[key].top?.forEach((play) => {
            console.log(play.narrative)
            // TODO check hits + forced outs (singles/doubles/triples)
          })
          // bottom of inning
          gamePlays[key].bot?.forEach((play) => {
            console.log(play.narrative)
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
      game: '2023-03-31 - #2 - ARR vs. HLU', // TODO get from game data...
      result: problems.length === 0 ? 'OK' : 'ERR',
      problems
    }
  }
})
