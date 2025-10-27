// ZoneDialog.jsx
import CloseIcon from "@mui/icons-material/Close";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Circle,
  GoogleMap,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";
import { Formik } from "formik";
import { useCallback, useMemo, useRef } from "react";
import * as Yup from "yup";
import { createZone, updateZone } from "../../FirebaseDB/zone";
import GooglePlaceAutocomplete from "../common/GooglePlaceAutocomplete";
import Iconify from "../common/iconify/Iconify";

// ---------------- Schema ----------------
const schema = Yup.object({
  zone_name: Yup.string().trim().required("Zone name is required"),
  address: Yup.string().trim().required("Location is required"),
  radius_value: Yup.number()
    .typeError("Enter a number")
    .min(0.1, "Too small")
    .required("Radius is required"),
  radius_unit: Yup.mixed().oneOf(["km", "mi"]).required(),
  center: Yup.object({
    lat: Yup.number().required(),
    lng: Yup.number().required(),
  }).required(),
});

// ---------------- Map config ----------------
const libraries = ["places"];
const mapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  draggableCursor: "grab",
};

const circleOptions = { fillOpacity: 0.15, strokeOpacity: 0.6 };
const toMeters = (v, unit) => (unit === "KM" ? v * 1000 : v * 1609.34);

// ---------------- Component ----------------
export default function ZoneDialog({
  open,
  onClose,
  initialData,
  setInitialData,
  setCompanyId,
  rowAgent
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // <-- set this
    libraries,
  });

  const mapRef = useRef(null);
  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const defaults = useMemo(
    () => ({
      company_name: initialData?.company_name || "",
      company_Id: initialData?.company_Id || "",
      zone_name: initialData?.zone_name || "",
      radius_value: initialData?.radius_value ?? '',
      radius_unit: initialData?.radius_unit || "mi",
      center: {
        lat: initialData?.lat /* ?? 28.6139*/,
        lng: initialData?.lng
      } /* ||  { lat: 28.6139, lng: 77.209 }*/,
      lat: initialData?.lat /* ?? 28.6139*/,
      lng: initialData?.lng /* ?? 77.209*/,
      address: initialData?.address || "",
      agent_id: initialData?.agent_id || "",
    }),
    [initialData]
  );

  // Handle place picked from autocomplete
  const handlePlaceChange = useCallback((place, setFieldValue) => {
    const components = place?.address_components;

    // optional: extract some admin parts to your form
    components?.forEach((component) => {
      if (component.types.includes("postal_code")) {
        setFieldValue("postcode", component.long_name, false);
      }
      if (component.types.includes("locality")) {
        setFieldValue("city", component.long_name, false);
      }
      if (component.types.includes("administrative_area_level_1")) {
        setFieldValue("state", component.long_name, false);
      }
    });

    // set address / location and center
    const formatted = place?.formatted_address || place?.name || "";
    const loc = place?.geometry?.location;
    const lat = loc?.lat?.();
    const lng = loc?.lng?.();

    if (typeof lat === "number" && typeof lng === "number") {
      setFieldValue("center", { lat, lng }, false);
      setFieldValue("lat", lat, false);
      setFieldValue("lng", lng, false);
      // setFieldValue("location", formatted, false);
      setFieldValue("address", formatted, false);
      mapRef.current?.panTo({ lat, lng });
      // mapRef.current?.setZoom(13); // optionally adjust zoom
    }
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 0.5,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {initialData?.id ? "Edit Zone" : "Add Zone"}
        </Typography>
        <IconButton size="small" onClick={() => {
          setInitialData({})
          setCompanyId(null)
          onClose()
        }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Formik
        initialValues={defaults}
        enableReinitialize

        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          const authRaw = localStorage.getItem("auth");
          const auth = authRaw ? JSON.parse(authRaw) : null;

          values['company_name'] = auth?.user?.role
          values['company_Id'] = auth?.user?.uid

          console.log('values', values);

          try {
            if (initialData?.id) {
              await updateZone(initialData.id, values);
            } else {
              await createZone(values);
            }
            helpers.setSubmitting(false);
            setInitialData({})
            setCompanyId(null)
            onClose();
          } catch (e) {
            helpers.setSubmitting(false);
            console.error(e);
            // show your toast/snackbar here
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleSubmit,
          isSubmitting,
        }) => (
          <>
            <DialogContent
              dividers
              sx={{ border: "none", pt: 2 }}
              component="form"
              onSubmit={handleSubmit}
            >
              <Stack spacing={1.5}>
                {/* Zone Name */}
                <Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Zone Name
                  </Typography>
                  <TextField
                    placeholder="Zone 01"
                    fullWidth
                    value={values.zone_name}
                    onChange={(e) => setFieldValue("zone_name", e.target.value)}
                    error={touched.zone_name && Boolean(errors.zone_name)}
                    helperText={touched.zone_name && errors.zone_name}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Agent</Typography>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={(rowAgent || []).filter((z) => z.status === 1)}
                    getOptionLabel={(opt) => opt?.agent_name ?? ""}
                    isOptionEqualToValue={(o, v) => o?.id === v?.id}
                    // Form value is an array of IDs
                    value={(values.agent_id || [])
                      .map((id) => (rowAgent || []).find((z) => z.id === id))
                      .filter(Boolean)}
                    onChange={(_, selected) => {
                      const ids = selected.map((z) => z.id);
                      setFieldValue("agent_id", ids);
                    }}
                    filterSelectedOptions
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        // label="Select Zone"
                        placeholder="Search or select zones…"
                      />
                    )}
                  />
                </Stack>
                {/* Location (Places Autocomplete) */}
                <Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Location
                  </Typography>

                  {!isLoaded ? (
                    <TextField placeholder="Loading map…" fullWidth disabled />
                  ) : loadError ? (
                    <TextField
                      placeholder="Maps unavailable"
                      fullWidth
                      disabled
                      error
                    />
                  ) : (
                    <GooglePlaceAutocomplete
                      name="address"
                      values={values?.address}
                      error={!!(touched.address && errors.address)}
                      helperText={
                        touched.address && errors.address ? errors.address : null
                      }
                      setFieldValue={setFieldValue}
                      onChange={(place) => handlePlaceChange(place, setFieldValue)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Iconify icon="mdi:search" width={30} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Stack>

                {/* Radius + Unit */}
                <Stack>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Radius
                  </Typography>
                  <Grid2 container spacing={1}>
                    <Grid2 xs={10}>
                      <TextField
                        type="number"
                        placeholder="15"
                        fullWidth
                        value={values.radius_value}
                        onChange={(e) =>
                          setFieldValue("radius_value", Number(e.target.value))
                        }
                        error={touched.radius_value && Boolean(errors.radius_value)}
                        helperText={touched.radius_value && errors.radius_value}
                      />
                    </Grid2>
                    <Grid2 xs={2}>
                      <Select
                        // name="radius_unit"
                        fullWidth
                        value={values.radius_unit}
                        onChange={(e) =>
                          setFieldValue("radius_unit", e.target.value)
                        }
                      >
                        <MenuItem value="mi">MI</MenuItem>
                        <MenuItem value="km">KM</MenuItem>
                      </Select>
                    </Grid2>
                  </Grid2>
                </Stack>

                {/* Map */}
                <Box
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    overflow: "hidden",
                    height: 180,
                    bgcolor: "grey.100",
                  }}
                >
                  {!isLoaded ? (
                    <Skeleton variant="rectangular" height={180} />
                  ) : values.center ? (
                    <GoogleMap
                      key={`${values.center.lat},${values.center.lng}`} // helps force a re-mount when center changes
                      onLoad={handleMapLoad}
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={values.center}
                      zoom={13}
                      options={mapOptions}
                      onClick={(e) => {
                        const lat = e.latLng?.lat();
                        const lng = e.latLng?.lng();
                        if (typeof lat === "number" && typeof lng === "number") {
                          setFieldValue("center", { lat, lng });
                          setFieldValue("lat", lat);
                          setFieldValue("lng", lng);
                          mapRef.current?.panTo({ lat, lng });
                        }
                      }}
                    >
                      <Marker
                        position={values.center}
                        draggable
                        onDragEnd={(e) => {
                          const lat = e.latLng?.lat();
                          const lng = e.latLng?.lng();
                          if (typeof lat === "number" && typeof lng === "number") {
                            setFieldValue("center", { lat, lng });
                            setFieldValue("lat", lat);
                            setFieldValue("lng", lng);
                            mapRef.current?.panTo({ lat, lng });
                          }
                        }}
                      />
                      <Circle
                        center={values.center}
                        radius={toMeters(
                          values.radius_value || 0,
                          values.radius_unit
                        )}
                        options={circleOptions}
                      />
                    </GoogleMap>
                  ) : null}
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="error"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  py: 1.4,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
                onClick={handleSubmit}
              >
                {initialData?.id ? "Update" : "Add"}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
}
