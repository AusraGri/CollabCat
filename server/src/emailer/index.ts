import nodemailer, { type Transporter } from 'nodemailer'
import config from '@server/config'

export interface EmailData {
  email: string
  inviteToken: string
}

export function getMailTransporter(): Transporter {
  return nodemailer.createTransport(config.emailService)
}

/**
 * Sends an email invitation to a user with a link to join a group.
 *
 * This function:
 * - Creates an invitation URL using the provided token
 * - Sends the email via the given transporter (e.g., using Nodemailer)
 * - Includes a personalized message with a link to the invite page
 *
 * @param {Transporter} transporter - The email transporter used to send the email (e.g., Nodemailer transporter).
 * @param {EmailData} emailData - The data for the invitation email, including the recipient's email and invite token.
 * @returns {Promise<any>} - A Promise that resolves when the email is sent successfully.
 * @throws {Error} - Throws an error if the invitation email fails to send.
 */
export async function sentInvitationMail(
  transporter: Transporter,
  emailData: EmailData
): Promise<any> {
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
