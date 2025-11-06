import * as React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Link,
  Divider,
} from '@mui/material';

/**
 * Terms & Conditions for LeadFire PRO (MUI)
 */
const TermAndCondition = () => {
  const companyName = 'LeadFire PRO';
  const contactEmail = 'privacy@leadfirepro.com';
  const address = '123 Innovation Drive, San Francisco, CA, USA';
  const effectiveDate = 'November 1, 2025';

  return (
    <React.Fragment>
      <Box sx={{ background: '#fff' }}>
        <Container component="main" maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
          {/* Header */}
          <Box component="header" sx={{ mb: 2 }}>
            <Typography component="h1" variant="h3" id="tos-heading" gutterBottom>
              Terms &amp; Conditions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {effectiveDate}
            </Typography>
          </Box>

          {/* Intro notice */}
          <Paper role="note" variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="body1">
              These Terms &amp; Conditions (“Terms”) govern your access to and use of {companyName}’s
              website, application, and related services (collectively, the “Services”). By accessing
              or using the Services, you agree to be bound by these Terms.
            </Typography>
          </Paper>

          {/* Sections */}
          <Section id="acceptance" title="1. Acceptance of Terms">
            <Typography paragraph>
              By creating an account, accessing, or using the Services, you confirm that you can form a
              binding contract with {companyName} and that you have read, understood, and agree to these Terms
              and our Privacy Policy.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="eligibility" title="2. Eligibility & Accounts">
            <Typography paragraph>
              You must be at least 13 years old (or the age of digital consent in your jurisdiction) to use the
              Services. You are responsible for maintaining the confidentiality of your account credentials and for
              all activities under your account. Notify us immediately of any unauthorized use.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="subscriptions" title="3. Subscriptions, Billing & Taxes">
            <Typography paragraph>
              Some features require a paid subscription. Fees, billing cycle, and renewal terms are presented at
              checkout and may change upon notice. Unless stated otherwise, subscriptions renew automatically until
              canceled. You authorize {companyName} (or its payment processor) to charge all applicable fees, taxes,
              and currency conversion costs to your payment method.
            </Typography>
            <Typography paragraph>
              <strong>Trials &amp; refunds:</strong> If a free trial is offered, you will be charged at the end of the
              trial unless you cancel beforehand. Refunds, if any, are provided at our discretion or where required
              by law. Local consumer rights may apply.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="use" title="4. Permitted Use & Acceptable Use Policy">
            <Typography paragraph>
              You agree to use the Services only for lawful purposes and in accordance with these Terms. You must not:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>Reverse engineer, decompile, or attempt to access source code where not permitted.</li>
              <li>Bypass or interfere with security or access controls.</li>
              <li>Upload malware or content that is unlawful, infringing, or harmful.</li>
              <li>Use the Services to spam, harass, or mislead others.</li>
              <li>Exceed any usage limits or quotas described in your plan.</li>
            </Box>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="content" title="5. User Content & Licenses">
            <Typography paragraph>
              You retain ownership of content you submit to the Services (“User Content”). You grant {companyName} a
              worldwide, non-exclusive, royalty-free license to host, process, transmit, and display User Content
              solely to provide and improve the Services. You represent that you have all rights needed to grant this license.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="ip" title="6. Intellectual Property">
            <Typography paragraph>
              The Services, including software, features, logos, and content, are owned by {companyName} or its
              licensors and are protected by intellectual property laws. Except as expressly permitted, no rights to
              use our trademarks or other IP are granted.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="thirdparty" title="7. Third-Party Services & Links">
            <Typography paragraph>
              The Services may integrate with or link to third-party products and websites. We are not responsible
              for third-party terms, privacy practices, or content. Your use of third-party services is at your own risk.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="beta" title="8. Beta & Experimental Features">
            <Typography paragraph>
              From time to time, we may offer beta or preview features. These are provided “as is” for evaluation
              and may be modified, suspended, or discontinued at any time.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="privacy" title="9. Privacy">
            <Typography paragraph>
              Our collection and use of personal information are described in our Privacy Policy. By using the Services,
              you consent to those practices.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="warranties" title="10. Disclaimers">
            <Typography paragraph>
              THE SERVICES ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS. TO THE MAXIMUM EXTENT PERMITTED BY LAW,
              {companyName} DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED,
              ERROR-FREE, OR SECURE.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="liability" title="11. Limitation of Liability">
            <Typography paragraph>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, {companyName} AND ITS AFFILIATES WILL NOT BE LIABLE FOR INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE,
              DATA, OR USE, EVEN IF ADVISED OF THE POSSIBILITY. OUR TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE
              SERVICES IN ANY 12-MONTH PERIOD WILL NOT EXCEED THE AMOUNTS YOU PAID TO {companyName} FOR THE SERVICES
              IN THAT PERIOD.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="indemnity" title="12. Indemnification">
            <Typography paragraph>
              You agree to defend, indemnify, and hold harmless {companyName} and its affiliates from and against any
              claims, damages, liabilities, costs, and expenses (including reasonable attorneys’ fees) arising out of
              or related to your use of the Services or violation of these Terms.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="termination" title="13. Suspension & Termination">
            <Typography paragraph>
              We may suspend or terminate your access to the Services immediately if you breach these Terms, create
              risk or legal exposure for us, or where required by law. Upon termination, your right to use the
              Services ceases, but certain sections (e.g., IP, Disclaimers, Liability, Indemnity, Governing Law)
              will survive.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="law" title="14. Governing Law & Dispute Resolution">
            <Typography paragraph>
              These Terms are governed by the laws of the jurisdiction indicated in your order form or, if none is
              specified, the laws of the State of California, USA, without regard to conflict-of-laws principles.
              Any dispute will be resolved in the courts located in San Francisco County, California (or via binding
              arbitration if required by applicable law or agreed in writing).
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="export" title="15. Export & Compliance">
            <Typography paragraph>
              You represent that you are not located in an embargoed country and are not on any government list of
              prohibited or restricted parties. You agree to comply with all applicable export and sanctions laws.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="changes" title="16. Changes to These Terms">
            <Typography paragraph>
              We may update these Terms from time to time. The “Last updated” date reflects the latest revision.
              Continued use of the Services after changes become effective constitutes acceptance of the revised Terms.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="contact" title="17. Contact Us">
            <Box component="address" sx={{ fontStyle: 'normal' }}>
              <Typography>{companyName}</Typography>
              <Typography>{address}</Typography>
              <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>
            </Box>
          </Section>

          {/* JSON-LD (safe generic web page markup for T&C) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: `${companyName} Terms & Conditions`,
                url: typeof window !== 'undefined' ? window.location.href : undefined,
                dateModified: effectiveDate,
                about: 'Terms and Conditions',
                publisher: { '@type': 'Organization', name: companyName },
              }),
            }}
          />
        </Container>
      </Box>
    </React.Fragment>
  );
};

/** Small helper to keep headings consistent */
const Section = ({ id, title, children }) => (
  <Box id={id} component="section" sx={{ scrollMarginTop: 96 }}>
    <Typography component="h2" variant="h5" sx={{ mb: 1.5 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

export default TermAndCondition;
