import { useDateFormat } from '@vueuse/core'
import nodemailer from 'nodemailer'
import { defineCronHandler } from '#nuxt/cron'

// () => '0 6 * * MON'
export default defineCronHandler('everyMinute', async () => {
  console.log('weeklyCheck run ' + useDateFormat(new Date(), 'HH:mm:ss').value)

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

  const options = {
    from: 'czechscorekeepers@gmail.com',
    to: 'ellrohir@seznam.cz',
    subject: 'WBSC PBP Checker - weekly check',
    html: 'This will contain games with failed checks',
  }

  const result = await transporter.sendMail(options)
  console.log(result)
})
