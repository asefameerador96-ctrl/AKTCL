// DRAFT — must be reviewed by AKTCL legal before launch.
//
// General-terms wording only. Nothing here states a governing law, a jurisdiction,
// a registered address or a company number — see the TODO(AKTCL legal) below.
import { Link } from 'react-router-dom';
import LegalPage from '@/components/LegalPage';
import { site } from '@/content/site';

const DOMAIN = new URL(site.url).hostname.replace(/^www\./, '');

const Terms = () => (
  <LegalPage path="/terms" title="Terms of Use" lastUpdated="September 2026">
    <p>
      These terms apply to your use of {DOMAIN} (the &ldquo;site&rdquo;), the business-to-business
      website of {site.name} ({site.shortName}). By using the site you agree to them.
    </p>

    <h2>Who the site is for</h2>
    <p>
      The site is intended only for tobacco trade professionals — such as importers,
      distributors, manufacturers and brand owners — who are at least {site.legalAge} years old
      and of legal age in their own country. If that does not describe you, please do not use the
      site.
    </p>

    <h2>Information only</h2>
    <p>
      The site provides information about {site.shortName} and its products for trade purposes.
      Nothing on the site is an offer to sell to consumers, and tobacco products are not sold
      through the site.
    </p>

    <h2>Product information</h2>
    <p>
      Product descriptions, photographs and other product information on the site are indicative.
      Specifications are confirmed in writing for each order.
    </p>

    <h2>Trade enquiries</h2>
    <p>
      Trade enquiries are subject to {site.shortName}&apos;s acceptance and to the applicable
      export, import and tobacco-control laws of the countries of origin and destination. The
      buyer is responsible for import compliance in its own market.
    </p>
    <p>
      How the information you send with an enquiry is handled is set out in the{' '}
      <Link to="/privacy">Privacy Notice</Link>.
    </p>

    <h2>Intellectual property</h2>
    <p>
      The text, photographs, graphics, logos and brand names on the site belong to{' '}
      {site.shortName} or its licensors and are protected by intellectual property laws. You may
      view the site and share links to it for legitimate business purposes. Any other copying or
      reuse needs {site.shortName}&apos;s written permission.
    </p>

    <h2>External links</h2>
    <p>
      The site may link to websites operated by others. {site.shortName} does not control those
      websites and is not responsible for their content or practices.
    </p>

    <h2>Limitation of liability</h2>
    <p>
      The site and its content are provided &ldquo;as is&rdquo;, without warranties of any kind.
      To the extent permitted by law, {site.shortName} is not liable for any loss or damage
      arising from the use of the site or from reliance on its content.
    </p>

    <h2>Changes to these terms</h2>
    <p>
      {site.shortName} may update these terms from time to time. The current version is always the
      one on this page, with the date it was last updated. Continuing to use the site means you
      accept the current terms.
    </p>

    {/* TODO(AKTCL legal): governing law and jurisdiction clause. Deliberately not stated
        until AKTCL legal confirms it — do not add a default. */}

    <h2>Contact</h2>
    <p>
      Questions about these terms can be sent through the <Link to="/contact">contact page</Link>.
    </p>
  </LegalPage>
);

export default Terms;
