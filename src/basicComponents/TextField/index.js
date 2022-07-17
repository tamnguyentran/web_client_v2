import React from "react";
import {
  TextField,
  InputLabel,
  FormControl,
  InputBase,
} from "@material-ui/core";
import { alpha, styled } from "@material-ui/core/styles";
import "./style.css";
export default function TextFieldCpn(props) {
  const {
    label = "",
    onChange = () => {},
    className = "",
    placeholder = "",
  } = props;
  const BootstrapInput = styled(InputBase)(({ theme }) => ({
    "label + &": {
      marginTop: theme.spacing(2.5),
    },
    "&.MuiFormControl-root": { width: "100%" },
    "& .MuiInputBase-input": {
      borderRadius: 4,
      position: "relative",
      border: "1px solid var(--gray4)",
      fontSize: 14,
      width: "100%",
      padding: "7px 12px",
      transition: theme.transitions.create([
        "border-color",
        "background-color",
        "box-shadow",
      ]),
      // "&:focus": {
      //   boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      //   borderColor: theme.palette.primary.main,
      // },
    },
  }));

  return (
    <FormControl variant="standard" className={`w-100 ${className}`}>
      <div className="text-label-input">{label}</div>
      <BootstrapInput placeholder={placeholder || label} onChange={onChange} />
    </FormControl>
  );
}
