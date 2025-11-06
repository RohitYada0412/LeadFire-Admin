import React from 'react';

import { Box, Button, Container, Grid2, Paper, Stack, TextField, Typography } from '@mui/material';

import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import { toast } from 'react-toastify';

import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '../firebase';
import { imageURL } from '../utils/images';

const schema = Yup.object({
	email: Yup.string().email('Enter a valid email').required('Email is required'),
});

export default function ForgotPassword() {
	return (
		<React.Fragment>
			<Box
				sx={{
					minHeight: '100dvh',
					display: "flex",
					alignItems: "center",
					backgroundImage: `
              radial-gradient(1200px 1200px at 85% 85%, rgba(230,57,70,0.20) 0%, rgba(230,57,70,0.00) 60%),
              linear-gradient(180deg, rgba(230,57,70,0.16) 0%, rgba(255,255,255,0.40) 100%),
              #ffeef1
            `,
					boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
					px: { xs: 2, md: 4 },
					position: 'relative',
					bgcolor: '#fdecec', // base to keep light tone behind left panel
				}}
			>
				<Container maxWidth="xl">
					<Grid2 container spacing={2}>
						<Grid2 size={{ xs: 12, md: 6 }}>
							<Box sx={{ display: 'flex', justifyContent: 'center' }}>
								<Box component="img" src={imageURL.login} alt="illustration" sx={{ width: { xs: 300, sm: 360, md: 550 } }} />
							</Box>
						</Grid2>

						<Grid2 size={{ xs: 12, md: 6 }}>
							<Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', justifyContent: 'center' }}>
								<Paper sx={{ width: '100%', maxWidth: 500, p: { xs: 3, md: 4 } }}>
									<Stack spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
										<Box component="img" src={imageURL?.logo} alt="logo" height={80} />
										<Typography variant="h4">Forgot password?</Typography>
										<Typography variant="body2" color="text.secondary" textAlign="center">
											Enter your email and we’ll send you a reset link.
										</Typography>
									</Stack>

									<Formik
										initialValues={{ email: '' }}
										validationSchema={schema}
										onSubmit={async ({ email }, { setSubmitting, resetForm }) => {
											try {
												// 1. Check if email exists / has sign-in methods
												const methods = await fetchSignInMethodsForEmail(auth, email);

												if (methods.length === 0) {
													toast.error('No account found with this email.');
													return; // don't call sendPasswordResetEmail
												}

												// 2. Email exists -> send reset link
												await sendPasswordResetEmail(auth, email, {
													url: `${window.location.origin}/reset-password`,
													handleCodeInApp: false,
												});

												toast.success('Password reset link sent to your email.');
												resetForm();
											} catch (err) {
												const msg = err?.code
													? err.code.replace('auth/', '').replace(/-/g, ' ')
													: err?.message;
												toast.error(msg || 'Failed to send reset email');
											} finally {
												setSubmitting(false);
											}
										}}
									>
										{({ values, errors, touched, handleChange, isSubmitting }) => (
											<Form>
												<Stack spacing={2}>
													<Typography variant="body1" sx={{ mb: 0.5, color: 'text.secondary' }}>
														Email Address
													</Typography>
													<TextField
														// label="Email address"
														name="email"
														type="email"
														placeholder="Enter your email"
														fullWidth
														value={values.email}
														onChange={handleChange}
														error={touched.email && Boolean(errors.email)}
														helperText={touched.email && errors.email}
														autoComplete="email"
														inputMode="email"
													/>

													<Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
														{isSubmitting ? 'Sending…' : 'Send reset link'}
													</Button>

													<Button href="/login" color="inherit" fullWidth>
														Back to Login
													</Button>
												</Stack>
											</Form>
										)}
									</Formik>
								</Paper>
							</Box>
						</Grid2>
					</Grid2>
				</Container>
			</Box>
		</React.Fragment>
	);
}
