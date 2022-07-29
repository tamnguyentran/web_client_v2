import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Dialog,
  Button,
} from "@material-ui/core";
import { ButtonCpn } from "../../../basicComponents";
import { useTranslation } from "react-i18next";

const PriceRemove = (props) => {
  const { t } = useTranslation();
  const {
    name = "",
    shouldOpenRemoveModal,
    setShouldOpenRemoveModal,
    processing = false,
    handleDelete,
  } = props;
  return (
    <Dialog
      maxWidth="xs"
      fullWidth={true}
      TransitionProps={{
        addEndListener: (node, done) => {
          // use the css transitionend event to mark the finish of a transition
          node.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
              handleDelete();
            }
          });
        },
      }}
      open={shouldOpenRemoveModal}
      onClose={(e) => {
        setShouldOpenRemoveModal(false);
      }}
    >
      <Card>
        <CardHeader
          className="card-header"
          title={t("Xác nhận xóa bảng báo giá ?")}
        />
        <CardContent>{name}</CardContent>
        <CardActions className="align-items-end justify-content-end">
          <ButtonCpn.ButtonClose
            process={processing}
            onClick={() => {
              setShouldOpenRemoveModal(false);
            }}
          />
          <ButtonCpn.ButtonDelete
            onClick={handleDelete}
            disabled={processing}
            process={processing}
          />
          {/* <Button
            size="small"
            onClick={(e) => {
              if (processing) return;
              setShouldOpenRemoveModal(false);
            }}
            startIcon={<ExitToAppIcon />}
            variant="contained"
            disableElevation
          >
            {t("btn.close")} (Esc)
          </Button>
          <Button
            className={processing ? "button-loading" : ""}
            endIcon={processing && <LoopIcon />}
            size="small"
            onClick={handleDelete}
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon />}
          >
            {t("btn.delete")} (f10)
          </Button> */}
        </CardActions>
      </Card>
    </Dialog>
  );
};

export default PriceRemove;
