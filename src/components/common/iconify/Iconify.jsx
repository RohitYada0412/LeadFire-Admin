import { forwardRef } from "react";

import PropTypes from "prop-types";

import { Box } from "@mui/material";

import { Icon } from "@iconify/react";

const Iconify = forwardRef(function Iconify(
  { icon, width = 20, height, sx, ...other },
  ref
) {
  return (
    <Box
      ref={ref}
      component={Icon}
      icon={icon}
      sx={{ width, height: height ? height : width, ...sx }}
      {...other}
      className="cursor-pointer"
    />
  );
});

Iconify.displayName = "Iconify";

Iconify.propTypes = {
  sx: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default Iconify;
