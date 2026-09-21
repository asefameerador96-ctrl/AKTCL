// DRAFT — must be reviewed by AKTCL legal before launch.
//
// This page describes what THIS site actually does, so it has to move with the code:
//   - fields collected        src/components/EnquiryForm.tsx, src/lib/enquiry.ts
//   - processing and storage  api/src (Azure Functions: table row + email, per-IP rate limit)
//   - browser storage         src/components/AgeGate.tsx, src/hooks/useTheme.ts
// Change the wording here in the same commit as any change there.
// Deliberately absent until AKTCL legal supplies them: a named data controller
// address, a Data Protection Officer, and any statutory references.
import { Link } from 'react-router-dom';
import LegalPage from '@/components/LegalPage';
import { site } from '@/content/site';

const DOMAIN = new URL(site.url).hostname.replace(/^www\./, '');

const Privacy = () => (
  <LegalPage path="/privacy" title="Privacy Notice" lastUpdated="September 2026">
    <p>
      {DOMAIN} is the business-to-business website of {site.name} ({site.shortName}). This
      notice explains what information the site collects, why, and what it does not collect.
    </p>

    <h2>Information you give us</h2>
    <p>
      The only personal information this site asks for is what you enter in the trade enquiry
      form:
    </p>
    <ul>
      <li>Name</li>
      <li>Company</li>
      <li>Country</li>
      <li>Email address</li>
      <li>Phone or WhatsApp number (optional)</li>
      <li>Product of interest</li>
      <li>Estimated volume (optional)</li>
      <li>Your message</li>
    </ul>
    <p>
      With these, the form records your confirmation that you are a trade professional of legal
      age, the date and time the enquiry was sent, and the page of this site it was sent from.
      Please do not include sensitive personal information in your message.
    </p>

    <h2>Why we collect it</h2>
    <p>We use this information for one purpose: responding to your trade enquiry.</p>

    <h2>How it is processed</h2>
    <p>
      The enquiry form is processed on Microsoft Azure. Your enquiry is stored there and delivered
      by email to {site.shortName}&apos;s export team.
    </p>
    <p>
      To protect the form from automated abuse, the server counts how many enquiries arrive from
      the same internet (IP) address within a short period. The address is held in memory for a
      few minutes for that check and is not saved with your enquiry.
    </p>

    <h2>Cookies and browser storage</h2>
    <p>
      This site does not use advertising cookies or third-party trackers. It uses your
      browser&apos;s local storage for two things only:
    </p>
    <ul>
      <li>
        to remember that you have confirmed you are of legal age, so you are not asked again on
        every visit;
      </li>
      <li>to remember whether you prefer the light or the dark display.</li>
    </ul>
    <p>
      Both are kept on your own device. You can remove them at any time by clearing this
      site&apos;s data in your browser.
    </p>

    <h2>Visit statistics</h2>
    <p>
      We may collect privacy-friendly, aggregate visit statistics — for example, which pages are
      viewed and how often enquiry links are used. This is done without cookies and without
      storing IP addresses.
    </p>

    <h2>How long we keep it</h2>
    <p>
      We keep enquiry information only as long as needed to handle the enquiry and meet legal
      obligations.
    </p>

    <h2>Your rights and how to contact us</h2>
    <p>
      To ask what information we hold about you, or to ask us to correct or delete it, contact us
      through the <Link to="/contact">contact page</Link>.
    </p>

    <h2>Changes to this notice</h2>
    <p>
      If this notice changes, the new version will be published on this page with a new
      &ldquo;Last updated&rdquo; date.
    </p>
  </LegalPage>
);

export default Privacy;
