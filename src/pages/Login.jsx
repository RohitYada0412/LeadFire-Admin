import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'


import {
	Box,
	Button,
	Checkbox,
	Container,
	FormControlLabel,
	Grid2,
	IconButton,
	InputAdornment,
	Paper,
	Stack, TextField,
	Typography
} from '@mui/material'

import { Form, Formik } from 'formik'
import * as Yup from 'yup'

import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import { browserLocalPersistence, browserSessionPersistence, fetchSignInMethodsForEmail, reload, setPersistence, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { setUser } from '../store/features/auth/authSlice'

import { toast } from "react-toastify"
import { bumpCompanyLogin } from '../FirebaseDB/companies'
import { resolveUserContext } from '../FirebaseDB/resolveUserContext'
import { imageURL } from '../utils/images'


const schema = Yup.object({
	email: Yup.string().email('Enter a valid email').required('Email is required'),
	password: Yup.string().min(6, 'At least 6 characters').required('Password is required')
})

export default function Login() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [showPw, setShowPw] = useState(false)

	return (
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
			<Container maxWidth='xl'>
				<Grid2 container spacing={2}>
					<Grid2 size={{ xs: 12, md: 6 }}>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: { xs: 'center', md: 'flex-start' },
								justifyContent: 'center',
								pl: { md: 1 },
								pr: { md: 3 },
							}}
						>
							{/* Illustration */}
							<Box
								component="img"
								src={imageURL.login}
								alt="illustration"
								sx={{
									width: { xs: 300, sm: 360, md: 550 },
									height: 'auto',
									mb: { xs: 2, md: 0 },
									filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.10))',
								}}
							/>

							{/* <Box
								sx={{
									position: 'relative',
									// maxWidth: { xs: 520, md: 560 },
									textAlign: { xs: 'center', md: 'left' },
									// the glow
									'::before': {
										content: '""',
										position: 'absolute',
										left: '25%',
										bottom: { xs: -18, md: 10 },
										transform: 'translateX(-30%)',
										width: { xs: 360, md: 500 },
										height: { xs: 70, md: 100 },
										borderRadius: '50%',
										background: '#fff',
										// background:

										filter: 'blur(10px)',
										zIndex: 0,
										pointerEvents: 'none',
									},
								}}
							>
								<Typography
									variant="h3"
									sx={{ color: '#1E252D', mb: 0.5, position: 'relative', zIndex: 1 }}
								>
									Welcome Back to LeadFire
								</Typography>
								<Typography
									variant="body1"
									sx={{ color: 'rgba(30,37,45,0.70)', position: 'relative', zIndex: 1 }}
								>
									Manage agents, zones, and issues securely.
								</Typography>
							</Box> */}
						</Box>
					</Grid2>
					<Grid2 size={{ xs: 12, md: 6 }}><Box
						sx={{
							position: 'relative',
							p: { xs: 3, md: 4 },
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							bgcolor: 'transparent',
						}}
					>
						<Paper
							elevation={0}
							sx={{
								width: '100%',
								maxWidth: 500,
								borderRadius: 1.5,
								bgcolor: '#ffffff',
								p: { xs: 3, md: 4 },
								boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
							}}
						>
							<Stack spacing={1.2} justifyContent='center' sx={{ mb: 2 }}>
								<Box component='img' src={imageURL?.logo} alt="LeadFire logo" height={80} />
								<Typography variant="h3" sx={{ mt: 0.5, color: '#0f172a', textAlign: 'center' }}>
									Welcome Back!
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Enter your admin credentials to continue
								</Typography>
							</Stack>

							<Formik
								initialValues={{ email: '', password: '', remember: false }}
								validationSchema={schema}
								onSubmit={async (values, { setSubmitting }) => {
									// setSubmitError(null);
									try {
										await setPersistence(auth, values.remember ? browserLocalPersistence : browserSessionPersistence);
										const { user } = await signInWithEmailAndPassword(auth, values.email, values.password);
										const { role, profile } = await resolveUserContext({ uid: user.uid });

										localStorage.setItem('role', role === 'company' ? true : false)
										localStorage.setItem('user-auth', JSON.stringify(user))

										// if (user.metadata.creationTime === user.metadata.lastSignInTime) {
										// 	console.log('New User ');

										// 	dispatch(setUser({
										// 		uid: user.uid, email: user.email,
										// 		role, profile,
										// 		token: user.accessToken
										// 	}))

										// 	await bumpCompanyLogin(user.uid, user.email || values.email);

										// 	localStorage.setItem('!Aut#!@', user.accessToken)
										// 	navigate("/dashboard", { replace: true });

										// } else {

										console.log('exiting User ');
										if (role == "admin" || role == "company") {
											if (role == "company") {
												const user1 = auth.currentUser;
												if (!user) return false;

												await reload(user1);
												user.emailVerified === true;

												if (user1.emailVerified === true) {
													await bumpCompanyLogin(user.uid, user.email || values.email);


													// const methods = await fetchSignInMethodsForEmail(auth, values.email);
													// if (!methods.includes('password')) {
													// 	toast.warn('This account does not have a password. Redirecting...');
													// 	navigate('/forgot-password');
													// 	return;
													// }



													dispatch(setUser({
														uid: user.uid, email: user.email,
														role, profile,
														token: user.accessToken
													}))
													toast.success('Login successfully!')
													localStorage.setItem('!Aut#!@', user.accessToken)
													navigate("/dashboard", { replace: true });

												} else {
													navigate("/finish-sign-in", { replace: true });
												}
											} else if (role == "admin") {
												dispatch(setUser({
													uid: user.uid, email: user.email,
													role, profile,
													token: user.accessToken
												}))

												await bumpCompanyLogin(user.uid, user.email || values.email);

												localStorage.setItem('!Aut#!@', user.accessToken)
												navigate("/dashboard", { replace: true });
											}
										}

										// }
									} catch (err) {
										// setSubmitError(err?.message || "Failed to sign in");
										toast.error('Your login credentials are not recognized. Please check your email and password, then try again.')
									} finally {
										setSubmitting(false);
									}
								}}
							>
								{({ values, errors, touched, handleChange, isSubmitting }) => (
									<Form>
										<Stack spacing={1.6}>
											<Box>
												<Typography variant="body1" sx={{ mb: 0.5, color: 'text.secondary' }}>
													Email Address
												</Typography>

												<TextField
													fullWidth
													placeholder="Enter your email"
													name="email"
													type="email"
													value={values.email}
													onChange={handleChange}
													variant="outlined"
													size="medium"
													margin="dense"
													inputProps={{
														inputMode: 'email',
														autoComplete: 'email',
													}}

												/>
											</Box>
											<Box>
												<Typography variant="body1" sx={{ mb: 0.9, color: 'text.secondary' }}>
													Password
												</Typography>
												<TextField
													name="password"
													placeholder="Enter your Password"
													type={showPw ? 'text' : 'password'}
													value={values.password}
													onChange={handleChange}
													error={touched.password && Boolean(errors.password)}
													helperText={touched.password && errors.password}
													fullWidth
													variant="outlined"
													InputProps={{
														endAdornment: (
															<InputAdornment position="end">
																<IconButton onClick={() => setShowPw((v) => !v)} edge="end">
																	{showPw ? <VisibilityOff /> : <Visibility />}
																</IconButton>
															</InputAdornment>
														),
													}}
												/>
											</Box>

											<Stack direction='row' justifyContent='space-between' alignItems='center'>
												<FormControlLabel
													control={
														<Checkbox
															name="remember"
															checked={values.remember}
															onChange={handleChange}
															size="small"
														/>
													}
													label="Remember me"
													sx={{ color: 'text.secondary' }}
												/>

												<Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/forgot-password')}>
													<Typography variant='body1' color='text.secondary'>Forgot Password?</Typography>
												</Box>

											</Stack>


											<Button
												type="submit"
												disabled={isSubmitting}
												fullWidth
												size="large"
												variant='contained'
											// sx={{
											// 	bgcolor: '#E63946',
											// 	'&:hover': { bgcolor: '#d62d3c' },
											// 	// borderRadius: 999,
											// 	textTransform: 'none',
											// 	fontWeight: 700,
											// 	py: 1.25
											// }}
											>
												Log in
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
	)
}
