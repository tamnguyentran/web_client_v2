import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Chip, Dialog, TextField, Button, Card, CardHeader, CardContent, CardActions } from '@material-ui/core'
import { useHotkeys } from 'react-hotkeys-hook'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions'
import sendRequest from '../../../utils/service/sendReq'
import AddIcon from '@material-ui/icons/Add'
import LoopIcon from '@material-ui/icons/Loop'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import SaveIcon from '@material-ui/icons/Save'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.INS_UNIT,
        biz: 'common',
        object: 'units',
    },
}

const UnitAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [note, setNote] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)
    const inputRef = useRef(null)

    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys(
        'f4',
        () => {
            handleCreate()
            saveContinue.current = true
        },
        { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] }
    )
    useHotkeys(
        'esc',
        () => {
            setShouldOpenModal(false)
            setName('')
            setNote('')
        },
        { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] }
    )

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const handleCreate = () => {
        if (!name || !name.trim()) return
        setProcess(true)
        const inputParam = [name, note]
        setControlTimeOutKey(serviceInfo.CREATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.CREATE, inputParam, handleResultAddUnit, true, handleTimeOut)
    }

    const handleResultAddUnit = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcess(false)
        setControlTimeOutKey(null)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
            setTimeout(() => {
                if (step1Ref.current) step1Ref.current.focus()
            }, 100)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            setName('')
            setNote('')
            onRefresh()
            if (saveContinue.current) {
                saveContinue.current = false
                setTimeout(() => {
                    if (step1Ref.current) step1Ref.current.focus()
                }, 100)
            } else {
                setShouldOpenModal(false)
            }
        }
    }

    const checkValidate = () => {
        if (!!name.trim()) {
            return false
        }
        return true
    }

    const handleChangeName = (e) => {
        setName(e.target.value)
    }

    const handleChangeNote = (e) => {
        setNote(e.target.value)
    }

    return (
        <>
            <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                    // resetForm()
                    setShouldOpenModal(true)
                }}
                style={{ color: 'var(--white)', border: '1px solid white', maxHeight: 22 }}
            >
                {t('btn.add')} (F2)
            </Button>
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
                    <CardHeader title={t('config.unit.titleAdd')} />
                    <CardContent>
                        <TextField
                            fullWidth={true}
                            required
                            autoFocus
                            autoComplete="off"
                            margin="dense"
                            label={t('config.unit.name')}
                            onChange={handleChangeName}
                            value={name}
                            variant="outlined"
                            className="uppercaseInput"
                            inputRef={step1Ref}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    step2Ref.current.focus()
                                }
                            }}
                        />

                        <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline
                            rows={2}
                            autoComplete="off"
                            label={t('config.unit.note')}
                            onChange={handleChangeNote}
                            value={note || ''}
                            variant="outlined"
                            inputRef={step2Ref}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    handleCreate()
                                }
                            }}
                        />
                    </CardContent>
                    <CardActions className="align-items-end" style={{ justifyContent: 'flex-end' }}>
                        <Button
                            size="small"
                            onClick={(e) => {
                                if (process) {
                                    return
                                }
                                setShouldOpenModal(false)
                                setNote('')
                                setName('')
                            }}
                            startIcon={<ExitToAppIcon />}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')} (Esc)
                        </Button>
                        <Button
                            size="small"
                            onClick={() => {
                                handleCreate()
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={
                                checkValidate() === false
                                    ? process
                                        ? 'button-loading bg-success text-white'
                                        : 'bg-success text-white'
                                    : ''
                            }
                            startIcon={process ? <LoopIcon /> : <SaveIcon />}
                        >
                            {t('btn.save')} (F3)
                        </Button>
                        <Button
                            size="small"
                            onClick={() => {
                                saveContinue.current = true
                                handleCreate()
                            }}
                            variant="contained"
                            disabled={checkValidate()}
                            className={
                                checkValidate() === false
                                    ? process
                                        ? 'button-loading bg-success text-white'
                                        : 'bg-success text-white'
                                    : ''
                            }
                            startIcon={process ? <LoopIcon /> : <SaveIcon />}
                        >
                            {t('config.save_continue')}
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default UnitAdd
