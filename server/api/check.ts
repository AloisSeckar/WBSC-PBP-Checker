import { parse } from 'node-html-parser'
import { launch } from 'puppeteer'
import type { PBPCheck } from '../utils/types'

export default defineEventHandler(async (): Promise<PBPCheck> => {
  const browser = await launch()

  let pbpHTMLData = ''
  try {
    // the page is client-generated => it requires headless browser to render it

    // use Puppeteer to navigate to page
    const page = await browser.newPage()
    await page.goto('https://stats.baseball.cz/cs/events/2023-extraliga/schedule-and-results/box-score/116387')
    // move to "PLAYS" tab (default is "BOX")
    const playsLinks = await page.$$("xpath=//a[contains(text(), 'ROZEHRY')]")
    await playsLinks[0].evaluate((link) => {
      if (link instanceof HTMLElement) {
        link.click()
      }
    })
    // scrap the website as plain HTML string
    pbpHTMLData = await page.content()

    // feed the scrapped data to 'node-html-parser' as it handles virtual DOM better
    // TODO refactor this to use Puppeteer only?
    const pbpPage = parse(pbpHTMLData)

    const plays = pbpPage.querySelectorAll('.plays-row')
    plays.forEach((play) => {
      if (play.innerHTML.includes('GAME OVER')) {
        // wrap-up
        pbpHTMLData = play.innerHTML
        // TODO check if W/L/S is filled
        // TODO check if W/L/S is correct
      }
      if (play.innerHTML.includes('singles') || play.innerHTML.includes('doubles') || play.innerHTML.includes('triples')) {
        // hit
        // TODO check if there is no forced out (cannot be hit)
      }
    })
  } catch (err) {
    console.error(err)
  }

  browser.close()

  // return JSON data
  return {
    date: new Date(),
    result: 'OK',
    games: {
      game: '2023-03-31 - #2 - ARR vs. HLU',
      result: 'OK',
      problems: [pbpHTMLData]
    }
  }
})
