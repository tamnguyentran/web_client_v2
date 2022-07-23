import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
} from "@material-ui/core";
import { useHotkeys } from "react-hotkeys-hook";

import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import reqFunction from "../../../utils/constan/functions";
import sendRequest from "../../../utils/service/sendReq";
import LoopIcon from "@material-ui/icons/Loop";
import { TextFieldCpn, TextAreaCpn } from "../../../basicComponents";
import { ReactComponent as IC_VECTOR } from "../../../asset/images/vector.svg";
import { ReactComponent as IC_ADD } from "../../../asset/images/add.svg";
import { ButtonCpn } from "../../../basicComponents";

const serviceInfo = {
  UPDATE: {
    functionName: "update",
    reqFunct: reqFunction.MOD_UNIT,
    biz: "common",
    object: "units",
  },
  GET_UNIT_BY_ID: {
    functionName: "get_by_id",
    reqFunct: reqFunction.GET_UNIT,
    biz: "common",
    object: "units",
  },
};

const UnitEdit = ({ id, onRefresh, shouldOpenModal, setShouldOpenModal }) => {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [process, setProcess] = useState(false);

  //   const [controlTimeOutKey, setControlTimeOutKey] = useState(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);

  useHotkeys("f3", () => handleUpdate(), {
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });
  useHotkeys(
    "esc",
    () => {
      setShouldOpenModal(false);
      setName("");
      setNote("");
    },
    { enableOnTags: ["INPUT", "SELECT", "TEXTAREA"] }
  );

  useEffect(() => {
    if (shouldOpenModal && id && id !== 0) {
      sendRequest(
        serviceInfo.GET_UNIT_BY_ID,
        [id],
        handleResultGetByID,
        true,
        handleTimeOut
      );
    }
  }, [shouldOpenModal]);

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
    setProcess(false);
    // setControlTimeOutKey(null);
  };

  const handleResultGetByID = (reqInfoMap, message) => {
    setProcess(false);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];
      setName(newData.rows[0].o_2);
      setNote(newData.rows[0].o_3);
    }
  };

  const handleUpdate = () => {
    if (!id || id === 0 || !name || !name.trim()) return;
    setProcess(true);
    const inputParam = [id, name, note];
    sendRequest(
      serviceInfo.UPDATE,
      inputParam,
      handleResultUpdate,
      true,
      handleTimeOut
    );
  };

  const handleResultUpdate = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    setProcess(false);
    // setControlTimeOutKey(null);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
      setTimeout(() => {
        if (step1Ref.current) step1Ref.current.focus();
      }, 100);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      setName("");
      setNote("");
      setShouldOpenModal(false);
      onRefresh();
    }
  };

  const checkValidate = () => {
    if (!!name.trim()) {
      return false;
    }
    return true;
  };

  const handleChangeName = (e) => {
    setName(e.target.value);
  };

  const handleChangeNote = (e) => {
    setNote(e.target.value);
  };

  return (
    <Dialog
      fullWidth={true}
      maxWidth="sm"
      open={shouldOpenModal}
      // onClose={e => {
      //     setShouldOpenModal(false)
      //     setNote('')
      //     setName('')
      // }}
    >
      <Card>
        <CardHeader
          className="card-header"
          title={t(
            id === 0 ? "config.unit.titleAdd" : "config.unit.titleEdit",
            { name: name }
          )}
        />
        <CardContent>
          <TextFieldCpn
            autoFocus={true}
            value={name}
            label="Tên đơn vị (*)"
            inputRef={step1Ref}
            classNameInput="text-uppercase"
            onChange={handleChangeName}
            onKeyPress={(event) => {
              if (event.key === "Enter" && step2Ref.current) {
                step2Ref.current.focus();
              }
            }}
          />

          <TextAreaCpn
            value={note || ""}
            onChange={handleChangeNote}
            className="w-100 mt-2"
            label="Ghi chú"
            inputRef={step2Ref}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                handleUpdate();
              }
            }}
          />
        </CardContent>
        <CardActions className="align-items-end justify-content-end">
          <ButtonCpn.ButtonClose
            process={process}
            onClick={() => {
              if (process) return;
              setShouldOpenModal(false);
              setNote("");
              setName("");
            }}
          />
          <ButtonCpn.ButtonUpdate
            onClick={handleUpdate}
            process={process}
            disabled={checkValidate()}
          />
        </CardActions>
      </Card>
    </Dialog>
  );
};

export default UnitEdit;
