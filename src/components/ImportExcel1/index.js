import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import {
  Button,
  Dialog,
  Card,
  CardHeader,
  CardContent,
  Grid,
} from "@material-ui/core";
import PublishIcon from "@material-ui/icons/Publish";

import { ReactComponent as IC_DOCUMENT_FOLDER } from "../../asset/images/document-folder.svg";
import { ReactComponent as IC_DOCUMENT_DOWNLOAD_EXAMPLE } from "../../asset/images/document-download-example.svg";

export default function ImportExcel1() {
  const { t } = useTranslation();
  const [shouldOpenModalEdit, setShouldOpenModalEdit] = useState(false);
  const [fileSelected, setFileSelected] = useState("");

  useEffect(() => {
    if (fileSelected) {
      ExcelRenderer(fileSelected, (err, resp) => {
        if (err) {
          console.log(err);
        } else {
          console.log(resp);
        }
      });
    }
  }, [fileSelected]);
  const handleShowModal = () => {
    setShouldOpenModalEdit(true);
  };

  const handleImportChange = (e) => {
    const { files } = e.target;
    if (files.length === 1) {
      console.log(files[0])
      setFileSelected(files[0]);
    }
  };
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<PublishIcon />}
        onClick={handleShowModal}
        style={{
          color: "var(--white)",
          border: "1px solid white",
          maxHeight: 22,
        }}
      >
        {t("product.import_excel")}
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={shouldOpenModalEdit}
        onClose={() => {
          setShouldOpenModalEdit(false);
        }}
      >
        <Card className="product-card">
          <CardHeader title={t("product.titleEdit")} />
          <CardContent>
            <Grid container spacing={1}>
              <input
                style={{ display: "none" }}
                id="container-upload-file"
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleImportChange}
              />
              <label htmlFor="container-upload-file" style={{ width: "100%" }}>
                <div
                  title={t("choose_file")}
                  style={{
                    borderRadius: 5,
                    backgroundColor: "rgb(225 227 228 / 57%)",
                    padding: "2px 10px",
                  }}
                >
                  <IC_DOCUMENT_FOLDER />{" "}
                  {fileSelected !== "" ? `(${fileSelected.name})` : t("choose_file")}
                </div>
              </label>
            </Grid>
          </CardContent>
        </Card>
      </Dialog>
    </>
  );
}
