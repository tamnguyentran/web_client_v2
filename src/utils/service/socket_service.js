import * as io from "socket.io-client";
import * as CryptoJS from "crypto-js";
import glb_sv from "./global_service";
import control_sv from "./control_services";
import { Subject } from "rxjs";
class socketService {
  constructor() {
    // -- event to receive respone after client request a service --
    this.url = "http://171.244.133.198"; // -- dev
    this.socket = {};
    this.connectFlag = false;
    this.clientSeq = 1;
    this.key_SendAuthenInfo = "REAUTH_INFO"; // -- for client send old token right after re connect
    // this.key_RcvAuthenInfo = "AUTH_RESULTINFO"; // -- for client receive new token
    this.key_RcvAuthenInfo = "REAUTH_RESULT";
    this.key_NotifyRcv = "SEVER_NOTIFY"; // -- for client receive notify info (on)
    this.key_ClientReq = "CLIENT_REQUEST"; // -- for client send request to call a service (emit)
    this.key_ClientReqRcv = "SEVER_RESULTRQ"; // -- for client receive reponse from a service (on)
    this.event_NotifyRcv = new Subject();
    this.event_ClientReqRcv = new Subject();
    this.event_ChatMsg = new Subject();

    this.socket_StartListener = () => {
      // -- Define listener event
      this.socket.on(this.key_ClientReqRcv, (data) => {
        this.event_ClientReqRcv.next(data);
        const mssg = typeof data === "string" ? JSON.parse(data) : data;
        if (!mssg["REQUEST_SEQ"] || isNaN(mssg["REQUEST_SEQ"])) return;
        const cltSeqResult = Number(mssg["REQUEST_SEQ"]);
        const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult);
        if (!reqInfoMap) {
          console.log("RES_MSG timeout", mssg);
          return;
        }
        if (reqInfoMap.receiveFunct) reqInfoMap.receiveFunct(reqInfoMap, mssg);
        // Clear timeOut
        control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey);
      });
      this.socket.on(this.key_NotifyRcv, (data) => {
        this.event_NotifyRcv.next(data);
      });

      this.socket.on(this.key_RcvAuthenInfo, (data) => {
        console.log("data", data);
        const dataUserInfo = sessionStorage.getItem("userInfo");
        console.log("data", dataUserInfo);
        console.log(
          "!data.resultFlag-",
          !data.resultFlag,
          data["PROC_STATUS"] !== 1
        );
        if (data["PROC_STATUS"] !== 1) {
          // -- Inform to user reauthen fail -> Need to relogin
          glb_sv.authFlag = false;
          sessionStorage.removeItem("0101X10");
          sessionStorage.removeItem("0101X11");
        } else {
          //--------------------------------
          console.log("vào đât", dataUserInfo);
          //--------------------------------------
          // store token if server accept connection
          if (dataUserInfo) {
            console.log("vddb");
            try {
              console.log("Nhảy vào này");
              let data = JSON.parse(dataUserInfo);
              console.log("data-", data);

              glb_sv.authFlag = true;
              glb_sv.userId = data.userId;
              glb_sv.pharId = data.pharId;
              glb_sv.branchId = data.branchId;
              glb_sv.pharNm = data.branch_nm;
              glb_sv.pharAddr = data.pharAddr;
              glb_sv.branch_nm = data.branch_nm;
              glb_sv.branch_add = data.branch_add;
              glb_sv.branch_phone = data.branch_phone;
              glb_sv.logo_nm = data.logo_nm;
              glb_sv.userEmail = data.userEmail;
              glb_sv.pharTele = data.pharTele;
              glb_sv.userNm = data.userNm;
              glb_sv.userLev = data.userLev;
              glb_sv.userSt = data.userSt;

              const secrInfo = CryptoJS.AES.encrypt(
                data.resultData[0]["tk"],
                glb_sv.configInfo["0101X10"]
              ).toString();

              sessionStorage.setItem("0101X11", secrInfo);
            } catch (error) {
              console.log("vbdhvdbvdh");
              glb_sv.authFlag = false;
              sessionStorage.removeItem("0101X10");
              sessionStorage.removeItem("0101X11");
            }
          }
        }
      });
      this.socket.on("connect_timeout", (data) => {
        this.connectFlag = false;
      });
      this.socket.on("connect_error", (data) => {
        glb_sv.logMessage("connect_error => Time: " + Date());
        this.connectFlag = false;
      });
      this.socket.on("disconnect", (data) => {
        glb_sv.logMessage("disconnect => Time: " + Date());
        this.connectFlag = false;
      });
    };

    this.sendReAuToken = () => {
      const secrInfo = sessionStorage.getItem("0101X11");
      console.log("secrInfo-", secrInfo);
      if (
        secrInfo != null &&
        secrInfo !== undefined &&
        secrInfo.trim() !== ""
      ) {
        const bytes = CryptoJS.AES.decrypt(
          secrInfo,
          glb_sv.configInfo["0101X10"]
        );
        const msgDcode = bytes.toString(CryptoJS.enc.Utf8);
        console.log("abc");
        if (msgDcode) {
          console.log("bcd");
          this.sendMsg(this.key_SendAuthenInfo, msgDcode);
        }
      }
    };

    this.getSocketStat = () => {
      return this.connectFlag;
    };

    this.getClientSeq = () => {
      return this.clientSeq++;
    };

    this.sendLogoutMsg = () => {
      const secrInfo = localStorage.getItem("0101X11");
      if (
        secrInfo != null &&
        secrInfo !== undefined &&
        secrInfo.trim() !== ""
      ) {
        const bytes = CryptoJS.AES.decrypt(
          secrInfo,
          glb_sv.configInfo["0101X10"]
        );
        const msgDcode = bytes.toString(CryptoJS.enc.Utf8);
        if (msgDcode) {
          this.sendMsg("logout", msgDcode);
        }
      }
    };

    this.sendMsg = (keyMsg, message) => {
      console.log("socket send", JSON.stringify(message));
      let newMsg = "";
      if (typeof message !== "string") {
        try {
          newMsg = JSON.stringify(message);
        } catch (err) {
          glb_sv.logMessage("err at JSON.stringify(message)");
          glb_sv.logMessage(JSON.stringify(message));
          return;
        }
      } else {
        newMsg = message;
      }
      if (keyMsg !== this.key_SendAuthenInfo) {
        if (!glb_sv.developeFlag) {
          // -- Script message --------
          newMsg = CryptoJS.AES.encrypt(
            newMsg,
            glb_sv.configInfo["0101X10"]
          ).toString();
        }
      }
      this.socket.emit(keyMsg, newMsg);
    };

    this.setNewConnection = () => {
      glb_sv.logMessage("setNewConnection");
      if (glb_sv.sslMode) {
        this.socket = io(this.url, { secure: true });
      } else {
        this.socket = io(this.url);
      }
      // if (glb_sv.sslMode) {
      //   this.socket = io(this.url, { secure: true, path: "/new_core" });
      // } else {
      //   this.socket = io(this.url, { path: "/new_core" });
      // }
      // -- sen token --
      this.socket.on("connect", (data) => {
        glb_sv.logMessage("connect at Time: " + Date());
        glb_sv.logMessage("transport: " + this.socket.io.engine.transport.name);
        this.connectFlag = true;
        // -- checking if login already -> need send requesting to re-authentication
        const auInfo = sessionStorage.getItem("0101X10");
        if (auInfo != null && auInfo !== undefined && auInfo.trim() !== "") {
          const bytes = CryptoJS.AES.decrypt(
            auInfo,
            glb_sv.configInfo["0101X10"]
          );
          // convert to original string
          const msgDcode = bytes.toString(CryptoJS.enc.Utf8);
          try {
            const objAuthen = JSON.parse(msgDcode);
            if (objAuthen && objAuthen["auFlag"]) {
              glb_sv.authFlag = true;
              this.sendReAuToken();
            }
          } catch (error) {
            glb_sv.authFlag = false;
          }
        } else {
          glb_sv.authFlag = false;
        }
      });
      // -- start listener ngoài event connect để tránh trường hợp double (thậm chí tripble..) receive event emit từ server nếu re connect nhiều lần
      this.socket_StartListener();
    };

    this.showTransTp = () => {
      glb_sv.logMessage("Connection status: " + this.socket.connected);
      glb_sv.logMessage(this.socket.io.engine.transport.name);
    };

    this.disConnect = () => {
      return () => {
        this.socket.disconnect();
      };
    };
  }
}

const theInstance = new socketService();
export default theInstance;
