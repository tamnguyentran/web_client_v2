import React,{ useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
} from "@material-ui/core";
import NumberFormat from "react-number-format";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save"
import { useHotkeys } from "react-hotkeys-hook";
const style = {
  borderRadius: "5px",
  position: "absolute",
  top: "35%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 420,
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function BasicModal({
  open,
  setOpen,
  typeSale,
  setTypeSale,
  expPrice,
  setExpPrice,
  handleAddProduce
}) {

  useHotkeys(
    "F3",
    () => {
      if(!open) return 
      setOpen(false)
      handleAddProduce()
    },
    { enableOnTags: ['INPUT','SELECT','TEXTAREA']}
  );

  useHotkeys(
    "ESC",
    () => {
      handleClose()
    },
    { enableOnTags: ['INPUT','SELECT','TEXTAREA']}
  );

  const handleClose = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            style={{ textAlign: "center" }}
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Hãy nhập giá bán
          </Typography>
          <FormControl component="fieldset" className="mt-2">
            <RadioGroup aria-label="gender" name="gender1" value={typeSale}>
              <div className="flex">
                <FormControlLabel
                  onChange={() => setTypeSale("1")}
                  value="1" // '1' Xuất bán
                  control={<Radio color="primary" />}
                  label="Xuất bán"
                />
                <FormControlLabel
                  onChange={() => setTypeSale("2")}
                  value="2" // '2' khuyến mãi
                  control={<Radio color="primary" />}
                  label="Khuyến mãi"
                />
              </div>
            </RadioGroup>
          </FormControl>
          <div className="mt-2">
            <NumberFormat
              className="inputNumber"
              fullWidth
              required
              label={"Giá bán"}
              customInput={TextField}
              autoComplete="off"
              margin="dense"
              autoFocus={true}
              value={expPrice}
              onValueChange={(e) => setExpPrice(Number(e.value))}
              thousandSeparator={true}
              variant="outlined"
              disabled={typeSale === '2'}
            />
          </div>
          <div className="mt-3 flex justify-content-between">
            <Button  startIcon={<SaveIcon />} variant="contained" color="primary" onClick={()=>{
              setOpen(false)
              handleAddProduce()
            }}>
              Đồng ý (F3)
            </Button>
            <Button  startIcon={<ExitToAppIcon />} variant="contained" color="error" onClick={handleClose}>
              Đóng (Esc)
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
