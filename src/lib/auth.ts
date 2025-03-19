import { db } from "@/db/drizzle";
import { getUserCoursesOnLogin } from "@/db/queries/course";
import { getUserOrganizationsOnLogin } from "@/db/queries/organizations";
import {
  account,
  invitation,
  member,
  organization,
  session,
  user,
  verification,
} from "@/db/schema/auth";
import { serverEnv } from "@/lib/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  organization as organizationPlugin,
  username,
} from "better-auth/plugins";
import { createTransport } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { v4 as uuidv4 } from "uuid";

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3000", "http://host.docker.internal:3000"],
  plugins: [
    admin(),
    username(),
    organizationPlugin({
      async sendInvitationEmail(data) {
        const inviteLink = `https://example.com/accept-invitation/${data.id}`;
        sendEmail({
          to: data.email,
          subject: "You've been invited to join an organisation",
          text: `Click the link to accept the invitation: ${inviteLink}`,
        });
      },
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      account,
      session,
      verification,
      organization,
      member,
      invitation,
    },
  }),
  emailAndPassword: { enabled: true },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },
  advanced: {
    generateId: () => uuidv4(),
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          let activeOrganizationId = null;
          let activeCourseId = null;

          // TODO: Separate org and course handling to avoid mutual failure
          try {
            const orgs = await getUserOrganizationsOnLogin(session);
            const courses = await getUserCoursesOnLogin(session);

            if (orgs.length === 0) {
              throw new Error("User is not a member of any organizations");
            }

            if (courses.length === 0) {
              throw new Error("User is not a member of any courses");
            }

            activeOrganizationId = orgs[0].id;
            activeCourseId = courses[0].id;
          } catch (error) {
            console.error(
              "Failed to set user organization on login: ",
              error,
              "Session: ",
              session,
            );
          }

          return {
            data: {
              ...session,
              // TODO: Set active organization based on preference instead of simply the first one
              activeOrganizationId,
              activeCourseId,
            },
          };
        },
      },
    },
  },
  session: {
    additionalFields: {
      activeCourseId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});

const smtpConfig: SMTPTransport.Options = {
  host: serverEnv.SMTP_HOST,
  port: serverEnv.SMTP_PORT,
  secure: false, // upgrade later with STARTTLS
  tls: { rejectUnauthorized: false },
  auth: {
    user: serverEnv.SMTP_USERNAME,
    pass: serverEnv.SMTP_PASSWORD,
  },
};

async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const transporter = createTransport(smtpConfig);

  const mailOptions = {
    from: "test@example.com",
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
