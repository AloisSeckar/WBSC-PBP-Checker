import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export default defineEventHandler(async (event): Promise<string[]> => {
  const gameLinks: string[] = []

  const executablePath = import.meta.dev ? useRuntimeConfig().public.chromium as string : await chromium.executablePath()
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  })

  const query = getQuery(event)

  const variant = query.variant as string
  const league = query.league as string

  const month = query.month as string
  const year = query.year as string || '2025'
  const dateFrom = `${year}-${month || '01'}-01`
  const dateTo = `${year}-${month || '12'}-31`

  const targetCompetitions = [] as string[]
  if (league) {
    targetCompetitions.push(getLinkForLeague(league))
  } else {
    if (variant === 'softball') {
      targetCompetitions.push(...LINKS_SOFTBALL)
    } else {
      targetCompetitions.push(...LINKS_BASEBALL)
    }
  }

  for (const competition of targetCompetitions) {
    console.log('Processing competition: ' + competition)
    const leaguePage = await browser.newPage()
    await leaguePage.goto(competition)
    await leaguePage.waitForSelector('#app')

    const rawData = await leaguePage.$eval('#app', el => el.getAttribute('data-page'))
    const leagueData = JSON.parse(rawData).props as WBSCLeagueData
    leagueData.games.forEach((game) => {
      if (game.start_date >= dateFrom && game.start_date <= dateTo) {
        gameLinks.push(`${competition}/box-score/${game.id}`)
      }
    })
  }

  return gameLinks
})
