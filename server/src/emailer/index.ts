import nodemailer, { type Transporter } from 'nodemailer'
import config from '@server/config'

export interface EmailData {
  email: string
  inviteToken: string
}

export const mailTransporter: Transporter = nodemailer.createTransport(config.emailService)

export async function sentInvitationMail(
  transporter: Transporter,
  emailData: EmailData
) {
  const inviteLink = `${config.auth0.clientOriginUrl}/invite?token=${emailData.inviteToken}`
  const info = {
    from: '"Family App" <invitations@myapp.email>',
    to: emailData.email,
    subject: "You've been invited to join a group! ✔",
    text: `Hello! \n Click the link to join the group: ${inviteLink}`,
  }

  try {
    const email = await transporter.sendMail(info)

    // eslint-disable-next-line no-console
    console.log('Message sent: %s', email.messageId)

    return email
  } catch (error) {
    throw new Error('Failed to send the invitation message')
  }
}
