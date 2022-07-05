import glb_sv from './global_service'
import socket_sv from './socket_service'
import control_sv from './control_services'
import { requestInfo } from '../models/requestInfo'
import { inputPrmRq } from '../models/inputPrmRq'

const sendRequest = (
    serviceInfo,
    inputParams,
    handleResultFunc,
    isControlTimeOut = true,
    onTimeout = () => null,
    waitTime
) => {
    console.log('serviceInfo',serviceInfo)
    //- luôn kiểm tra trạng thái socket kết nối tới server trước
    if (!socket_sv.getSocketStat()) {
        onTimeout({ type: 'network', inputParams })
        return
    }
    // Nếu không có thì gọi request
    const clientSeq = socket_sv.getClientSeq()
    const svInputPrm = new inputPrmRq()
    svInputPrm.clientSeq = clientSeq
    svInputPrm.biz = serviceInfo.biz
    svInputPrm.object = serviceInfo.object
    svInputPrm.funct = serviceInfo.functionName
    svInputPrm.input = inputParams
    // -- push request to request hashmap
    const reqInfo = new requestInfo()
    reqInfo.reqFunct = serviceInfo.reqFunct
    reqInfo.inputParam = svInputPrm.input
    reqInfo.timeOutKey = svInputPrm.funct + '|' + clientSeq
    reqInfo.receiveFunct = handleResultFunc
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    socket_sv.sendMsg(socket_sv.key_ClientReq, svInputPrm)
    //-- start function to callback if timeout happened
    if (isControlTimeOut) {
        control_sv.ControlTimeOutObj[reqInfo.timeOutKey] = setTimeout(
            solving_TimeOut,
            waitTime ? waitTime : glb_sv.timeoutNumber,
            reqInfo.timeOutKey,
            reqInfo.inputParam,
            onTimeout,
            clientSeq
        )
    }
}

//-- xử lý khi timeout -> ko nhận được phản hồi từ server
const solving_TimeOut = (timeOutKey, inputParam, onTimeout, clientSeq = 0) => {
    if (clientSeq == null || clientSeq === undefined || isNaN(clientSeq)) {
        return
    }
    const reqIfMap = glb_sv.getReqInfoMapValue(clientSeq)
    if (reqIfMap == null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
        return
    }
    reqIfMap.resTime = new Date()
    reqIfMap.procStat = 4
    glb_sv.setReqInfoMapValue(clientSeq, reqIfMap)
    control_sv.clearTimeOutRequest(timeOutKey)
    // Xử lý time out cho từng màn hình nếu có
    onTimeout({ type: 'noReceiveFeedback', inputParam })
    // Clear luôn handleResultFunc để tránh lỗi khi server gửi response về sau khi đã timeout
    control_sv.clearReqInfoMapRequest(clientSeq)
}

export default sendRequest
