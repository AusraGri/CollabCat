import nodemailer, { type Transporter } from 'nodemailer'

export interface EmailData {
  email: string
  inviteToken: string
}

// fake email provider
export const fakeTransporter: Transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'alessandra.denesik@ethereal.email',
    pass: 'xPSz9xRu22amcTJrnd',
  },
})

// google email provider. TO DO: set this in more secure way
export const gmailTransporter: Transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'mssg.bcor@gmail.com',
    pass: 'spev wuzl mykm nuzl',
  },
})

export async function sentInvitationMail(
  transporter: Transporter,
  emailData: EmailData
) {
  const inviteLink = `${process.env.BASE_URL}/invite?token=${emailData.inviteToken}`
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
