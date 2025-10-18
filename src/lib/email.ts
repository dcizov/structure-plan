import {
  ChangeEmailVerificationTemplate,
  ResetPasswordEmailTemplate,
  VerificationEmailTemplate,
} from "@/emails";
import { render } from "@react-email/render";
import { Resend } from "resend";

import { env } from "@/env";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationEmail = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: "Verify your Email address",
    html: await render(
      VerificationEmailTemplate({ inviteLink: verificationUrl }),
    ),
  });
};

export const sendResetPasswordEmail = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: "Reset Password Link",
    react: ResetPasswordEmailTemplate({ inviteLink: verificationUrl }),
  });
};

export const sendChangeEmailVerification = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: "Verify Your New Email Address",
    react: ChangeEmailVerificationTemplate({ inviteLink: verificationUrl }),
  });
};
