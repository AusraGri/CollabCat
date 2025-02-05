import type { Transporter, SentMessageInfo } from 'nodemailer'
import { sentInvitationMail } from '..'

vi.mock('@server/config', () => ({
  default: { auth0: { clientOriginUrl: 'https://myapp.com' } },
}))

type MockTransporter = Pick<Transporter, 'sendMail'>

const mockTransporter: MockTransporter = {
  sendMail: vi.fn(async () => ({ messageId: '12345' }) as SentMessageInfo),
}

describe('sentInvitationMail', () => {
  it('should send an email with the correct parameters', async () => {
    const emailData = {
      email: 'test@example.com',
      inviteToken: 'test-token',
    }

    const email = await sentInvitationMail(
      mockTransporter as unknown as Transporter,
      emailData
    )

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: '"CollabCat App" <invitations@myapp.email>',
      to: emailData.email,
      subject: expect.any(String),
      html: expect.any(String),
    })

    expect(email).toEqual({ messageId: '12345' })
  })

  it('should throw an error if email sending fails', async () => {
    mockTransporter.sendMail = vi.fn(async () => {
      throw new Error('SMTP Error')
    })

    const emailData = {
      email: 'test@example.com',
      inviteToken: 'test-token',
    }

    await expect(
      sentInvitationMail(mockTransporter as unknown as Transporter, emailData)
    ).rejects.toThrow('Failed to send the invitation message')
  })
})
