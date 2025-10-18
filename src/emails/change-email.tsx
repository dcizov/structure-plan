import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ChangeEmailVerificationTemplateProps {
  inviteLink: string;
}

export function ChangeEmailVerificationTemplate({
  inviteLink,
}: ChangeEmailVerificationTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your new email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={h1}>Verify your new email</Heading>
            <Text style={text}>
              You requested to change your email address. Please verify this new
              email address to complete the change.
            </Text>
            <Button style={button} href={inviteLink}>
              Verify New Email
            </Button>
            <Hr style={hr} />
            <Text style={paragraph}>
              If the button doesn&apos;t work, copy and paste this link into
              your browser:
            </Text>
            <Link href={inviteLink} style={anchor}>
              {inviteLink}
            </Link>
            <Hr style={hr} />
            <Text style={footer}>
              If you didn&apos;t request this change, please contact support
              immediately to secure your account.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const box = {
  padding: "0 48px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const h1 = {
  color: "#09090b",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "32px 0",
  padding: "0",
};

const text = {
  color: "#52525b",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 24px",
};

const paragraph = {
  color: "#71717a",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
};

const button = {
  backgroundColor: "#18181b",
  borderRadius: "6px",
  color: "#fafafa",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "10px 0",
  marginBottom: "24px",
};

const anchor = {
  color: "#3b82f6",
  fontSize: "12px",
  textDecoration: "none",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  color: "#a1a1aa",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "24px 0",
};
