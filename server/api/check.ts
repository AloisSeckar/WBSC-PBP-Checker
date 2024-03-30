import { parse } from 'node-html-parser'
import type { PBPCheck } from '../utils/types'

export default defineEventHandler(async (): Promise<PBPCheck> => {
  // GET content from page
  const jepHTMLData = await $fetch<string>('https://stats.baseball.cz/cs/events/2023-extraliga/schedule-and-results/box-score/116387')

  const jepPage = parse(jepHTMLData)
  console.log(jepPage)

  /*
  // entries are listed in two <table class="jeps"> elements
  const tables = jepPage.querySelectorAll('.jeps')
  // first table containts the actual JEPs
  const jepTable = tables[0]
  // second table lists drafts yet to be promoted to JEP (or left forsaken)
  const draftTable = tables[1]

  // now we seek last <tr> of each table - here will be the latest entry
  const lastJEPRow = jepTable?.querySelectorAll('tr')?.at(-1)
  const lastDraftRow = draftTable?.querySelectorAll('tr')?.at(-1)

  // the target number resides inside (the only one) <td class="jep">
  // element nested inside <tr>'s chlidren
  const lastJEPCell = lastJEPRow?.querySelector('.jep')
  const lastDraftCell = lastDraftRow?.querySelector('.jep')

  // finally the value is a sole TextNode inside <td> we just grabbed
  // and we can access it directly via .text attribute
  const lastJEPNo = lastJEPCell?.text
  const lastDraftNo = lastDraftCell?.text
  */

  // return JSON data
  return {
    date: new Date(),
    result: 'OK',
    games: {
      game: '2023-03-31 - #2 - ARR vs. HLU',
      result: 'OK',
      problems: []
    }
  }
})
