import glb_sv from './global_service'

class ControlService {
    constructor() {
        this.ControlTimeOutObj = {}

        this.clearTimeOutRequest = (timeOutKey) => {
            if (this.ControlTimeOutObj[timeOutKey]) clearTimeout(this.ControlTimeOutObj[timeOutKey])
            delete this.ControlTimeOutObj[timeOutKey]
            return
        }
        this.clearReqInfoMapRequest = (clientSeq) => {
            glb_sv.setReqInfoMapValue(clientSeq, null)
            return
        }
    }
}

const theInstance = new ControlService()
export default theInstance
