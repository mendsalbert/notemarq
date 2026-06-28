import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalPageShell, LegalSection } from '@/components/legal/legal-page-shell';

export const metadata: Metadata = {
  title: 'Privacy Policy — Notemarq',
  description: 'How Notemarq collects, uses, and protects your data.',
};

const LAST_UPDATED = 'June 28, 2026';
const CONTACT_EMAIL = 'support@notemarq.app';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <LegalSection title="Introduction">
        <p>
          Notemarq (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Notemarq mobile app, browser
          extension, and website at{' '}
          <Link href="https://www.notemarq.app" className="font-medium text-[#1c1c2e] underline underline-offset-2">
            notemarq.app
          </Link>{' '}
          (collectively, the &quot;Service&quot;). This Privacy Policy explains what information we collect, how we
          use it, and the choices you have.
        </p>
        <p>
          By using the Service, you agree to the collection and use of information in accordance with this policy. If
          you do not agree, please do not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>
          <strong className="text-[#1c1c2e]">Account information.</strong> When you sign in with Google or Apple, we
          receive basic profile information such as your name, email address, and profile photo, as provided by your
          identity provider.
        </p>
        <p>
          <strong className="text-[#1c1c2e]">Content you save.</strong> We store the links, bookmarks, notes, folders,
          tags, reminders, and any context or notes you add when saving content. If you choose to make a folder public,
          that content may be visible to others who have the link.
        </p>
        <p>
          <strong className="text-[#1c1c2e]">Usage and preferences.</strong> We store settings you configure in the
          app, such as theme preferences, weekly goals, notification preferences, and onboarding choices.
        </p>
        <p>
          <strong className="text-[#1c1c2e]">Device and technical data.</strong> We may collect device type,
          operating system, app version, and similar technical information needed to operate, secure, and improve the
          Service.
        </p>
      </LegalSection>

      <LegalSection title="How we use your information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide, maintain, and sync your saved library across devices</li>
          <li>Authenticate you and manage your account</li>
          <li>Generate AI summaries, tags, folder suggestions, search results, and related features</li>
          <li>Send reminders and notifications you opt into</li>
          <li>Improve reliability, performance, and user experience</li>
          <li>Respond to support requests and enforce our Terms of Service</li>
        </ul>
      </LegalSection>

      <LegalSection title="AI and automated processing">
        <p>
          Notemarq uses third-party AI services to enrich saved links, suggest organization, power semantic search, and
          generate insights. When you save content, relevant text such as URLs, titles, descriptions, and your notes may
          be sent to AI providers for processing. We do not use your content to train public AI models on your behalf.
        </p>
      </LegalSection>

      <LegalSection title="Third-party services">
        <p>We rely on trusted service providers to operate Notemarq, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-[#1c1c2e]">Supabase</strong> — authentication, database, and backend infrastructure
          </li>
          <li>
            <strong className="text-[#1c1c2e]">Google</strong> — sign-in (Google OAuth)
          </li>
          <li>
            <strong className="text-[#1c1c2e]">Apple</strong> — sign-in on iOS (Sign in with Apple)
          </li>
          <li>
            <strong className="text-[#1c1c2e]">Anthropic</strong> — AI enrichment and content understanding
          </li>
          <li>
            <strong className="text-[#1c1c2e]">OpenAI</strong> — text embeddings for semantic search
          </li>
        </ul>
        <p>
          These providers process data on our behalf under their own privacy policies and security practices. We
          recommend reviewing their policies for more detail.
        </p>
      </LegalSection>

      <LegalSection title="Google user data">
        <p>
          If you sign in with Google, Notemarq&apos;s use of information received from Google APIs adheres to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#1c1c2e] underline underline-offset-2"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
        <p>
          We use Google account information only to authenticate you, create and manage your Notemarq account, and
          provide the Service. We do not sell Google user data or use it for advertising.
        </p>
      </LegalSection>

      <LegalSection title="Data retention">
        <p>
          We retain your account data for as long as your account is active or as needed to provide the Service. You
          may delete saved content from within the app. If you delete your account or request deletion, we will remove
          or anonymize your personal data within a reasonable period, except where retention is required by law.
        </p>
      </LegalSection>

      <LegalSection title="Your choices and rights">
        <p>You can:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Access and update profile information in Settings</li>
          <li>Delete individual bookmarks, notes, and folders</li>
          <li>Clear your library or delete your account from Settings</li>
          <li>Disable notifications in your device or app settings</li>
          <li>Contact us to request access, correction, or deletion of your data</li>
        </ul>
        <p>
          Depending on where you live, you may have additional rights under applicable privacy laws. Contact us to
          exercise those rights.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We use industry-standard measures to protect your data, including encrypted connections and access controls.
          No method of transmission or storage is completely secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          The Service is not directed to children under 13 (or the minimum age required in your jurisdiction). We do
          not knowingly collect personal information from children. If you believe a child has provided us data,
          contact us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the revised policy on this page and update
          the &quot;Last updated&quot; date. Continued use of the Service after changes become effective constitutes
          acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="Contact us">
        <p>
          If you have questions about this Privacy Policy or your data, contact us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-[#1c1c2e] underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
