import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CircularProgress,
  Divider,
  Autocomplete as MUIAutocomplete,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";

import { useJsApiLoader } from "@react-google-maps/api";

// Constants
const LIBRARIES = ["places"];
const MAX_OPTIONS = 10;
const DEBOUNCE_DELAY = 250;

// Utility functions
const extractParts = (components) => {
  const get = (t, key = "long_name") =>
    components?.find((c) => c.types.includes(t))?.[key];

  const suburb =
    get("locality") || get("sublocality_level_1") || get("postal_town") || "";
  const postcode = get("postal_code") || "";
  const stateLong = get("administrative_area_level_1") || "";
  const stateShort = get("administrative_area_level_1", "short_name") || "";
  const countryCode = get("country", "short_name") || "";

  return { suburb, postcode, stateLong, stateShort, countryCode };
};

// Debounce hook
const useDebounced = (value, delay = DEBOUNCE_DELAY) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Google Maps services hook
const useGoogleMapsServices = (isLoaded) => {
  const sessionTokenRef = useRef(null);

  useEffect(() => {
    if (
      isLoaded &&
      typeof window !== "undefined" &&
      window.google &&
      !sessionTokenRef.current
    ) {
      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded]);

  useEffect(() => {
    return () => {
      sessionTokenRef.current = null;
    };
  }, []);

  const services = useMemo(() => {
    if (!isLoaded || !window.google) return null;

    const google = window.google;
    return {
      autocomplete: new google.maps.places.AutocompleteService(),
      places: new google.maps.places.PlacesService(
        document.createElement("div")
      ),
    };
  }, [isLoaded]);

  return { services, sessionToken: sessionTokenRef.current };
};

const GooglePlaceAutocomplete = (props) => {
  const {
    error,
    helperText,
    name,
    name2,
    values,
    setFieldValue,
    handleBlur,
    onChange,
    sx,
    ...rest
  } = props;

  const GOOGLE_MAP_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAP_KEY,
    libraries: LIBRARIES,
  });

  const [inputValue, setInputValue] = useState(values || "");
  const [value, setValue] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  const debouncedInputValue = useDebounced(inputValue, DEBOUNCE_DELAY);
  const { services, sessionToken } = useGoogleMapsServices(isLoaded);

  // Keep input synced with external form state
  useEffect(() => {
    setInputValue(values || "");
  }, [values]);

  // Fetch place details (WORLDWIDE — no country filtering)
  const fetchPlaceDetails = useCallback(
    (placeId, placesService) => {
      return new Promise((resolve) => {
        placesService.getDetails(
          {
            placeId,
            fields: [
              "address_components",
              "geometry.location",
              "formatted_address",
              "name",
              "types",
              "url",
            ],
            sessionToken,
          },
          (place, status) => {
            if (
              status !== window.google.maps.places.PlacesServiceStatus.OK ||
              !place
            ) {
              resolve(null);
              return;
            }

            const { suburb, postcode, stateLong, stateShort, countryCode } =
              extractParts(place.address_components || []);

            const location = place.geometry?.location;
            const displayAddress = place.formatted_address || place.name || "";

            resolve({
              id: placeId,
              label: displayAddress,
              fullAddress: place.formatted_address,
              name: place.name || "",
              suburb,
              postcode,
              stateLong,
              stateShort,
              countryCode,
              lat: location?.lat?.(),
              lng: location?.lng?.(),
              types: place.types || [],
              placeData: place,
            });
          }
        );
      });
    },
    [sessionToken]
  );

  // Fetch predictions with multiple search types (WORLDWIDE)
  useEffect(() => {
    const query = debouncedInputValue?.trim();
    if (!isLoaded || !window.google || !query || !services || query.length < 2) {
      setOptions([]);
      return;
    }

    let isCancelled = false;

    const fetchPredictions = async () => {
      setLoading(true);

      try {
        const { autocomplete, places } = services;

        const searchRequests = [
          { input: query, sessionToken, types: ["establishment"] },
          { input: query, sessionToken, types: ["address"] },
          { input: query, sessionToken, types: ["(regions)"] },
        ];

        const allPredictions = await Promise.all(
          searchRequests.map(
            (request) =>
              new Promise((resolve) => {
                autocomplete.getPlacePredictions(
                  request,
                  (predictions, status) => {
                    if (
                      status ===
                        window.google.maps.places.PlacesServiceStatus.OK &&
                      predictions?.length
                    ) {
                      resolve(predictions);
                    } else {
                      resolve([]);
                    }
                  }
                );
              })
          )
        );

        if (isCancelled) return;

        // Combine + dedupe
        const combinedPredictions = [];
        const seenPlaceIds = new Set();
        allPredictions.flat().forEach((prediction) => {
          if (!seenPlaceIds.has(prediction.place_id)) {
            seenPlaceIds.add(prediction.place_id);
            combinedPredictions.push(prediction);
          }
        });

        if (!combinedPredictions.length) {
          setOptions([]);
          setLoading(false);
          return;
        }

        // Fetch details for top results
        const topPredictions = combinedPredictions.slice(0, MAX_OPTIONS);
        const placeDetails = await Promise.all(
          topPredictions.map((p) => fetchPlaceDetails(p.place_id, places))
        );

        const validOptions = placeDetails.filter(Boolean);

        if (!isCancelled) {
          // Sort: establishments first
          const sortedOptions = validOptions.sort((a, b) => {
            const isEst = (o) =>
              o.types?.some((t) =>
                [
                  "establishment",
                  "point_of_interest",
                  "store",
                  "restaurant",
                  "food",
                ].includes(t)
              );
            return (isEst(b) ? 1 : 0) - (isEst(a) ? 1 : 0);
          });

          setOptions(sortedOptions);
        }
      } catch (err) {
        if (!isCancelled) {
          console.log("Failed to fetch location details", err);
          setOptions([]);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchPredictions();
    return () => {
      isCancelled = true;
    };
  }, [
    debouncedInputValue,
    isLoaded,
    services,
    sessionToken,
    fetchPlaceDetails,
  ]);

  // Handle selection
  const handleSelect = useCallback(
    (event, newValue) => {
      setValue(newValue);

      if (newValue) {
        const selectedValue = newValue.fullAddress || newValue.label;
        setFieldValue(name, selectedValue);
        // BUGFIX: lnh -> lng
        setFieldValue("center", { lat: newValue.lat, lng: newValue.lng });

        if (name2) {
          setFieldValue(name2, newValue.placeData?.url || "");
        }

        if (onChange) {
          onChange(newValue.placeData || newValue, setFieldValue);
        }
      } else {
        setFieldValue(name, "");
        if (name2) setFieldValue(name2, "");
      }
    },
    [name, name2, setFieldValue, onChange]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (event, newInputValue, reason) => {
      if (reason === "input") {
        setInputValue(newInputValue);
        setFieldValue(name, newInputValue);
      }
    },
    [name, setFieldValue]
  );

  // Focus/blur
  const handleFocus = useCallback(() => setHasFocus(true), []);
  const handleInputBlur = useCallback(
    (event) => {
      setHasFocus(false);
      if (handleBlur) handleBlur(event);
    },
    [handleBlur]
  );

  // Labels, equality, rendering
  const getOptionLabel = useCallback((option) => {
    if (typeof option === "string") return option;
    return option?.fullAddress || option?.label || "";
  }, []);

  const isOptionEqualToValue = useCallback(
    (option, val) => option.id === val?.id,
    []
  );

  const renderOption = useCallback(
    (props, option) => (
      <li {...props} key={option.id}>
        <Typography variant="body2">{option.fullAddress}</Typography>
        <Divider />
      </li>
    ),
    []
  );

  const noOptionsText = useMemo(() => {
    if (loading) return "Loading...";
    if (!hasFocus) return "";
    if (inputValue.length < 2) return "";
    return "No locations found";
  }, [loading, inputValue, hasFocus]);

  if (!isLoaded) return <Skeleton animation="wave" height={40} />;

  if (loadError) {
    return (
      <Typography variant="subtitle2" color="error">
        Currently we are facing some issues with Google Maps.
      </Typography>
    );
  }

  return (
    <MUIAutocomplete
      value={value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleSelect}
      options={options}
      loading={loading}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      renderOption={renderOption}
      noOptionsText={noOptionsText}
      filterOptions={(x) => x}
      freeSolo={false}
      selectOnFocus
      clearOnBlur={false}
      handleHomeEndKeys
      fullWidth
      forcePopupIcon={false}
      disableClearable
      renderInput={(params) => (
        <TextField
          {...params}
          {...rest}
          type="text"
          placeholder="Search any address"
          name={name}
          onBlur={handleInputBlur}
          onFocus={handleFocus}
          autoComplete="new-password"
          sx={{
            ...sx,
            "& .MuiAutocomplete-endAdornment": {
              display: loading ? "flex" : "none",
            },
            "& .MuiAutocomplete-popupIndicator": { display: "none" },
            "& .MuiAutocomplete-clearIndicator": { display: "none" },
          }}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: <>{loading && <CircularProgress size={18} />}</>,
          }}
        />
      )}
    />
  );
};

GooglePlaceAutocomplete.propTypes = {
  error: PropTypes.bool,
  helperText: PropTypes.string,
  name: PropTypes.string,
  name2: PropTypes.string,
  values: PropTypes.any,
  setFieldValue: PropTypes.func,
  handleBlur: PropTypes.func,
  handleChange: PropTypes.func,
  onChange: PropTypes.func,
  sx: PropTypes.object,
};

export default GooglePlaceAutocomplete;
