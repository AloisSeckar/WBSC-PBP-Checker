import { parse } from 'node-html-parser'
import { launch } from 'puppeteer'

export default defineEventHandler(async (event): Promise<PBPCheck> => {
  const body = await readBody(event) as PBPGameCheckRequest
  const gameLinks = body?.gameLinks

  const games: PBPGameCheck[] = []

  const browser = await launch()
  for (const gameLink of gameLinks) {
    const problems: string[] = []

    let variant: PBPVariant = 'baseball'
    let winner: PBPWinner = 'home'
    let gameTitle = 'UNKNOWN'
    let gameData
    let appData
    let boxScore
    let pitchers
    let gamePlays: WBSCGamePlays
    try {
      // the page is client-generated => it requires headless browser to render it

      // use Puppeteer to navigate to page

      const page = await browser.newPage()
      await page.goto(gameLink)

      const pbpHTMLData = await page.content()
      const pbpPage1 = parse(pbpHTMLData)
      const app = pbpPage1.querySelector('#app')
      const appDataString = app?.attrs['data-page']
      if (appDataString) {
        appData = JSON.parse(appDataString).props.viewData.original as WBSCAppData
      }

      if (appData) {
        let innings = 0
        let homeTeamId = 0
        let awayTeamId = 0

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
        } else {
          problems.push('Data object `gameData` not found')
        }

        const homePitchers: WBSCPlayerStats[] = []
        const awayPitchers: WBSCPlayerStats[] = []
        boxScore = appData.boxScore
        if (boxScore) {
          const homeStats = boxScore[homeTeamId] as WBSCStats
          homePitchers.push(...homeStats['90'])
          if (!homePitchers) {
            problems.push('Data object for `homePitchers` not found')
          }
          const awayStats = boxScore[awayTeamId] as WBSCStats
          awayPitchers.push(...awayStats['90'])
          if (!awayPitchers) {
            problems.push('Data object for `awayPitchers` not found')
          }
          const pitcherRecords = [...homePitchers, ...awayPitchers]

          pitchers = boxScore.pitchers
          if (pitchers) {
            if (pitchers.win) {
              const winPitcher = findPitcher(pitchers.win.id, pitcherRecords)!
              // must be correct team
              if (!checkCorrectTeam(winPitcher, winner === 'home' ? homeTeamId : awayTeamId)) {
                problems.push('Winning pitcher is from losing team')
              }
              // must have at least 0.1 IP
              if (winPitcher.pitch_ip === '0.0') {
                problems.push('Winning pitcher doesn\'t have any IP')
              }
              // starter must have enough innings
              if (winPitcher.sub === 0) {
                if (!checkEnoughInnings(winPitcher, innings, variant)) {
                  problems.push('Starting pitcher doesn\'t have enough IP to get the win')
                }
              }
              console.log(winPitcher?.firstname + ' ' + winPitcher?.lastname)
            } else {
              problems.push('Winning pitcher not set')
            }
            if (pitchers.loss) {
              const lossPitcher = findPitcher(pitchers.loss.id, pitcherRecords)!
              // must be correct team
              if (!checkCorrectTeam(lossPitcher, winner === 'home' ? awayTeamId : homeTeamId)) {
                problems.push('Winning pitcher is from losing team')
              }
              // must have at least 0.1 IP
              if (lossPitcher.pitch_ip === '0.0') {
                problems.push('Losing pitcher doesn\'t have any IP')
              }
              console.log(lossPitcher?.firstname + ' ' + lossPitcher?.lastname)
            } else {
              problems.push('Losing pitcher not set')
            }
            if (pitchers.save) {
              // TODO check if valid S
              const savePitcher = findPitcher(pitchers.save.id, pitcherRecords)!
              // must be correct team
              if (!checkCorrectTeam(savePitcher, winner === 'home' ? homeTeamId : awayTeamId)) {
                problems.push('Winning pitcher is from losing team')
              }
              // must have at least 0.1 IP
              if (savePitcher.pitch_ip === '0.0') {
                problems.push('Save pitcher doesn\'t have any IP')
              }
              // TODO rules must be fullfiled
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
          const pitchingProblems = analyzePitching(gamePlays, pitchers!, homePitchers, awayPitchers)
          if (pitchingProblems.length > 0) {
            problems.push(...pitchingProblems)
          }

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
      game: gameTitle,
      result: problems.length === 0 ? 'OK' : 'ERR',
      problems,
    })
  }
  browser.close()

  // return JSON data
  return {
    date: new Date(),
    result: 'OK',
    games,
  }
})
