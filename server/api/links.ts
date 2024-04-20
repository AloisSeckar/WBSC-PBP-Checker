import { launch } from 'puppeteer'

export default defineEventHandler(async (event): Promise<string[]> => {
  const gameLinks: string[] = []

  const browser = await launch()

  const query = getQuery(event)

  const variant = query.variant as string
  const league = query.league as string

  if (variant === 'softball') {
    const targetCompetitions = league ? [getLinkForLeague(league)] : LINKS_SOFTBALL
    for (const competition of targetCompetitions) {
      const leaguePage = await browser.newPage()
      await leaguePage.goto(competition)
      const softballGameLinks = await leaguePage.$$eval('span.hidden-xs > a', el => el.filter(x => x.getAttribute('href')?.includes('do=matchplay')).map(x => x.getAttribute('href')))
      for (const link of softballGameLinks) {
        if (link) {
          const gamePage = await browser.newPage()
          await gamePage.goto('https://softball.cz/' + link)
          gameLinks.push(gamePage.url())
        }
      }
    }
  } else {
    const targetCompetitions = league ? [getLinkForLeague(league)] : LINKS_BASEBALL
    for (const competition of targetCompetitions) {
      const leaguePage = await browser.newPage()
      await leaguePage.goto(competition)
      const baseballGameDetails = await leaguePage.$$eval('td.detail > a', el => el.filter(x => x.getAttribute('href')?.startsWith('/soutez-')).map(x => x.getAttribute('href')))
      for (const detail of baseballGameDetails) {
        if (detail) {
          const baseballGamePage = await browser.newPage()
          await baseballGamePage.goto('https://baseball.cz/' + detail)
          if (await baseballGamePage.$('div.ke-stazeni > a')) {
            const wbscLink = await baseballGamePage.$eval('div.ke-stazeni > a', el => el.getAttribute('href'))
            if (wbscLink) {
              await baseballGamePage.goto(wbscLink)
              gameLinks.push(baseballGamePage.url())
            }
          }
        }
      }
    }
  }

  return gameLinks
})
