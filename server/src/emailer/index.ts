import nodemailer, { type Transporter } from 'nodemailer'
import config from '@server/config'

export interface EmailData {
  email: string
  inviteToken: string
}

export function getMailTransporter(): Transporter {
  return nodemailer.createTransport(config.emailService)
}

export async function sentInvitationMail(
  transporter: Transporter,
  emailData: EmailData
) {
  const inviteLink = `${config.auth0.clientOriginUrl}/invite?token=${emailData.inviteToken}`
  const info = {
    from: '"CollabCat App" <invitations@myapp.email>',
    to: emailData.email,
    subject: "You've been invited to join a group! ✔",
    html: `Hello! <br> Your friend has invited you to join his group and start sharing the tasks! <br> Click the link to <a href="${inviteLink}">join the group</a>.`,
  }

  try {
    const email = await transporter.sendMail(info)

    return email
  } catch (error) {
    throw new Error('Failed to send the invitation message')
  }
}
