import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import { Card, CardHeader, CardContent, CardActions, TextField, Button, Dialog, Tooltip } from '@material-ui/core'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import SaveIcon from '@material-ui/icons/Save'
import LoopIcon from '@material-ui/icons/Loop'
import Autocomplete from '@material-ui/lab/Autocomplete'
import SnackBarService from '../../../../utils/service/snackbar_service'
import sendRequest from '../../../../utils/service/sendReq'
import reqFunction from '../../../../utils/constan/functions'
import glb_sv from '../../../../utils/service/global_service'
import control_sv from '../../../../utils/service/control_services'

const serviceInfo = {
    DROPDOWN_LIST: {
        functionName: 'drop_list',
        reqFunct: reqFunction.UNIT_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list',
    },
    CREATE_UNIT: {
        functionName: 'insert',
        reqFunct: reqFunction.INS_UNIT,
        biz: 'common',
        object: 'units',
    },
}

const UnitAdd_Autocomplete = ({
    onSelect = () => null,
    onKeyPress = () => null,
    inputRef = null,
    label = '',
    style = {},
    size = 'small',
    value = null,
    unitID = null,
    disabled = false,
    autoFocus = false,
    required = false,
}) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')
    const [process, setProcess] = useState(false)
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [unitInfo, setUnitInfo] = useState({
        name: '',
        note: '',
    })
    const idCreated = useRef(-1)

    useEffect(() => {
        const inputParam = ['units', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, handleResultUnitDropDownList, true, handleTimeOut)
    }, [])

    useEffect(() => {
        if (!!unitID && unitID !== 0) {
            let item = dataSource.find((x) => x.o_1 === unitID)
            setValueSelect(item)
            setInputValue(!!item ? item.o_2 : '')
        } else if (value !== null || value !== undefined) {
            let item = dataSource.find((x) => x.o_2 === value)
            setValueSelect(item)
            setInputValue(value)
        } else {
            setValueSelect({})
            setInputValue('')
        }
    }, [unitID, value, dataSource])

    const handleResultUnitDropDownList = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            setDataSource(newData.rows)
            if (newData.rows && newData.rows.length > 0) {
                if (idCreated.current > 0) {
                    const item = newData.rows.find((x) => x.o_1 === idCreated.current)
                    if (item) onChange(null, item, null)
                    idCreated.current = -1
                }
            }
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        setProcess(false)
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const handleChangeInput = (event, value, reson) => {
        setInputValue(value)
    }

    const onChange = (event, object, reson) => {
        setValueSelect(object)
        onSelect(object)
    }

    const checkValidate = () => {
        if (!!unitInfo.name && !!unitInfo.name.trim()) {
            return false
        }
        return true
    }

    const handleChangeUnit = (e) => {
        let newUnit = { ...unitInfo }
        newUnit[e.target.name] = e.target.value
        setUnitInfo(newUnit)
    }

    const handleCreateUnit = () => {
        if (process) return
        setProcess(true)
        sendRequest(
            serviceInfo.CREATE_UNIT,
            [unitInfo.name, unitInfo.note],
            handleResultCreateUnit,
            true,
            handleTimeOut
        )
    }

    const handleResultCreateUnit = (reqInfoMap, message) => {
        setProcess(false)
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let data = message['PROC_DATA']
            if (data.rows && data.rows.length > 0) {
                idCreated.current = data.rows[0].o_1
                // onCreate(data.rows[0].o_1)
            }
            setValueSelect(data.rows[0])
            onSelect(data.rows[0])
            setShouldOpenModal(false)
            // Lấy dữ liệu mới nhất
            const inputParam = ['units', '%']
            sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, handleResultUnitDropDownList, true, handleTimeOut)
        }
    }

    return (
        <>
            <Autocomplete
                disabled={disabled}
                onChange={onChange}
                onKeyPress={onKeyPress}
                onInputChange={handleChangeInput}
                size={size}
                id="combo-box-demo"
                options={dataSource}
                value={valueSelect}
                getOptionLabel={(option) => option?.o_2 || ''}
                // style={{ marginTop: 8, marginBottom: 4, width: !disabled ? '80%' : '100%' }}
                // renderInput={(params) => <TextField {...params} label={!!label ? label : ''} variant="outlined" />}
                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                renderInput={(params) => {
                    let newParams = {
                        ...params,
                        ...{
                            InputProps: {
                                ...params.InputProps,
                                // endAdornment: Object.assign(params.InputProps.endAdornment, (
                                //     <Tooltip title={t('partner.supplier.titleQuickAdd')} aria-label="add">
                                //         <AddCircleIcon style={{ color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                                //     </Tooltip>
                                // )),
                                startAdornment: (
                                    <Tooltip title={t('config.unit.titleQuickAdd')} aria-label="add">
                                        <AddCircleIcon
                                            style={{ color: 'green' }}
                                            onClick={() => {
                                                setUnitInfo({ name: '', note: '' })
                                                setShouldOpenModal(true)
                                            }}
                                        />
                                    </Tooltip>
                                ),
                            },
                        },
                    }
                    return (
                        <TextField
                            {...newParams}
                            required={required}
                            value={inputValue}
                            inputRef={inputRef}
                            autoFocus={autoFocus}
                            label={!!label ? label : ''}
                            variant="outlined"
                        />
                    )
                }}
            />
            <Dialog
                fullWidth={true}
                maxWidth="xs"
                open={shouldOpenModal}
                onClose={(e) => {
                    if (process) return
                    setShouldOpenModal(false)
                }}
            >
                <Card>
                    <CardHeader title={t('config.unit.titleAdd')} />
                    <CardContent>
                        <TextField
                            fullWidth={true}
                            required={true}
                            autoFocus={true}
                            margin="dense"
                            label={t('config.unit.name')}
                            name="name"
                            onChange={handleChangeUnit}
                            value={unitInfo.name}
                            variant="outlined"
                            className="uppercaseInput"
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    handleCreateUnit()
                                    setUnitInfo({ name: '', note: '' })
                                }
                            }}
                        />

                        {/* <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline={true}
                            rows={2}
                            name="note"
                            label={t('config.unit.note')}
                            onChange={handleChangeUnit}
                            value={unitInfo.note || ''}
                            variant="outlined"
                        /> */}
                    </CardContent>
                    <CardActions className="align-items-end" style={{ justifyContent: 'flex-end' }}>
                        <Button
                            onClick={(e) => {
                                if (process) return
                                setShouldOpenModal(false)
                            }}
                            startIcon={<ExitToAppIcon />}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')} (Esc)
                        </Button>
                        <Button
                            onClick={() => {
                                if (process) return
                                handleCreateUnit()
                            }}
                            endIcon={process && <LoopIcon />}
                            startIcon={!process && <SaveIcon />}
                            variant="contained"
                            disabled={checkValidate()}
                            className={
                                checkValidate() === false
                                    ? process
                                        ? 'button-loading bg-success text-white'
                                        : 'bg-success text-white'
                                    : ''
                            }
                        >
                            {t('btn.save')} (F3)
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default UnitAdd_Autocomplete
