import CloseIcon from "@mui/icons-material/Close";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Stack,
	TextField,
	Typography
} from "@mui/material";

import { Formik } from "formik";
import * as Yup from "yup";
import { createCompany, updateCompany } from "../../FirebaseDB/companies";
import { signUpWithRole } from "../../FirebaseDB/resolveUserContext";

const schema = Yup.object({
	company_name: Yup.string().trim().required("Company Name is required"),
	first_name: Yup.string().trim().required("Contact First Name is required"),
	last_name: Yup.string().trim().required("Contact Last Name is required"),
	phone_number: Yup.string().trim().required("Company Phone Number is required"),
	email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
});

export default function AddCompanyDialog({
	open,
	handleClose,
	initialData,
	companyId,
	setInitialData,
	setCompanyId
}) {


	const handleClosePop = () => {
		setInitialData({
			company_name: '',
			email: ''
		})
		setCompanyId('')
		handleClose()
	}

	return (
		<Dialog
			open={open}
			onClose={handleClosePop}
			maxWidth="xs"
			fullWidth
			PaperProps={{ sx: { borderRadius: .8, p: 1 } }}
		>
			<DialogTitle
				sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 0 }}
			>
				<Typography variant="h6" fontWeight={700}>
					{companyId ? "Edit Company" : 'Add New Company'}
				</Typography>
				<IconButton onClick={handleClosePop} size="small">
					<CloseIcon />
				</IconButton>
			</DialogTitle>



			<Formik
				initialValues={initialData}
				enableReinitialize={true}
				validationSchema={schema}

				onSubmit={async (values, helpers) => {
					try {
						if (companyId) {
							await updateCompany(String(companyId), values);
							setInitialData({})
						} else {

							let user = await signUpWithRole({
								email: values?.email,
								password: values?.temp_password
							})

							values['id'] = user?.uid
							let res = await createCompany(values)
							console.log(res);



							if (res !== null) {
								const emailPayload = {
									to: values.email,
									subject: "Verification Mail",
									code: values?.temp_password,
									expiryMinutes: 15,
								};
								const url = "https://mmfinfotech.co/leadfire-backend/api/send-email";
								const emailRes = await fetch(url, {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									// remove credentials if your endpoint doesn't require cookies/CSRF
									// credentials: "include",
									body: JSON.stringify(emailPayload),
								});

								// optional: surface server error if any
								if (!emailRes.ok) {
									let msg = `Email send failed (${emailRes.status})`;
									try {
										const data = await emailRes.json();
										msg = data?.message || data?.error || msg;
									} catch (_) {
										console.error(_);

									}
									// Not fatal to company creation, but you may want to inform the user:
									console.warn(msg);
								}
							}
						}

						helpers.resetForm();
						helpers.setTouched({});
						handleClose();
					} catch (err) {
						helpers.setFieldError("email", err.message || "Failed to create company");
					} finally {
						helpers.setSubmitting(false);
					}
				}}
			>
				{({ handleSubmit, getFieldProps, touched, errors, isSubmitting }) => (
					<>
						<DialogContent
							dividers
							sx={{ border: "none", pt: 2 }}
							component="form"
							onSubmit={handleSubmit}
						>
							<Stack direction='column'>
								<Typography variant="body1">Company Name<Typography component="span" sx={{ color: "red" }}>
									*
								</Typography></Typography>
								<TextField
									placeholder="Enter Company Name"
									fullWidth
									margin="normal"
									// autoFocus
									{...getFieldProps("company_name")}
									error={touched.company_name && Boolean(errors.company_name)}
									helperText={touched.company_name && errors.company_name}
								/>
							</Stack>

							<Stack direction='column'>
								<Typography variant="body1">Contact First Name<Typography component="span" sx={{ color: "red" }}>
									*
								</Typography></Typography>
								<TextField
									placeholder="Enter Contact First Name"
									fullWidth
									margin="normal"
									// autoFocus
									{...getFieldProps("first_name")}
									error={touched.first_name && Boolean(errors.first_name)}
									helperText={touched.first_name && errors.first_name}

								// error={touched.first_name && Boolean(errors.first_name)}
								// helperText={touched.first_name && errors.first_name}
								/>
							</Stack>

							<Stack direction='column'>
								<Typography variant="body1">Contact Last Name<Typography component="span" sx={{ color: "red" }}>
									*
								</Typography></Typography>
								<TextField
									placeholder="Enter Contact Last Name"
									fullWidth
									margin="normal"
									autoFocus
									{...getFieldProps("last_name")}
									error={touched.last_name && Boolean(errors.last_name)}
									helperText={touched.last_name && errors.last_name}
								/>
							</Stack>

							<Stack direction='column'>
								<Typography variant="body1">Company Phone Number<Typography component="span" sx={{ color: "red" }}>
									*
								</Typography></Typography>
								<TextField
									placeholder="Enter Company Phone Number"
									fullWidth
									margin="normal"
									autoFocus
									{...getFieldProps("phone_number")}
									error={touched.phone_number && Boolean(errors.phone_number)}
									helperText={touched.phone_number && errors.phone_number}
								/>
							</Stack>

							<Stack direction='column'>
								<Typography variant="body1">Company Admin Email<Typography component="span" sx={{ color: "red" }}>
									*
								</Typography></Typography>
								<TextField
									label=""
									placeholder="Email Company Admin Email"
									fullWidth
									margin="normal"
									{...getFieldProps("email")}
									error={touched.email && Boolean(errors.email)}
									helperText={touched.email && errors.email}
									disabled={companyId ? true : false}
								/>

							</Stack>


							{/* <Stack direction='column'>
								<Typography variant="body1">Temporary Password</Typography>
								<TextField
									placeholder="Enter Temporary Password"
									type="password"
									fullWidth
									margin="normal"
									l
									disabled
									{...getFieldProps("temp_password")}
								/>
							</Stack> */}
						</DialogContent>

						<DialogActions sx={{ px: 3, pb: 2 }}>
							<Button
								type="submit"
								variant="contained"
								color="error"
								fullWidth
								onClick={handleSubmit}
								disabled={isSubmitting}
								sx={{ py: 1.5, borderRadius: 0.8 }}
							>
								{isSubmitting ? "Adding…" : "Add"}
							</Button>
						</DialogActions>
					</>
				)}
			</Formik>
		</Dialog >
	);
}
