import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import DeleteIcon from '@material-ui/icons/Delete'
import { Card, CardHeader, CardContent, CardActions, TextField, Button, Dialog, Chip } from '@material-ui/core'

import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import socket_sv from '../../../utils/service/socket_service'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions'
import { requestInfo } from '../../../utils/models/requestInfo'

import AddIcon from '@material-ui/icons/Add'
import LoopIcon from '@material-ui/icons/Loop'

const serviceInfo = {
    CREATE: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_GROUP_ADD,
        biz: 'common',
        object: 'groups',
    },
}

const ProductGroupAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [note, setNote] = useState('')
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)
    const [controlTimeOutKey, setControlTimeOutKey] = useState(null)
    const step1Ref = useRef(null)
    const step2Ref = useRef(null)

    useHotkeys('f2', () => setShouldOpenModal(true), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f3', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys('f4', () => handleCreate(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })
    useHotkeys(
        'esc',
        () => {
            setShouldOpenModal(false)
            setName('')
            setNote('')
        },
        { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] }
    )

    const handleResultCreate = (reqInfoMap, message) => {
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

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcess(false)
        setControlTimeOutKey(null)
    }

    const handleCreate = () => {
        if (!name.trim()) return
        setProcess(true)
        const inputParam = [name.trim(), note || '']
        setControlTimeOutKey(serviceInfo.CREATE.reqFunct + '|' + JSON.stringify(inputParam))
        sendRequest(serviceInfo.CREATE, inputParam, handleResultCreate, true, handleTimeOut)
    }

    const checkValidate = () => {
        if (!!name) {
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
                onClick={() => setShouldOpenModal(true)}
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
                    <CardHeader title={t('productGroup.titleAdd')} />
                    <CardContent>
                        <TextField
                            fullWidth={true}
                            required={true}
                            autoFocus={true}
                            autoComplete="off"
                            margin="dense"
                            label={t('productGroup.name')}
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
                            label={t('productGroup.note')}
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
                                if (controlTimeOutKey && control_sv.ControlTimeOutObj[controlTimeOutKey]) {
                                    return
                                }
                                setShouldOpenModal(false)
                                setName('')
                                setNote('')
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
                            endIcon={process && <LoopIcon />}
                            startIcon={<SaveIcon />}
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
                            endIcon={process && <LoopIcon />}
                            startIcon={<SaveIcon />}
                        >
                            {t('save_continue')} (F4)
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default ProductGroupAdd
