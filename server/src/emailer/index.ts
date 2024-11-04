import nodemailer from 'nodemailer'

export interface EmailData {
    email: string
    inviteToken: string
}

export const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'bertram.goodwin43@ethereal.email',
        pass: '23SXhZQrexbGeHYbs1'
    }
})

export async function sentInvitationMail(emailData: EmailData) {
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
        console.log("Message sent: %s", email.messageId)

        return email.messageId

    } catch (error) {
        throw new Error('Failed to send the invitation message')
    }
  }
