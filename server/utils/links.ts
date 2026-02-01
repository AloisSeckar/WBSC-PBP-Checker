// links to competition schedules on https://czechsoftball.wbsc.org/ website

export const LINK_S_ELM = 'https://czechsoftball.wbsc.org/cs/events/2025-extraliga-mu-2025/schedule-and-results'
export const LINK_S_ELZ = 'https://czechsoftball.wbsc.org/cs/events/2025-extraliga-en-2025/schedule-and-results'
export const LINK_S_ELJI = 'https://czechsoftball.wbsc.org/cs/events/2025-u20-extraliga-junior-2025/schedule-and-results'
export const LINK_S_ELJY = 'https://czechsoftball.wbsc.org/cs/events/2025-u20-extraliga-junior-2025/home'

export const LINKS_SOFTBALL = [LINK_S_ELM, LINK_S_ELZ, LINK_S_ELJI, LINK_S_ELJY]

// links to competition schedules on https://stats.baseball.cz/ website
export const LINK_B_EXL = 'https://stats.baseball.cz/cs/events/2025-extraliga-2025/schedule-and-results'
export const LINK_B_NAD = 'https://stats.baseball.cz/cs/events/2025-nadstavba-o-extraligu-2025/schedule-and-results'
export const LINK_B_LIG = 'https://stats.baseball.cz/cs/events/2025-1-liga-2025/schedule-and-results'
export const LINK_B_U23 = 'https://stats.baseball.cz/cs/events/extraliga-u23-2025/schedule-and-results'
export const LINK_B_U18 = 'https://stats.baseball.cz/cs/events/2025-extraliga-u18-2025/schedule-and-results'

export const LINKS_BASEBALL = [LINK_B_EXL, LINK_B_NAD, LINK_B_LIG, LINK_B_U23, LINK_B_U18]

// TODO other competitions

// translate league name to link

export function getLinkForLeague(league: string) {
  switch (league) {
    case 'ELM':
      return LINK_S_ELM
    case 'ELZ':
      return LINK_S_ELZ
    case 'ELJI':
      return LINK_S_ELJI
    case 'ELJY':
      return LINK_S_ELJY
    case 'EXL':
      return LINK_B_EXL
    case 'NAD':
      return LINK_B_NAD
    case 'LIG':
      return LINK_B_LIG
    case 'U23':
      return LINK_B_U23
    case 'U18':
      return LINK_B_U18
  }
  return ''
}
