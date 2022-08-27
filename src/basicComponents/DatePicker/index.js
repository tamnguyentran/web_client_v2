import React from "react";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import moment from "moment";
import DateFnsUtils from "@date-io/date-fns";
import glb_sv from "../../utils/service/global_service";

export default function DatePicker(props) {
  const {
    label = "",
    value = glb_sv.startDay,
    onChange = () => {},
    onKeyPress = () => {},
    format = "dd/MM/yyyy",
    className = "",
    disabled = false
  } = props;
  return (
    <div className={`date-picker-cpn ${className}`}>
      <div className="text-label-input">{label}</div>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          className="custom-input"
          disableToolbar
          margin="dense"
          variant="outlined"
          style={{ width: "100%", marginTop: "0px" }}
          inputVariant="outlined"
          format={format}
          id="order_dt-picker-inline"
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
          disabled={disabled}
        />
      </MuiPickersUtilsProvider>
    </div>
  );
}
