import * as React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';

/**
 * Privacy Policy Page for LeadFire PRO (MUI)
 */
const PrivacyPolicy = () => {
  const companyName = 'LeadFire PRO';
  const contactEmail = 'privacy@leadfirepro.com';
  const address = '123 Innovation Drive, San Francisco, CA, USA';
  const effectiveDate = 'November 1, 2025';

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'data-we-collect', title: 'Information We Collect' },
    { id: 'how-we-use', title: 'How We Use Your Information' },
    { id: 'sharing', title: 'How We Share Information' },
    { id: 'cookies', title: 'Cookies & Tracking' },
    { id: 'retention', title: 'Data Retention' },
    { id: 'security', title: 'Data Security' },
    { id: 'your-rights', title: 'Your Rights & Choices' },
    { id: 'children', title: 'Children’s Privacy' },
    { id: 'intl', title: 'International Data Transfers' },
    { id: 'changes', title: 'Changes to This Policy' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <React.Fragment>
      <Box sx={{ background: '#fff' }}>
        <Container component="main" maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
          {/* Header */}
          <Box component="header" sx={{ mb: 2 }}>
            <Typography component="h1" variant="h3" id="privacy-heading" gutterBottom>
              Privacy Policy
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {effectiveDate}
            </Typography>
          </Box>

          {/* Intro notice */}
          <Paper
            role="note"
            variant="outlined"
            sx={{ p: 2, mb: 3, borderRadius: 2 }}
          >
            <Typography variant="body1">
              <strong>{companyName}</strong> (“we”, “us”, “our”) values your privacy. This policy
              explains how we collect, use, and safeguard your information when you use our app and website.
            </Typography>
          </Paper>

          {/* Sections */}
          <Section id="overview" title="Overview">
            <Typography paragraph>
              This Privacy Policy describes how {companyName} (“LeadFire PRO”, “we”, or “our”) collects,
              uses, discloses, and protects personal information when you use our application, website,
              and related services (collectively, the “Services”). By using our Services, you consent to
              this Privacy Policy.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="data-we-collect" title="Information We Collect">
            <Typography variant="subtitle1" gutterBottom>1. Information You Provide</Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <li>Account details (name, email address, password)</li>
              <li>Payment and billing information (handled securely through third-party processors)</li>
              <li>Content and messages submitted via the app</li>
              <li>Support inquiries and feedback</li>
            </Box>

            <Typography variant="subtitle1" gutterBottom>2. Information Collected Automatically</Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>Device and browser information (IP address, OS, app version, language)</li>
              <li>Usage data (features accessed, actions taken, time spent)</li>
              <li>Cookies and analytics data (see “Cookies & Tracking” below)</li>
            </Box>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="how-we-use" title="How We Use Your Information">
            <Box component="ul" sx={{ pl: 3 }}>
              <li>Provide, operate, and improve {companyName}</li>
              <li>Personalize your experience and deliver relevant features</li>
              <li>Process payments and prevent fraud</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Send important updates, security notices, and service announcements</li>
              <li>Comply with legal obligations</li>
              <li>With your consent, send marketing or promotional communications</li>
            </Box>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="sharing" title="How We Share Information">
            <Typography paragraph>We may share personal data only as necessary and in accordance with this Policy:</Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>With trusted <strong>service providers</strong> for hosting, analytics, payments, or support</li>
              <li>As part of a <strong>business transfer</strong> (e.g., merger or acquisition)</li>
              <li>To comply with <strong>legal obligations</strong> or protect our rights</li>
              <li>With your explicit <strong>consent</strong> or at your direction</li>
            </Box>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="cookies" title="Cookies & Tracking">
            <Typography paragraph>
              {companyName} uses cookies and similar technologies to improve your experience, analyze usage,
              and support essential site functionality. You can manage or disable cookies through your browser settings.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="retention" title="Data Retention">
            <Typography paragraph>
              We retain personal data only as long as needed to provide our Services, meet legal obligations, and
              resolve disputes. When no longer required, your data is securely deleted or anonymized.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="security" title="Data Security">
            <Typography paragraph>
              We implement industry-standard security measures to protect your personal data. However, no system is
              completely secure, and we cannot guarantee absolute protection against unauthorized access.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="your-rights" title="Your Rights & Choices">
            <Typography paragraph>You may have the right to:</Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>Access, update, or delete your personal information</li>
              <li>Withdraw consent for data processing</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your personal data</li>
            </Box>
            <Typography>
              To exercise these rights, contact us at{' '}
              <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="children" title="Children’s Privacy">
            <Typography paragraph>
              {companyName} is not directed to children under 13, and we do not knowingly collect personal data from them.
              If we learn that we have inadvertently collected such information, we will delete it promptly.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="intl" title="International Data Transfers">
            <Typography paragraph>
              Your data may be processed in countries other than your own. We take appropriate safeguards to ensure
              compliance with applicable privacy laws when transferring data internationally.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="changes" title="Changes to This Policy">
            <Typography paragraph>
              We may update this Privacy Policy periodically. The “Last updated” date above reflects the most recent revision.
              Material changes will be communicated through the app or our website.
            </Typography>
          </Section>

          <Divider sx={{ my: 3 }} />

          <Section id="contact" title="Contact Us">
            <Box component="address" sx={{ fontStyle: 'normal' }}>
              <Typography>{companyName}</Typography>
              <Typography>{address}</Typography>
              <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>
            </Box>
          </Section>

          {/* JSON-LD for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'PrivacyPolicy',
                name: `${companyName} Privacy Policy`,
                url: typeof window !== 'undefined' ? window.location.href : undefined,
                dateModified: effectiveDate,
                publisher: { '@type': 'Organization', name: companyName },
                contactPoint: [{
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  email: contactEmail,
                }],
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

export default PrivacyPolicy;
