import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Tooltip,
  TextField,
  Grid,
  Button,
  Dialog,
  Divider,
  Avatar,
  makeStyles,
  ImageListItem,
} from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import ProductGroup_Autocomplete from "../ProductGroup/Control/ProductGroup.Autocomplete";
import UnitAdd_Autocomplete from "../../Config/Unit/Control/UnitAdd.Autocomplete";
import sendRequest from "../../../utils/service/sendReq";
import SnackBarService from "../../../utils/service/snackbar_service";
import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import { config, productDefaulModal } from "./Modal/Product.modal";
import { useHotkeys } from "react-hotkeys-hook";

import LoopIcon from "@material-ui/icons/Loop";

const serviceInfo = {
  GET_PRODUCT_BY_ID: {
    functionName: config["byId"].functionName,
    reqFunct: config["byId"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
  UPDATE: {
    functionName: config["update"].functionName,
    reqFunct: config["update"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
};
console.log(serviceInfo.UPDATE);
const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  button: {
    margin: 10,
  },
  input: {
    display: "none",
  },
  large: {
    width: theme.spacing(8),
    height: theme.spacing(8),
  },
}));
const ProductEdit = ({
  id,
  shouldOpenModal,
  setShouldOpenModal,
  onRefresh,
}) => {
  const classes = useStyles();
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const { t } = useTranslation();

  const [product, setProduct] = useState({});
  const [process, setProcess] = useState(false);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const step5Ref = useRef(null);
  const step6Ref = useRef(null);
  const step7Ref = useRef(null);
  const step8Ref = useRef(null);
  const step9Ref = useRef(null);
  const step10Ref = useRef(null);
  const step11Ref = useRef(null);
  const step12Ref = useRef(null);
  const step13Ref = useRef(null);
  const step14Ref = useRef(null);

  const ImageObjRef = useRef({});

  useHotkeys(
    "f3",
    () => {
      if (process) return;
      handleUpdate();
    },
    { enableOnTags: ["INPUT", "SELECT", "TEXTAREA"] }
  );
  useHotkeys(
    "esc",
    () => {
      if (process) return;
      setShouldOpenModal(false);
      setProduct(productDefaulModal);
    },
    { enableOnTags: ["INPUT", "SELECT", "TEXTAREA"] }
  );

  useEffect(() => {
    if (shouldOpenModal && id && id !== 0) {
      sendRequest(
        serviceInfo.GET_PRODUCT_BY_ID,
        [id],
        handleResultGetProductByID,
        true,
        handleTimeOut
      );
    }
  }, [shouldOpenModal]);

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
    setProcess(false);
  };

  const handleResultGetProductByID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      let newConvertData = {
        o_1: newData.rows[0].o_1, // id
        o_2: newData.rows[0].o_2, // group id
        o_3: newData.rows[0].o_5, // name
        o_4: newData.rows[0].o_6, // barcode
        o_5: newData.rows[0].o_17, // unit id
        o_6: newData.rows[0].o_7, // contents
        o_7: newData.rows[0].o_8, // contraid
        o_8: newData.rows[0].o_9, // designate
        o_9: newData.rows[0].o_10, // dosage
        o_10: newData.rows[0].o_11, // interact
        o_11: newData.rows[0].o_12, // manufact
        o_12: newData.rows[0].o_13, // effect
        o_13: newData.rows[0].o_14, // overdose
        o_14: newData.rows[0].o_16, // storages
        o_15: newData.rows[0].o_15, // packing
        o_16: newData.rows[0].o_4, // code
        o_17: newData.rows[0].o_18, // unit name
      };
      console.log(newData);
      setProduct(newConvertData);
      setTimeout(() => {
        if (step1Ref.current) step1Ref.current.focus();
      }, 100);
    }
  };

  const handleResultUpdate = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    setProcess(false);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
      setTimeout(() => {
        if (step1Ref.current) step1Ref.current.focus();
      }, 100);
    } else if (message["PROC_DATA"]) {
      console.log(productDefaulModal);
      setProduct(productDefaulModal);
      setShouldOpenModal(false);
      onRefresh();
    }
  };

  const handleUpdate = async () => {
    //console.log(await saveImageIntoServer());
    let result = {}
    try {
      result =  await saveImageIntoServer()   
      result['success'] = true
     console.log(result)
    } catch (error) {
      console.log(error)
      result['success'] = false
    }
    console.log(result)
    if (process) return;
    if (checkValidate()) return;
    setProcess(true);
    let inputParam = Object.keys(product).map((key) => product[key]);
    inputParam.splice(-2); // xóa mã sp + tên units
    inputParam = result.success ?  inputParam.concat(`${result.data.image_nm}`) : inputParam.concat(" ");
    console.log(inputParam);
    sendRequest(
      serviceInfo.UPDATE,
      inputParam,
      handleResultUpdate,
      true,
      handleTimeOut
    );
  };

  const checkValidate = () => {
    if (
      product?.o_3?.trim().length > 0 &&
      !!product?.o_2 &&
      !!product?.o_5 &&
      !!product?.o_1
    ) {
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const newProduct = { ...product };
    newProduct[e.target.name] = e.target.value;
    setProduct(newProduct);
  };

  const handleSelectProductGroup = (obj) => {
    const newProduct = { ...product };
    newProduct["o_2"] = !!obj ? obj?.o_1 : null;
    setProduct(newProduct);
  };

  const handleSelectUnit = (obj) => {
    const newProduct = { ...product };
    newProduct["o_5"] = !!obj ? obj?.o_1 : null;
    setProduct(newProduct);
  };

  const handleChangeImage = (e) => {
    console.log(e.target.files[0]);
    setLoadingUpload(true);
    let url;
    try {
      url = URL.createObjectURL(e.target.files[0]);
    } catch (err) {
      throw err;
    }
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file === undefined) return;
    if (file && file.type !== "image/jpeg" && file.type !== "image/png") {
      // 'Hình ảnh chỉ được hỗ trợ đuôi png hoặc jpeg!'
      return;
    }
    if (file.size > 5242880) {
      glb_sv.showAlert({
        title: t("common_notify"),
        content: t("err_upload_file"),
        type: "warn",
      });
      return;
    }
    let image_data;
    reader.onload = readSuccess;
    function readSuccess(evt) {
      image_data = evt.target.result;
      ImageObjRef.current.image_data = image_data;
    }

    reader.readAsBinaryString(file);

    setImageUrl(url); //-- set url cho image hiện tại shown hình sản phẩm lên
    ImageObjRef.current = {
      ...ImageObjRef.current,
      size: file.size,
      imgType: file.type.slice(6),
    };

    console.log(ImageObjRef.current);

    if (ImageObjRef.current.image_data) {
      console.log("Có data");
    }
  };

  const saveImageIntoServer = async () => {
    const requestOptions = {
      host: "http://171.244.133.198/prod/upload_img",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ImageObjRef.current),
    };
      let result = await fetch(
        `${"http://171.244.133.198/prod/upload_img"}`,
        requestOptions
      )
      return result.json();
    // } catch (error) {
    //   console.log(error)
    // }
    // .then((res) => {
    //   console.log("Res", res.json());
    //   return res.json();
    // })
    // .then((data) => {
    //   //setLoadingUpload(false);
    //   console.log("Data", data);
    //   return data;

    //   // if (process) return;
    //   // if (checkValidate()) return;
    //   // setProcess(true);
    //   // let inputParam = Object.keys(product).map((key) => product[key]);
    //   // inputParam.splice(-2); // xóa mã sp + tên units
    //   // inputParam = inputParam.concat(`http://171.244.133.198:5555/upload/product/${}`);
    //   // console.log(inputParam.length);
    //   // sendRequest(
    //   //   serviceInfo.UPDATE,
    //   //   inputParam,
    //   //   handleResultUpdate,
    //   //   true,
    //   //   handleTimeOut
    //   // );
    // })
    // .catch((err) => setLoadingUpload(false));
  };

  console.log(imageUrl);
  return (
    <Dialog
      fullWidth={true}
      maxWidth="md"
      open={shouldOpenModal}
      // onClose={(e) => {
      //     setShouldOpenModal(false)
      //     setProduct(productDefaulModal)
      // }}
    >
      <Card>
        <CardHeader title={t("product.titleEdit", { name: product.o_3 })} />
        <CardContent>
          <Grid container spacing={1}>
            {/* <Grid item xs={6} sm={3}>
                            <Tooltip placement="top" title={t('product.tooltip.productCode')} arrow>
                                <TextField
                                    fullWidth={true}
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('product.code')}
                                    value={product.o_16}
                                    name="o_16"
                                    disabled={true}
                                    variant="outlined"
                                    className="uppercaseInput"
                                />
                            </Tooltip>
                        </Grid> */}

            <Grid item xs={6} sm={3} md={3}>
              <TextField
                fullWidth={true}
                required
                autoFocus
                autoComplete="off"
                margin="dense"
                label={t("product.name")}
                onChange={handleChange}
                value={product.o_3}
                name="o_3"
                variant="outlined"
                className="uppercaseInput"
                inputRef={step1Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step2Ref.current.focus();
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
              <ProductGroup_Autocomplete
                productGroupID={product.o_2}
                style={{ marginTop: 8, marginBottom: 4 }}
                size={"small"}
                required={true}
                label={t("menu.productGroup")}
                onSelect={handleSelectProductGroup}
                inputRef={step2Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step3Ref.current.focus();
                  }
                }}
              />
            </Grid>
            <Grid
              item
              xs={6}
              sm={3}
              md={3}
              className="d-flex align-items-center"
            >
              <UnitAdd_Autocomplete
                value={product.o_17}
                style={{ marginTop: 8, marginBottom: 4 }}
                size={"small"}
                required={true}
                label={t("menu.configUnit")}
                onSelect={handleSelectUnit}
                onCreate={(id) => setProduct({ ...product, ...{ o_5: id } })}
                inputRef={step3Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step4Ref.current.focus();
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
              <Tooltip
                placement="top"
                title={t("product.tooltip.barcode")}
                arrow
              >
                <TextField
                  fullWidth={true}
                  autoComplete="off"
                  margin="dense"
                  label={t("product.barcode")}
                  onChange={handleChange}
                  value={product.o_4}
                  name="o_4"
                  variant="outlined"
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      handleUpdate();
                    }
                  }}
                  inputRef={step4Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step6Ref.current.focus();
                    }
                  }}
                />
              </Tooltip>
            </Grid>
          </Grid>
          <Divider orientation="horizontal" />
          <Grid container spacing={1}>
            <Grid item xs={6} sm={4} md={4}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("product.content")}
                onChange={handleChange}
                value={product.o_6}
                name="o_6"
                variant="outlined"
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleUpdate();
                  }
                }}
                inputRef={step6Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    setTimeout(() => {
                      step7Ref.current.focus();
                    }, 10);
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={4}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("product.designate")}
                onChange={handleChange}
                value={product.o_8}
                name="o_8"
                variant="outlined"
                inputRef={step7Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step8Ref.current.focus();
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={4}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("product.contraind")}
                onChange={handleChange}
                value={product.o_7}
                name="o_7"
                variant="outlined"
                inputRef={step8Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step5Ref.current.focus();
                  }
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item xs={6} sm={4} md={4}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("product.packing")}
                onChange={handleChange}
                value={product.o_15}
                name="o_15"
                variant="outlined"
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleUpdate();
                  }
                }}
                inputRef={step5Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step10Ref.current.focus();
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={4}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("product.dosage")}
                onChange={handleChange}
                value={product.o_9}
                name="o_9"
                variant="outlined"
                inputRef={step9Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step10Ref.current.focus();
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={4}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("product.manufact")}
                onChange={handleChange}
                value={product.o_11}
                name="o_11"
                variant="outlined"
                inputRef={step10Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step11Ref.current.focus();
                  }
                }}
              />
            </Grid>
          </Grid>
          <Grid container className="" spacing={1}>
            <Grid item xs={6} sm={3} md={3}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("product.interact")}
                onChange={handleChange}
                value={product.o_10}
                name="o_10"
                variant="outlined"
                inputRef={step11Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step12Ref.current.focus();
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("product.storages")}
                onChange={handleChange}
                value={product.o_14}
                name="o_14"
                variant="outlined"
                inputRef={step12Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step13Ref.current.focus();
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("product.effect")}
                onChange={handleChange}
                value={product.o_12}
                name="o_12"
                variant="outlined"
                inputRef={step13Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step14Ref.current.focus();
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("product.overdose")}
                onChange={handleChange}
                value={product.o_13}
                name="o_13"
                variant="outlined"
                inputRef={step14Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleUpdate();
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
              <div className="flex aligh-item-center mt-1">
                <div>
                  <div>Hình Ảnh</div>
                  <input
                    id="profilePic"
                    type="file"
                    onChange={(e) => {
                      handleChangeImage(e);
                    }}
                  />
                </div>
                <Avatar
                  variant="square"
                  style={{ height: "130px", width: "130px" }}
                  src={imageUrl}
                />
              </div>
              {/* </ImageListItem> */}
              {/* <TextField
                type="file"
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                // label={t("product.overdose")}
                onChange={(e) => {
                  handleChangeImage(e);
                }}
                // value={product.o_13}
                name="o_13"
                variant="outlined"
                // inputRef={step14Ref}
                // onKeyPress={(event) => {
                //   if (event.key === "Enter") {
                //   //  handleUpdate();
                //   }
                // }}
              /> */}
            </Grid>
            <Grid
              item
              xs={6}
              sm={3}
              md={3}
              className={`${imageUrl ? "" : "dl-none"}`}
            >
              {/* <Avatar alt="Logo" src={imageUrl} className={classes.large} /> */}
              {/* <ImageListItem style={{width:'100px', height:'100px'}}>
                <img
                  src={imageUrl}
                  alt={''}
                  loading="lazy"
                />
              </ImageListItem> */}
            </Grid>
          </Grid>
          <Grid container>
            <span className="required_note">(*) {t("required_note")}</span>
          </Grid>
        </CardContent>
        <CardActions
          className="align-items-end"
          style={{ justifyContent: "flex-end" }}
        >
          <Button
            size="small"
            onClick={(e) => {
              if (process) return;
              setShouldOpenModal(false);
              setProduct(productDefaulModal);
              setImageUrl("");
            }}
            variant="contained"
            disableElevation
            startIcon={<ExitToAppIcon />}
          >
            {t("btn.close")} (Esc)
          </Button>
          <Button
            size="small"
            onClick={() => handleUpdate()}
            variant="contained"
            disabled={checkValidate()}
            className={
              checkValidate() === false
                ? process
                  ? "button-loading bg-success text-white"
                  : "bg-success text-white"
                : ""
            }
            startIcon={process ? <LoopIcon /> : <SaveIcon />}
          >
            {t("btn.update")} (F37 )
          </Button>
        </CardActions>
      </Card>
    </Dialog>
  );
};

export default ProductEdit;
