import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalPageShell, LegalSection } from '@/components/legal/legal-page-shell';

export const metadata: Metadata = {
  title: 'Terms of Service — Notemarq',
  description: 'Terms and conditions for using Notemarq.',
};

const LAST_UPDATED = 'June 28, 2026';
const CONTACT_EMAIL = 'support@notemarq.app';

export default function TermsOfServicePage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <LegalSection title="Agreement">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Notemarq mobile app, browser
          extension, and website at{' '}
          <Link href="https://www.notemarq.app" className="font-medium text-[#1c1c2e] underline underline-offset-2">
            notemarq.app
          </Link>{' '}
          (collectively, the &quot;Service&quot;), operated by Notemarq (&quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;).
        </p>
        <p>
          By creating an account or using the Service, you agree to these Terms and our{' '}
          <Link href="/policy" className="font-medium text-[#1c1c2e] underline underline-offset-2">
            Privacy Policy
          </Link>
          . If you do not agree, do not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="Eligibility">
        <p>
          You must be at least 13 years old (or the minimum age required in your jurisdiction) to use the Service. By
          using Notemarq, you represent that you meet this requirement and have the legal capacity to enter into these
          Terms.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          You may sign in using Google, Apple, or other supported authentication methods. You are responsible for
          maintaining the security of your account and for all activity that occurs under it.
        </p>
        <p>
          You agree to provide accurate information and to notify us promptly if you suspect unauthorized access to
          your account.
        </p>
      </LegalSection>

      <LegalSection title="The Service">
        <p>
          Notemarq helps you save, organize, and recall links and notes from across the web. Features may include AI
          summaries, tagging, search, reminders, public sharing, and sync across devices.
        </p>
        <p>
          We may add, change, or remove features at any time. We do not guarantee uninterrupted or error-free
          operation.
        </p>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          You retain ownership of the content you save in Notemarq (&quot;Your Content&quot;). By using the Service,
          you grant us a limited license to host, store, process, display, and sync Your Content solely to operate and
          improve the Service, including AI-powered features described in our Privacy Policy.
        </p>
        <p>
          You are responsible for Your Content and must have the rights needed to save and use it. Do not upload or
          save content that violates law, infringes others&apos; rights, or contains malware or harmful material.
        </p>
        <p>
          If you choose to share a folder publicly, you understand that anyone with the link may view that content.
          You are responsible for what you choose to make public.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the Service for unlawful, abusive, or fraudulent purposes</li>
          <li>Attempt to access other users&apos; accounts or data without authorization</li>
          <li>Reverse engineer, scrape, or overload the Service in ways that harm availability</li>
          <li>Circumvent security, rate limits, or access controls</li>
          <li>Use the Service to distribute spam or malicious content</li>
        </ul>
        <p>
          We may suspend or terminate access if we reasonably believe you have violated these Terms or pose a risk to
          the Service or other users.
        </p>
      </LegalSection>

      <LegalSection title="Third-party services and links">
        <p>
          Notemarq integrates with third-party platforms and services such as Google, Apple, Supabase, and AI providers.
          Saved links may point to third-party websites we do not control. We are not responsible for third-party
          content, policies, or practices.
        </p>
      </LegalSection>

      <LegalSection title="Subscriptions and payments">
        <p>
          Some features may be offered under free or paid plans. If paid plans are available, pricing, billing terms,
          and cancellation rules will be shown at the point of purchase and may be governed by the applicable app store
          terms (Apple App Store, etc.).
        </p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          Notemarq and its branding, design, software, and documentation are owned by us or our licensors and are
          protected by intellectual property laws. These Terms do not grant you any rights to our trademarks or
          proprietary materials except as needed to use the Service.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer of warranties">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
          WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR FREE OF
          ERRORS.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOTEMARQ AND ITS OPERATORS WILL NOT BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR GOODWILL, ARISING
          FROM YOUR USE OF THE SERVICE.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU
          PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS ($100).
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          You may stop using the Service at any time and may delete your account from Settings. We may suspend or
          terminate your access if you violate these Terms or if we discontinue the Service.
        </p>
        <p>
          Sections that by their nature should survive termination — including content licenses granted to operate the
          Service until deletion, disclaimers, and limitations of liability — will survive.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these Terms">
        <p>
          We may update these Terms from time to time. We will post the revised Terms on this page and update the
          &quot;Last updated&quot; date. Material changes may also be communicated in the app or by email where
          appropriate. Continued use after changes become effective constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These Terms are governed by the laws applicable in our place of operation, without regard to conflict of law
          principles. Any disputes will be resolved in the courts of that jurisdiction, unless otherwise required by
          applicable consumer protection law.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these Terms? Contact us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-[#1c1c2e] underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
