
import CloseIcon from "@mui/icons-material/Close";

import {
  Autocomplete,
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, IconButton, MenuItem, Select, Stack, TextField, Typography
} from "@mui/material";

import { Formik } from "formik";
import * as Yup from "yup";

import { createAgent, updateAgent } from "../../FirebaseDB/agent";
import { deleteOwnAccount, signUpWithRole } from "../../FirebaseDB/resolveUserContext";
import { useEffect } from "react";
import { getCompanyById } from "../../FirebaseDB/companies";

const phoneYup = Yup.string()
  .trim()
  .required("Phone number is required")
  .test("is-valid-phone", "Enter a valid phone number", (value) => {
    if (!value) return false;
    const digits = value.replace(/\D/g, ""); // strip spaces, dashes, etc.
    if (digits.length < 8 || digits.length > 15) return false;
    if (/^(\d)\1+$/.test(digits)) return false;
    return true;
  });

const schema = Yup.object({
  agent_name: Yup.string().trim().required("Agent name is required"),
  email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
  zone: Yup.mixed().required("Zone is required"),
  phone_number: phoneYup
});

export default function AddCompanyDialog({
  open,
  handleClose,
  initialData,
  companyId,
  setInitialData,
  setCompanyId,
  companyData,
}) {
  const handleClosePop = () => {
    setInitialData({
      agent_name: "",
      email: "",
      zone: "",
      company_id: "",
      temp_password: "",
      status: 1,
      user_name: "agent",
      user_type: 3,
      photo: null,
      oldPhotoPath: null,
      photoURL: null,
      phone_number: ''
    });
    setCompanyId("");
    handleClose();
  };

  const role = localStorage.getItem('auth')


  useEffect(() => {
    if (open && JSON.parse(role).user.uid) {
      getCompanyById(JSON.parse(role).user.uid).then((companyDetail) => {

        console.log('companyDetail?.company_name', companyDetail?.company_name);


        setInitialData({
          ...initialData,
          company_name: companyDetail?.company_name
        })

      })
    }
  }, [companyId])





  return (
    <Dialog open={open} onClose={handleClosePop} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 0.5 }}>
        <Typography variant="h6" fontWeight={700}>{companyId ? "Update Agent" : "Add New Agent"}</Typography>
        <IconButton onClick={handleClosePop} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <Formik
        enableReinitialize
        initialValues={{
          agent_name: initialData?.agent_name || "",
          email: initialData?.email || "",
          zone: initialData?.zone || "",
          company_id: '',
          temp_password: initialData?.temp_password || "",
          password: "",
          status: initialData?.status ?? 1,
          user_name: initialData?.user_name ?? "agent",
          user_type: initialData?.user_type ?? 3,
          photo: null,
          oldPhotoPath: initialData?.photoPath || null,
          photoURL: initialData?.photoURL || null,
          phone_number: initialData?.phone_number
        }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          values['company_id'] = JSON.parse(role).user.uid
          try {
            if (companyId) {
              await updateAgent(String(companyId), values);
            } else {

              try {
                let user = await signUpWithRole({
                  email: values?.email,
                  password: values?.temp_password
                })

                values['id'] = user?.uid
                let res = await createAgent(values)
                if (res !== null) {
                  const emailPayload = {
                    to: values.email,
                    subject: "Verification Mail",
                    code: values?.temp_password,
                    expiryMinutes: 15,
                  };

                  const url = "https://mmfinfotech.co/leadfire-backend/api/send-email-agent";
                  const emailRes = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
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

              } catch (error) {
                console.log('error', error);

                await deleteOwnAccount({ email: values?.email, password: values?.temp_password })

              }


            }
            helpers.resetForm();
            helpers.setTouched({});
            handleClosePop();
          } catch (err) {
            const msg = err?.message || "Failed to save agent";
            // route storage-related errors to photo field
            if (/storage\//i.test(err?.code || "") || /storage/i.test(msg)) {
              helpers.setFieldError("photo", msg);
            } else {
              helpers.setFieldError("email", msg);
            }
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ handleSubmit, values, getFieldProps, touched, errors, isSubmitting, setFieldValue }) => (
          <>

            <DialogContent dividers sx={{ border: "none", pt: 2 }} component="form" onSubmit={handleSubmit}>
              <Stack spacing={1.25}>
                <Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Agent Name</Typography>
                  <TextField
                    placeholder="Enter your agent name"
                    fullWidth
                    {...getFieldProps("agent_name")}
                    error={touched.agent_name && Boolean(errors.agent_name)}
                    helperText={touched.agent_name && errors.agent_name}
                  />
                </Stack>

                <Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Email Address</Typography>
                  <TextField
                    placeholder="Enter your email"
                    fullWidth
                    {...getFieldProps("email")}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    disabled={Boolean(companyId)}
                  />
                </Stack>

                <Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Phone Number</Typography>
                  <TextField
                    placeholder="phone number"
                    fullWidth
                    {...getFieldProps("phone_number")}
                    error={touched.phone_number && Boolean(errors.phone_number)}
                    helperText={touched.phone_number && errors.phone_number}
                  // disabled={Boolean(companyId)}
                  />
                </Stack>

                <Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Company</Typography>
                  {JSON.parse(role).role === 'company' ?
                    <TextField
                      name='company_id'
                      value={initialData?.company_name}
                      disabled
                    />
                    : <FormControl fullWidth>
                      <Select
                        displayEmpty
                        {...getFieldProps("company_id")}
                        onChange={(e) => setFieldValue("company_id", e.target.value)}
                      >
                        <MenuItem value="" disabled>Select Company</MenuItem>
                        {
                          companyData?.map((_, i) => (
                            <MenuItem value={_?.id} key={i}>{_?.company_name}</MenuItem>

                          ))
                        }
                      </Select>
                    </FormControl>}
                  {touched.zone && errors.zone && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.zone}</Typography>
                  )}
                </Stack>

                {/* <Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Zone</Typography>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={(zoneData || []).filter((z) => z.status === 1)}
                    getOptionLabel={(opt) => opt?.zone_name ?? ""}
                    isOptionEqualToValue={(o, v) => o?.id === v?.id}
                    // Form value is an array of IDs
                    value={(values.zone || [])
                      .map((id) => (zoneData || []).find((z) => z.id === id))
                      .filter(Boolean)}
                    onChange={(_, selected) => {
                      const ids = selected.map((z) => z.id);
                      setFieldValue("zone", ids);
                    }}
                    filterSelectedOptions
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Zone"
                        placeholder="Search or select zones…"
                      />
                    )}
                  />
                </Stack> */}

                {/* <Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Temporary Password</Typography>
                  <TextField
                    placeholder="Enter Temporary Password"
                    type="text"
                    fullWidth
                    {...getFieldProps("temp_password")}
                    error={touched.temp_password && Boolean(errors.temp_password)}
                    helperText={touched.temp_password && errors.temp_password}
                    disabled
                  />
                </Stack> */}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="error"
                fullWidth
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{ py: 1.6, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                {isSubmitting ? (companyId ? "Updating…" : "Adding…") : (companyId ? "Update" : "Add")}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
}
