import React from "react";
import { Button } from "@material-ui/core";

export default function ButtonCpn(props) {
  const { size = "small", className, label = "" } = props;
  return (
    <Button
      size={size}
      className={`bg-success text-white ${className}`}
      variant="contained"
    >
      {label}
    </Button>
  );
}
