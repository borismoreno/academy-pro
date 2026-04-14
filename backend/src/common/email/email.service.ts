import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Role } from '@prisma/client';

const ROLE_LABELS: Record<string, string> = {
  coach: 'Entrenador',
  parent: 'Padre/Madre de familia',
};

@Injectable()
export class EmailService {
  private readonly ses: SESClient;
  private readonly fromEmail: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    const region = config.getOrThrow<string>('app.awsRegion');
    const accessKeyId = config.getOrThrow<string>('app.awsAccessKeyId');
    const secretAccessKey = config.getOrThrow<string>('app.awsSecretAccessKey');

    this.fromEmail = config.getOrThrow<string>('app.awsSesFromEmail');

    this.ses = new SESClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async sendInvitationEmail(
    to: string,
    academyName: string,
    role: Role,
    acceptUrl: string,
  ): Promise<void> {
    const roleLabel = ROLE_LABELS[role] ?? role;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitación a ${academyName}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #1a56db; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Cancha360</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #111827; margin: 0 0 16px 0;">Has sido invitado a ${academyName}</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 8px 0;">
                Fuiste invitado a unirte a la academia <strong>${academyName}</strong> como <strong>${roleLabel}</strong>.
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
                Haz clic en el botón de abajo para aceptar la invitación. Este enlace expira en <strong>48 horas</strong>.
              </p>
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${acceptUrl}" style="background-color: #1a56db; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                  Aceptar invitación
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
              </p>
              <p style="color: #1a56db; font-size: 14px; word-break: break-all; margin: 8px 0 0 0;">
                ${acceptUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Si no esperabas esta invitación, puedes ignorar este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: {
          Data: `Invitación a ${academyName} — Cancha360`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
          Text: {
            Data: `Has sido invitado a ${academyName} como ${roleLabel}. Acepta la invitación aquí: ${acceptUrl}`,
            Charset: 'UTF-8',
          },
        },
      },
    });

    try {
      await this.ses.send(command);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${to}`, error);
      throw error;
    }
  }

  async sendVerificationEmail(
    to: string,
    verificationUrl: string,
  ): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifica tu correo — Cancha360</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #1a56db; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Cancha360</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #111827; margin: 0 0 16px 0;">Activa tu cuenta</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 8px 0;">
                Gracias por registrarte en Cancha360. Para completar tu registro y acceder a tu cuenta, confirma tu dirección de correo electrónico.
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
                Haz clic en el botón de abajo para verificar tu correo. Este enlace expira en <strong>24 horas</strong>.
              </p>
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${verificationUrl}" style="background-color: #1a56db; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                  Verificar correo
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
              </p>
              <p style="color: #1a56db; font-size: 14px; word-break: break-all; margin: 8px 0 0 0;">
                ${verificationUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Si no creaste una cuenta en Cancha360, puedes ignorar este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: {
          Data: 'Verifica tu correo — Cancha360',
          Charset: 'UTF-8',
        },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
          Text: {
            Data: `Activa tu cuenta de Cancha360 verificando tu correo. El enlace expira en 24 horas: ${verificationUrl}`,
            Charset: 'UTF-8',
          },
        },
      },
    });

    try {
      await this.ses.send(command);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Restablece tu contraseña — Cancha360</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #1a56db; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Cancha360</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #111827; margin: 0 0 16px 0;">Restablece tu contraseña</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 8px 0;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta de Cancha360.
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
                Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace expira en <strong>1 hora</strong>.
              </p>
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${resetUrl}" style="background-color: #1a56db; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                  Restablecer contraseña
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
              </p>
              <p style="color: #1a56db; font-size: 14px; word-break: break-all; margin: 8px 0 0 0;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: {
          Data: 'Restablece tu contraseña — Cancha360',
          Charset: 'UTF-8',
        },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
          Text: {
            Data: `Recibimos una solicitud para restablecer tu contraseña. Haz clic aquí para crear una nueva (expira en 1 hora): ${resetUrl}`,
            Charset: 'UTF-8',
          },
        },
      },
    });

    try {
      await this.ses.send(command);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      throw error;
    }
  }
}
