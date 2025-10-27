import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const STATUS_MAP = {
  1: { label: "Active",   color: "success" }, // green
  2: { label: "Inactive", color: "error"   }, // red / danger
  3: { label: "Pending",  color: "warning" }, // amber
};

function Pill({ colorKey, children }) {
  const theme = useTheme();
  const c = theme.palette[colorKey].main;
  return (
    <Box
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 999,
        fontWeight: 700,
        lineHeight: 1.6,
        bgcolor: alpha(c, 0.12),
        color: c,
        textTransform: "capitalize",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </Box>
  );
}

export default function StatusSelect({ value, onChange, ...props }) {
  return (
    <FormControl sx={{ m: 1, minWidth: 140 }}>
      <Select
        value={value}
        size="small"
        // onChange={onChange}
        // make the selected area show the colored pill
        renderValue={(v) => {
          const meta = STATUS_MAP[v] || {};
          return <Pill colorKey={meta.color}>{meta.label}</Pill>;
        }}
        sx={{
          "& .MuiSelect-select": { display: "flex", alignItems: "center", gap: 1, py: 0.5 },
        }}
        {...props}
      >
        {Object.entries(STATUS_MAP).map(([val, meta]) => (
          <MenuItem key={val} value={Number(val)} colorKey={meta.color} >
            {/* <Pill colorKey={meta.color}>{meta.label}</Pill> */}
            {meta.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
