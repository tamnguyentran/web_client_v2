import React, { useState, useRef, useEffect } from 'react'
import moment from 'moment'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    IconButton,
    Chip,
    Select,
    FormControl,
    MenuItem,
    InputLabel,
    TextField,
    Grid,
    Button,
    Dialog,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableContainer,
    TableHead,
} from '@material-ui/core'
import FastForwardIcon from '@material-ui/icons/FastForward'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import LoopIcon from '@material-ui/icons/Loop'

import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import DeleteIcon from '@material-ui/icons/Delete'
import ExportExcel from '../../../components/ExportExcel'
import DisplayColumn from '../../../components/DisplayColumn'
import ColumnCtrComp from '../../../components/_ColumnCtr'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn, config } from './Modal/Import.modal'
import ImportSearch from './ImportSearch'

const serviceInfo = {
    GET_ALL: {
        functionName: config['list'].functionName,
        reqFunct: config['list'].reqFunct,
        biz: config.biz,
        object: config.object,
    },
    CREATE: {
        functionName: config['insert'].functionName,
        reqFunct: config['insert'].reqFunct,
        biz: config.biz,
        object: config.object,
    },
    UPDATE: {
        functionName: config['update'].functionName,
        reqFunct: config['update'].reqFunct,
        biz: config.biz,
        object: config.object,
    },
    DELETE: {
        functionName: config['delete'].functionName,
        reqFunct: config['delete'].reqFunct,
        biz: config.biz,
        object: config.object,
    },
}

const ImportList = () => {
    const { t } = useTranslation()
    const history = useHistory()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchModal, setSearchModal] = useState({
        start_dt: moment().day(-14).format('YYYYMMDD'),
        end_dt: moment().format('YYYYMMDD'),
        id_status: '1',
        vender_nm: '',
    })
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const [shouldOpenRemoveModal, setShouldOpenRemoveModal] = useState(false)
    const [deleteModalContent, setDeleteModalContent] = useState({
        reason: '1',
        note: '',
    })
    const [id, setId] = useState(0)
    const [name, setName] = useState('')
    const [processing, setProcessing] = useState(false)
    const [searchProcess, setSearchProcess] = useState(false)

    const dataSourceRef = useRef([])
    const idRef = useRef(0)

    useHotkeys('F2', () => history.push('/page/order/ins-import'), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

    useEffect(() => {
        getList(searchModal.start_dt, searchModal.end_dt, glb_sv.defaultValueSearch, searchModal.id_status, '')
    }, [])

    const getList = (startdate, endDate, index, status, name) => {
        const inputParam = [startdate, endDate, index || glb_sv.defaultValueSearch, status, '%' + name.trim() + '%']
        setSearchProcess(true)
        sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetAll, true, handleTimeOut)
    }

    const handleResultGetAll = (reqInfoMap, message) => {
        setSearchProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            let newData = message['PROC_DATA']
            if (newData.rows.length > 0) {
                if (reqInfoMap.inputParam[2] === glb_sv.defaultValueSearch) {
                    setTotalRecords(newData.rowTotal)
                } else {
                    setTotalRecords(dataSourceRef.current.length - newData.rows.length + newData.rowTotal)
                }
                dataSourceRef.current = dataSourceRef.current.concat(newData.rows)
                setDataSource(dataSourceRef.current)
            } else {
                dataSourceRef.current = []
                setDataSource([])
                setTotalRecords(0)
            }
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
        setProcessing(false)
        setSearchProcess(false)
    }

    const onClickColumn = (e) => {
        setAnChorEl(e.currentTarget)
    }

    const onCloseColumn = () => {
        setAnChorEl(null)
    }

    const onChangeColumnView = (item) => {
        const newColumn = [...column]
        const index = newColumn.findIndex((obj) => obj.field === item.field)
        if (index >= 0) {
            newColumn[index]['show'] = !column[index]['show']
            setColumn(newColumn)
        }
    }

    const searchSubmit = (searchObject) => {
        dataSourceRef.current = []
        setSearchModal({ ...searchObject })
        setTotalRecords(0)
        const newColumn = [...column]
        newColumn[6].show = searchObject.id_status === '2' ? true : false
        newColumn[7].show = searchObject.id_status === '2' ? true : false
        setColumn(newColumn)
        getList(
            moment(searchObject.start_dt).format('YYYYMMDD'),
            moment(searchObject.end_dt).format('YYYYMMDD'),
            glb_sv.defaultValueSearch,
            searchObject.id_status,
            searchObject.vender_nm.trim()
        )
    }

    const onRemove = (item) => {
        setShouldOpenRemoveModal(item ? true : false)
        setId(item ? item.o_1 : 0)
        setName(item ? item.o_2 : '')
    }

    const handleDelete = (e) => {
        // e.preventDefault();
        setProcessing(true)
        idRef.current = id
        const inputParam = [id, deleteModalContent.reason, deleteModalContent.note]
        sendRequest(serviceInfo.DELETE, inputParam, handleResultDelete, true, handleTimeOut)
    }

    const handleResultDelete = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcessing(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // xử lý thành công
            dataSourceRef.current = []
            setName('')
            setId(0)
            setDataSource([])
            setTotalRecords(0)
            setDeleteModalContent({
                reason: '1',
                note: '',
            })
            setShouldOpenRemoveModal(false)
            getList(searchModal.start_dt, searchModal.end_dt, glb_sv.defaultValueSearch, searchModal.id_status, '')
        }
    }

    const getNextData = () => {
        if (dataSourceRef.current.length > 0) {
            const lastIndex = dataSourceRef.current.length - 1
            const lastID = dataSourceRef.current[lastIndex].o_1
            getList(
                moment(searchModal.start_dt).format('YYYYMMDD'),
                moment(searchModal.end_dt).format('YYYYMMDD'),
                lastID,
                searchModal.id_status,
                searchModal.vender_nm.trim()
            )
        }
    }

    const handleChange = (e) => {
        const newModal = { ...deleteModalContent }
        newModal[e.target.name] = e.target.value
        setDeleteModalContent(newModal)
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('order.import.invoice_no'), key: 'invoice_no' },
        { label: t('order.import.invoice_stat'), key: 'invoice_stat' },
        { label: t('order.import.vender_nm'), key: 'vender_nm' },
        { label: t('order.import.order_dt'), key: 'order_dt' },
        { label: t('order.import.input_dt'), key: 'input_dt' },
        { label: t('order.import.person_s'), key: 'person_s' },
        { label: t('order.import.person_r'), key: 'person_r' },
        { label: t('order.import.cancel_reason'), key: 'cancel_reason' },
        { label: t('order.import.note'), key: 'note' },
        { label: t('order.import.total_prod'), key: 'total_prod' },
        { label: t('order.import.invoice_val'), key: 'invoice_val' },
        { label: t('order.import.invoice_discount'), key: 'invoice_discount' },
        { label: t('order.import.invoice_vat'), key: 'invoice_vat' },
        { label: t('order.import.invoice_settl'), key: 'invoice_settl' },
        { label: t('createdUser'), key: 'createdUser' },
        { label: t('createdDate'), key: 'createdDate' },
        // { label: t('titleBranch'), key: 'titleBranch' }
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['invoice_no'] = data.o_2
            item['invoice_stat'] = data.o_3 === '1' ? t('normal') : t('cancelled')
            item['vender_nm'] = data.o_5
            item['order_dt'] = glb_sv.formatValue(data.o_6, 'dated')
            item['input_dt'] = glb_sv.formatValue(data.o_7, 'dated')
            item['person_s'] = data.o_8
            item['person_s'] = data.o_9
            item['cancel_reason'] = data.o_10
            item['note'] = data.o_11
            item['total_prod'] = data.o_12
            item['invoice_val'] = data.o_13
            item['invoice_discount'] = data.o_14
            item['invoice_vat'] = data.o_15
            item['invoice_settl'] = data.o_16
            item['createdUser'] = data.o_17
            item['createdDate'] = glb_sv.formatValue(data.o_18, 'date')
            // item['titleBranch'] = data.o_9
            return item
        })
        return result
    }

    return (
        <>
            <Card className="mb-2">
                <CardHeader title={t('lbl.search')} />
                <CardContent>
                    <ImportSearch process={searchProcess} handleSearch={searchSubmit} />
                </CardContent>
            </Card>
            <ColumnCtrComp
                anchorEl={anChorEl}
                columns={tableColumn}
                handleClose={onCloseColumn}
                checkColumnChange={onChangeColumnView}
            />
            <Card>
                <CardHeader
                    title={
                        <>
                            {t('order.import.titleListvsvs')}
                            <DisplayColumn columns={tableColumn} handleCheckChange={onChangeColumnView} />
                        </>
                    }
                    action={
                        <div className="d-flex align-items-center">
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => history.push('/page/order/ins-import')}
                                style={{ color: 'var(--white)', border: '1px solid white', maxHeight: 22 }}
                            >
                                Thêm mới (F2)
                            </Button>
                        </div>
                    }
                />
                <CardContent>
                    <TableContainer className="tableContainer">
                        <Table stickyHeader>
                            <caption
                                className={[
                                    'text-center text-danger border-bottom',
                                    dataSource.length > 0 ? 'd-none' : '',
                                ].join(' ')}
                            >
                                {t('lbl.emptyData')}
                            </caption>
                            <TableHead>
                                <TableRow>
                                    {column.map((col) => (
                                        <TableCell
                                            nowrap="true"
                                            align={col.align}
                                            className={['p-2 border-0', col.show ? 'd-table-cell' : 'd-none'].join(' ')}
                                            key={col.field}
                                        >
                                            {t(col.title)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataSource.map((item, index) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                            {column.map((col, indexRow) => {
                                                let value = item[col.field]
                                                if (col.show) {
                                                    switch (col.field) {
                                                        case 'action':
                                                            return (
                                                                <TableCell
                                                                    nowrap="true"
                                                                    key={indexRow}
                                                                    align={col.align}
                                                                >
                                                                    <IconButton
                                                                        disabled={item['o_3'] === '2' ? true : false}
                                                                        onClick={(e) => {
                                                                            onRemove(item)
                                                                        }}
                                                                    >
                                                                        <DeleteIcon
                                                                            style={{ color: 'red' }}
                                                                            fontSize="small"
                                                                        />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        disabled={item['o_3'] === '2' ? true : false}
                                                                        onClick={(e) => {
                                                                            history.push('/page/order/edit-import', {
                                                                                id: item.o_1,
                                                                            })
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            )
                                                        case 'o_3':
                                                            return (
                                                                <TableCell
                                                                    nowrap="true"
                                                                    key={indexRow}
                                                                    align={col.align}
                                                                >
                                                                    {value === '1' ? t('normal') : t('cancelled')}
                                                                </TableCell>
                                                            )
                                                        case 'o_10':
                                                            return (
                                                                <TableCell
                                                                    nowrap="true"
                                                                    key={indexRow}
                                                                    align={col.align}
                                                                >
                                                                    {item['o_3'] === '2' ? value : ''}
                                                                </TableCell>
                                                            )
                                                        default:
                                                            return (
                                                                <TableCell
                                                                    nowrap="true"
                                                                    key={indexRow}
                                                                    align={col.align}
                                                                >
                                                                    {glb_sv.formatValue(value, col['type'])}
                                                                </TableCell>
                                                            )
                                                    }
                                                }
                                            })}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>

                <CardActions>
                    <div className="d-flex align-items-center">
                        <Chip
                            size="small"
                            variant="outlined"
                            className="mr-1"
                            label={dataSourceRef.current.length + '/' + totalRecords + ' ' + t('rowData')}
                        />
                        <Chip
                            variant="outlined"
                            size="small"
                            className="mr-1"
                            deleteIcon={<FastForwardIcon />}
                            onDelete={() => null}
                            label={t('getMoreData')}
                            onClick={getNextData}
                            disabled={dataSourceRef.current.length >= totalRecords}
                        />
                        <ExportExcel filename="import" data={dataCSV()} headers={headersCSV} />
                    </div>
                </CardActions>
            </Card>

            {/* modal delete */}
            <Dialog
                maxWidth="xs"
                fullWidth={true}
                TransitionProps={{
                    addEndListener: (node, done) => {
                        // use the css transitionend event to mark the finish of a transition
                        node.addEventListener('keypress', function (e) {
                            if (e.key === 'Enter') {
                                handleDelete()
                            }
                        })
                    },
                }}
                open={shouldOpenRemoveModal}
                onClose={(e) => {
                    setShouldOpenRemoveModal(false)
                }}
            >
                <Card>
                    <CardHeader title={t('order.import.titleCancel', { name: name })} />
                    <CardContent>
                        <Grid container>
                            {t('order.import.invoice_no')}: {name}
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs>
                                <FormControl margin="dense" variant="outlined" className="w-100">
                                    <InputLabel id="reason">{t('order.import.reason')}</InputLabel>
                                    <Select
                                        labelId="reason"
                                        id="reason-select"
                                        value={deleteModalContent.reason || 'Y'}
                                        onChange={handleChange}
                                        label={t('order.import.reason')}
                                        name="reason"
                                    >
                                        <MenuItem value="1">{t('wrong_information')}</MenuItem>
                                        <MenuItem value="2">{t('cancel_import')}</MenuItem>
                                        <MenuItem value="3">{t('other_reason')}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    multiline
                                    rows={1}
                                    autoComplete="off"
                                    label={t('order.import.note')}
                                    onChange={handleChange}
                                    value={deleteModalContent.note || ''}
                                    name="note"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className="align-items-end" style={{ justifyContent: 'flex-end' }}>
                        <Button
                            size="small"
                            onClick={(e) => {
                                setShouldOpenRemoveModal(false)
                            }}
                            startIcon={<ExitToAppIcon />}
                            variant="contained"
                            disableElevation
                        >
                            {t('btn.close')} (Esc)
                        </Button>
                        <Button
                            className={processing ? 'button-loading' : ''}
                            endIcon={processing && <LoopIcon />}
                            size="small"
                            onClick={handleDelete}
                            variant="contained"
                            color="secondary"
                            startIcon={<DeleteIcon />}
                        >
                            {t('btn.delete')} (f10)
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default ImportList
