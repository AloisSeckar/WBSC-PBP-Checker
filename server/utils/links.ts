// links to competition schedules on www.softball.cz website
export const LINK_S_ELM = 'https://softball.cz/modules.php?op=modload&name=liga&file=index&do=schedule&akce=1222&pda=2&admina=&hraciden=0000-00-00&vyloucene=1'
export const LINK_S_ELZ = 'https://softball.cz/modules.php?op=modload&name=liga&file=index&do=schedule&akce=1221&pda=2&admina=&hraciden=0000-00-00&vyloucene=1'
export const LINK_S_ELJI = 'https://softball.cz/modules.php?op=modload&name=liga&file=index&do=schedule&akce=1231&pda=2&admina=&hraciden=0000-00-00&vyloucene=1'
export const LINK_S_ELJY = 'https://softball.cz/modules.php?op=modload&name=liga&file=index&do=schedule&akce=1227&pda=2&admina=&hraciden=0000-00-00&vyloucene=1'

export const LINKS_SOFTBALL = [LINK_S_ELM, LINK_S_ELZ, LINK_S_ELJI, LINK_S_ELJY]

// links to competition schedules on www.baseball.cz website
export const LINK_B_EXL = 'https://www.baseball.cz/soutez-753/extraliga/zakladni-cast/rozpis'
export const LINK_B_LIG = 'https://www.baseball.cz/soutez-754/1-liga/zakladni-cast/rozpis'
export const LINK_B_U23 = 'https://www.baseball.cz/soutez-755/prospect-league-u23/zakladni-cast/rozpis'
export const LINK_B_U18 = 'https://www.baseball.cz/soutez-756/extraliga-u18/zakladni-cast/rozpis'

export const LINKS_BASEBALL = [LINK_B_EXL, LINK_B_LIG, LINK_B_U23, LINK_B_U18]

// translate league name to link

export function getLinkForLeague (league: string) {
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
    case 'LIG':
      return LINK_B_LIG
    case 'U23':
      return LINK_B_U23
    case 'U18':
      return LINK_B_U18
  }
  return ''
}
