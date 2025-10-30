import { Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { imageURL } from '../utils/images';

const schema = Yup.object({
	email: Yup.string().email('Enter a valid email').required('Email is required'),
});

export default function ForgotPassword() {
	return (
		<Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', px: { xs: 2, md: 4 } }}>
			<Container maxWidth="xl">
				<Grid2 container spacing={2}>
					<Grid2 xs={12} md={6}>
						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<Box component="img" src={imageURL.login} alt="illustration" sx={{ width: { xs: 300, sm: 360, md: 550 } }} />
						</Box>
					</Grid2>

					<Grid2 xs={12} md={6}>
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
											await sendPasswordResetEmail(auth, email, {
												url: `${window.location.origin}/reset-password`,
												handleCodeInApp: false,
											});
											toast.success('Password reset link sent to your email.');
											resetForm();
										} catch (err) {
											const msg = err?.code ? err.code.replace('auth/', '').replace(/-/g, ' ') : err?.message;
											toast.error(msg || 'Failed to send reset email');
										} finally {
											setSubmitting(false);
										}
									}}
								>
									{({ values, errors, touched, handleChange, isSubmitting }) => (
										<Form>
											<Stack spacing={2}>
												<TextField
													label="Email address"
													name="email"
													type="email"
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
	);
}
