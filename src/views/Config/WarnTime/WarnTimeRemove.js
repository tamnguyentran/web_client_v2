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
          node.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
              handleDelete();
            }
          });
        },
      }}
      open={shouldOpenRemoveModal}
    >
      <Card>
        <CardHeader
          className="card-header"
          title={t("config.warnTime.titleRemove")}
        />
        <CardContent>{name}</CardContent>
        <CardActions
          className="align-items-end justify-content-end"
          style={{ justifyContent: "flex-end" }}
        >
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
        </CardActions>
      </Card>
    </Dialog>
  );
};

export default PriceRemove;
