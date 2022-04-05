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
        reqFunct: reqFunction.PRODUCT_GROUP_DROPDOWN_LIST,
        biz: 'common',
        object: 'dropdown_list',
    },
    CREATE_PRODUCT_GROUP: {
        functionName: 'insert',
        reqFunct: reqFunction.PRODUCT_GROUP_ADD,
        biz: 'common',
        object: 'groups',
    },
}

const ProductGroupAdd_Autocomplete = ({
    onSelect,
    label,
    style,
    size,
    value,
    productGroupID,
    disabled = false,
    autoFocus = false,
    onKeyPress = () => null,
    inputRef = null,
    required = false,
}) => {
    const { t } = useTranslation()

    const [dataSource, setDataSource] = useState([])
    const [valueSelect, setValueSelect] = useState({})
    const [inputValue, setInputValue] = useState('')
    const [process, setProcess] = useState(false)
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [productGroupInfo, setProductGroupInfo] = useState({
        name: '',
        note: '',
    })
    const idCreated = useRef(-1)

    useEffect(() => {
        const inputParam = ['groups', '%']
        sendRequest(serviceInfo.DROPDOWN_LIST, inputParam, handleResultProductGroupDropDownList, true, handleTimeOut)
    }, [])

    useEffect(() => {
        if (!!productGroupID && productGroupID !== 0) {
            let item = dataSource.find((x) => x.o_1 === productGroupID)
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
    }, [productGroupID, value, dataSource])

    const handleResultProductGroupDropDownList = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            setDataSource(newData.rows)
            // let productGroupRequireEnterExp = newData.rows.filter((x) => x.o_2 === 'DƯỢC PHẨM')
            // if (productGroupRequireEnterExp.length > 0) {
            //     glb_sv.defaultProductGroupId = [productGroupRequireEnterExp[0]?.o_1]
            // }
            if (newData.rows && newData.rows.length > 0) {
                if (idCreated.current <= 0) {
                    onChange(null, newData.rows[0], null)
                } else {
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
        if (!!productGroupInfo.name && !!productGroupInfo.name.trim()) {
            return false
        }
        return true
    }

    const handleChangeProductGroup = (e) => {
        let newProductGroup = { ...productGroupInfo }
        newProductGroup[e.target.name] = e.target.value
        setProductGroupInfo(newProductGroup)
    }

    const handleCreateProductGroup = () => {
        if (process) return
        setProcess(true)
        sendRequest(
            serviceInfo.CREATE_PRODUCT_GROUP,
            [productGroupInfo.name, productGroupInfo.note],
            handleResultCreateProductGroup,
            true,
            handleTimeOut
        )
    }

    const handleResultCreateProductGroup = (reqInfoMap, message) => {
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
            }
            setShouldOpenModal(false)
            // Lấy dữ liệu mới nhất
            const inputParam = ['groups', '%']
            sendRequest(
                serviceInfo.DROPDOWN_LIST,
                inputParam,
                handleResultProductGroupDropDownList,
                true,
                handleTimeOut
            )
        }
    }

    return (
        <>
            <Autocomplete
                disabled={disabled}
                onChange={onChange}
                onKeyPress={onKeyPress}
                onInputChange={handleChangeInput}
                size={!!size ? size : 'small'}
                id="combo-box-demo"
                options={dataSource}
                value={valueSelect}
                // autoSelect={true}
                autoHighlight={true}
                autoComplete={true}
                getOptionLabel={(option) => option.o_2 || ''}
                // style={{ marginTop: 8, marginBottom: 4, width: !disabled ? '80%' : '100%' }}
                // renderInput={(params) => <TextField {...params} label={!!label ? label : ''} variant="outlined" />}
                style={{ marginTop: 8, marginBottom: 4, width: '100%' }}
                renderInput={(params) => {
                    let newParams = {
                        ...params,
                        ...{
                            InputProps: {
                                ...params.InputProps,
                                startAdornment: (
                                    <Tooltip title={t('productGroup.titleQuickAdd')} aria-label="add">
                                        <AddCircleIcon
                                            style={{ color: 'green' }}
                                            onClick={() => {
                                                setProductGroupInfo({ name: '', note: '' })
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
            {/* {!disabled &&
                <Tooltip title={t('productGroup.titleAdd')} aria-label="add">
                    <AddCircleIcon style={{ width: '20%', color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                </Tooltip>
            } */}

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
                    <CardHeader title={t('productGroup.titleAdd')} />
                    <CardContent>
                        <TextField
                            fullWidth={true}
                            required={true}
                            autoFocus={true}
                            margin="dense"
                            label={t('productGroup.name')}
                            name="name"
                            onChange={handleChangeProductGroup}
                            value={productGroupInfo.name}
                            variant="outlined"
                            className="uppercaseInput"
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    handleCreateProductGroup()
                                }
                            }}
                        />

                        {/* <TextField
                            fullWidth={true}
                            margin="dense"
                            multiline={true}
                            rows={2}
                            name="note"
                            label={t('productGroup.note')}
                            onChange={handleChangeProductGroup}
                            value={productGroupInfo.note || ''}
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
                                handleCreateProductGroup()
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

export default ProductGroupAdd_Autocomplete
