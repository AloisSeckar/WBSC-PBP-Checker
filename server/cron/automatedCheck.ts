import { useDateFormat } from '@vueuse/core'
import { defineCronHandler } from '#nuxt/cron'

export default defineCronHandler(() => useRuntimeConfig().public.automatedCheck, async () => {
  if (useRuntimeConfig().public.adminVersion) {
    console.log('[WBSC PBP Checker] starting automated check @ ' + useDateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss').value)

    await autoCheckGames('baseball')
    await autoCheckGames('softball')

    console.log('[WBSC PBP Checker] starting automated check @ ' + useDateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss').value)
  } else {
    console.log('[WBSC PBP Checker] not running in admin mode => check skipped @ ' + useDateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss').value)
  }
})

async function autoCheckGames(variant: PBPVariant) {
  let gamesChecked = 0
  const gamesWithErrors = [] as PBPGameCheck[]

  console.log('[WBSC PBP Checker] getting links for ' + variant)
  const links = await $fetch<string[]>('/api/links', {
    method: 'GET',
    params: {
      variant,
      year: '2024',
    },
  })

  if (links) {
    console.log('[WBSC PBP Checker] processing links for ' + variant)
    const check = await $fetch<PBPCheck>('/api/check', {
      method: 'POST',
      body: {
        gameLinks: links,
      },
    })
    check.games.forEach((g) => {
      gamesChecked++
      if (g.result !== 'OK') {
        gamesWithErrors.push(g)
      }
    })
  }

  sendEmailSummary(variant, gamesChecked, gamesWithErrors)
}
