import { useDateFormat } from '@vueuse/core'
import nodemailer from 'nodemailer'

export async function sendEmailSummary(variant: PBPVariant, gamesChecked: number, gamesWithErrors: PBPGameCheck[]) {
  console.log('[WBSC PBP Checker] processing summary mail ' + variant)

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    tls: {
      ciphers: 'SSLv3',
    },
    port: 587,
    secure: false,
    auth: {
      user: 'czechscorekeepers@gmail.com',
      pass: useRuntimeConfig().emailPassword,
    },
  })

  let html = `
    WBSC PBP Checker results
    <br /><br />
    <strong>Variant:</strong> ${variant}
    <strong>Execution date:</strong> ${useDateFormat(new Date(), 'YYYY-MM-DD').value}<br />
    <strong>Games checked:</strong> ${gamesChecked}
    <br /><br />
    <strong>Failed checks:</strong><br />
    `

  if (gamesWithErrors.length) {
    gamesWithErrors.forEach((g) => {
      html += `<br /><a href="${g.link}">${g.game}</a> (${g.scorer})<br />`
      html += '<ul>'
      g.problems.forEach((p) => {
        html += `<li>${p}</li>`
      })
      html += '</ul>'
    })
  } else {
    html += '<br /><strong>N/A</strong>'
  }

  console.log(html)

  const association = variant === 'baseball' ? 'ČBA' : 'ČSA'
  const recipients = variant === 'baseball' ? 'ellrohir@seznam.cz' : 'ellrohir@seznam.cz'

  const options = {
    from: 'czechscorekeepers@gmail.com',
    to: recipients,
    subject: `WBSC PBP Checker - weekly check summary for ${association}`,
    html,
  }

  console.log('[WBSC PBP Checker] sending summary mail ' + variant)
  const result = await transporter.sendMail(options)
  console.log(result)
}
