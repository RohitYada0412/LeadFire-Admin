// src/pages/ResetPassword.jsx
import { useState } from "react";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
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
	Stack,
	TextField,
	Typography
} from "@mui/material";

import { Form, Formik } from "formik";
import * as Yup from "yup";

import { toast } from "react-toastify";
import { changePassword } from "../FirebaseDB/auth";
import { imageURL } from "../utils/images";

// ----- Yup schema -----
const schema = Yup.object({
	password: Yup.string()
		.trim()
		.required("Password is required"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref("password")], "Passwords must match")
		.required("Please confirm your password"),
});

export default function ResetPassword() {
	// const navigate = useNavigate();

	// UI state
	const [showPw1, setShowPw1] = useState(false);
	const [showPw2, setShowPw2] = useState(false);


	const handleSubmit = async (values) => {
		// const 
		try {
			const res = await changePassword(values.password, values.confirmPassword);
			if (res.ok) {
				window.location.href = '/'
				console.log("Password updated successfully.")
			}
		} catch (err) {
			toast.error(err)
			console.log();
			// setMsg(err?.message || "Failed to update password.");s
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100dvh",
				display: "flex",
				alignItems: "center",
				backgroundImage: `
          radial-gradient(1200px 1200px at 85% 85%, rgba(230,57,70,0.20) 0%, rgba(230,57,70,0.00) 60%),
          linear-gradient(180deg, rgba(230,57,70,0.16) 0%, rgba(255,255,255,0.40) 100%),
          #ffeef1
        `,
				boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
				px: { xs: 2, md: 4 },
				position: "relative",
				bgcolor: "#fdecec",
			}}
		>
			<Container maxWidth="xl">
				<Grid2 container spacing={2}>
					{/* Left illustration */}
					<Grid2 size={{ xs: 12, md: 6 }}>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: { xs: "center", md: "flex-start" },
								justifyContent: "center",
								pl: { md: 1 },
								pr: { md: 3 },
							}}
						>
							<Box
								component="img"
								src={imageURL.login}
								alt="illustration"
								sx={{
									width: { xs: 300, sm: 360, md: 550 },
									height: "auto",
									mb: { xs: 2, md: 0 },
									filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.10))",
								}}
							/>

							{/* <Box
								sx={{
									position: "relative",
									textAlign: { xs: "center", md: "left" },
									"::before": {
										content: '""',
										position: "absolute",
										left: "25%",
										bottom: { xs: -18, md: 10 },
										transform: "translateX(-30%)",
										width: { xs: 360, md: 500 },
										height: { xs: 70, md: 100 },
										borderRadius: "50%",
										background: "#fff",
										filter: "blur(10px)",
										zIndex: 0,
										pointerEvents: "none",
									},
								}}
							>
								<Typography variant="h3" sx={{ color: "#1E252D", mb: 0.5, position: "relative", zIndex: 1 }}>
									Welcome Back to LeadFire
								</Typography>
								<Typography variant="body1" sx={{ color: "rgba(30,37,45,0.70)", position: "relative", zIndex: 1 }}>
									Manage agents, zones, and issues securely.
								</Typography>
							</Box> */}
						</Box>
					</Grid2>

					{/* Right card */}
					<Grid2 size={{ xs: 12, md: 6 }}>
						<Box
							sx={{
								position: "relative",
								p: { xs: 3, md: 4 },
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								bgcolor: "transparent",
							}}
						>
							<Paper
								elevation={0}
								sx={{
									width: "100%",
									maxWidth: 500,
									borderRadius: 1.5,
									bgcolor: "#ffffff",
									p: { xs: 3, md: 4 },
									boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
								}}
							>
								<Stack spacing={1.2} justifyContent="center" sx={{ mb: 2 }}>
									<Box component="img" src={imageURL?.logo} alt="LeadFire logo" height={80} sx={{ mx: "auto" }} />
									<Typography variant="h3" sx={{ mt: 0.5, color: "#0f172a", textAlign: "center" }}>
										Set New Password
									</Typography>
									<Typography variant="h6" color="text.secondary" className="text-center fw-normal" sx={{ textAlign: "center" }}>
										For your security, please set a strong password and confirm it.
									</Typography>
								</Stack>

								<Formik
									initialValues={{ password: "", confirmPassword: "", remember: false }}
									validationSchema={schema}
									onSubmit={handleSubmit}
									enableReinitialize
								>
									{({ values, errors, touched, handleChange, isSubmitting }) => (
										<Form>
											<Stack spacing={1.6}>
												<Box>
													<Typography variant="body1" sx={{ mb: 0.9, color: "text.secondary" }}>
														New Password
													</Typography>
													<TextField
														name="password"
														placeholder="Enter your new password"
														type={showPw1 ? "text" : "password"}
														value={values.password}
														onChange={handleChange}
														error={touched.password && Boolean(errors.password)}
														helperText={touched.password && errors.password}
														fullWidth
														variant="outlined"
														InputProps={{
															endAdornment: (
																<InputAdornment position="end">
																	<IconButton onClick={() => setShowPw1((v) => !v)} edge="end">
																		{showPw1 ? <VisibilityOff /> : <Visibility />}
																	</IconButton>
																</InputAdornment>
															),
														}}
													/>
												</Box>

												<Box>
													<Typography variant="body1" sx={{ mb: 0.9, color: "text.secondary" }}>
														Confirm Password
													</Typography>
													<TextField
														name="confirmPassword"
														placeholder="Confirm your new password"
														type={showPw2 ? "text" : "password"}
														value={values.confirmPassword}
														onChange={handleChange}
														error={touched.confirmPassword && Boolean(errors.confirmPassword)}
														helperText={touched.confirmPassword && errors.confirmPassword}
														fullWidth
														variant="outlined"
														InputProps={{
															endAdornment: (
																<InputAdornment position="end">
																	<IconButton onClick={() => setShowPw2((v) => !v)} edge="end">
																		{showPw2 ? <VisibilityOff /> : <Visibility />}
																	</IconButton>
																</InputAdornment>
															),
														}}
													/>
												</Box>

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
													sx={{ color: "text.secondary" }}
												/>

												<Button
													type="submit"
													disabled={isSubmitting}
													fullWidth
													size="large"
													variant="contained"
												>
													Set new password
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
