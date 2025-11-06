import * as React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Link,
  Alert,
  Divider,
} from '@mui/material';

const ContactUs = () => {
  const companyName = 'LeadFire PRO';
  const contactEmail = 'privacy@leadfirepro.com'; // change if you have a support email
  const address = '123 Innovation Drive, San Francisco, CA, USA';
  const effectiveDate = 'November 1, 2025';

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    // honeypot: bots will fill this, humans won't
    company: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState({ type: '', msg: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.';
    if (!form.subject.trim()) return 'Please add a subject.';
    if (form.message.trim().length < 10) return 'Message should be at least 10 characters.';
    // if honeypot is filled, likely a bot
    if (form.company.trim()) return 'Spam detected.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    const err = validate();
    if (err) {
      setStatus({ type: 'error', msg: err });
      return;
    }
    try {
      setSubmitting(true);

      // TODO: Replace with your endpoint (Next.js API route, Express route, or Firebase Function)
      // Example for a relative API route:
      const res = await fetch('https://leadfirepro.net/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Something went wrong. Please try again.');
      }

      setStatus({ type: 'success', msg: 'Thanks! Your message has been sent.' });
      setForm({ name: '', email: '', subject: '', message: '', company: '' });
    } catch (error) {
      setStatus({ type: 'error', msg: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ background: '#fff' }}>
      <Container component="main" maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        {/* Header */}
        <Box component="header" sx={{ mb: 2 }}>
          <Typography component="h1" variant="h3" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {effectiveDate}
          </Typography>
        </Box>

        {/* Quick info */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            We’d love to hear from you. Use the form below or reach us directly:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Email</Typography>
              <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Address</Typography>
              <Typography>{address}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Form */}
        <Paper component="form" onSubmit={handleSubmit} noValidate variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Your name"
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="Email address"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Message"
                name="message"
                value={form.message}
                onChange={handleChange}
                multiline
                minRows={5}
              />
            </Grid>

            {/* Honeypot (hidden) */}
            <Grid item xs={12} sx={{ display: 'none' }}>
              <TextField
                label="Company"
                name="company"
                value={form.company}
                onChange={handleChange}
                autoComplete="off"
                tabIndex={-1}
              />
            </Grid>

            {status.msg && (
              <Grid item xs={12}>
                <Alert severity={status.type === 'success' ? 'success' : 'error'}>{status.msg}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Message'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 4 }} />

        {/* Footer note */}
        <Typography variant="body2" color="text.secondary">
          For security or data privacy requests, see our{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </Typography>

        {/* JSON-LD for a ContactPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ContactPage',
              name: `${companyName} Contact`,
              url: typeof window !== 'undefined' ? window.location.href : undefined,
              dateModified: effectiveDate,
              publisher: { '@type': 'Organization', name: companyName },
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  email: contactEmail,
                },
              ],
            }),
          }}
        />
      </Container>
    </Box>
  );
};

export default ContactUs;
