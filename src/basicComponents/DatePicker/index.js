import React from "react";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import moment from "moment";
import DateFnsUtils from "@date-io/date-fns";

export default function DatePicker(props) {
  const {
    label = "",
    value = moment().subtract(1, "month").toString(),
    onChange = () => {},
    onKeyPress = () => {},
    format = "dd/MM/yyyy",
    className = "",
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
        />
      </MuiPickersUtilsProvider>
    </div>
  );
}
