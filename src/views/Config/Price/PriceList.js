import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    Button,
    Chip,
    IconButton,
} from '@material-ui/core'

import FastForwardIcon from '@material-ui/icons/FastForward'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import EditIcon from '@material-ui/icons/Edit'
import LoopIcon from '@material-ui/icons/Loop'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import DeleteIcon from '@material-ui/icons/Delete'

import SearchOne from '../../../components/SearchOne'
import ColumnCtrComp from '../../../components/_ColumnCtr'
import ExportExcel from '../../../components/ExportExcel'
import DisplayColumn from '../../../components/DisplayColumn'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import sendRequest from '../../../utils/service/sendReq'

import { tableColumn, config } from './Modal/Price.modal'
import PriceAdd from './PriceAdd'
import PriceEdit from './PriceEdit'

const serviceInfo = {
    GET_ALL: {
        functionName: config['list'].functionName,
        reqFunct: config['list'].reqFunct,
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

const PriceList = () => {
    const { t } = useTranslation()
    const [anChorEl, setAnChorEl] = useState(null)
    const [column, setColumn] = useState(tableColumn)
    const [searchValue, setSearchValue] = useState('')
    const [totalRecords, setTotalRecords] = useState(0)
    const [dataSource, setDataSource] = useState([])

    const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false)
    const [shouldOpenRemoveModal, setShouldOpenRemoveModal] = useState(false)
    const [id, setId] = useState(0)
    const [name, setName] = useState('')
    const [processing, setProcessing] = useState(false)
    const [searchProcess, setSearchProcess] = useState(false)

    const dataSourceRef = useRef([])
    const searchRef = useRef('')
    const idRef = useRef(0)

    useEffect(() => {
        getList(glb_sv.defaultValueSearch, '')
    }, [])

    const getList = (lastIndex, value) => {
        const inputParam = [lastIndex, '%' + value.trim() + '%']
        setSearchProcess(true)
        sendRequest(serviceInfo.GET_ALL, inputParam, handleResultGetList, true, handleTimeOut)
    }

    const handleResultGetList = (reqInfoMap, message) => {
        setSearchProcess(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let newData = message['PROC_DATA']
            if (newData.rows.length > 0) {
                if (reqInfoMap.inputParam[0] === glb_sv.defaultValueSearch) {
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

    const searchSubmit = (value) => {
        // if (value === searchRef.current) return
        searchRef.current = value
        dataSourceRef.current = []
        setSearchValue(value)
        setTotalRecords(0)
        getList(glb_sv.defaultValueSearch, value)
    }

    const onRemove = (item) => {
        setShouldOpenRemoveModal(item ? true : false)
        setId(item ? item.o_1 : 0)
        setName(item ? item.o_3 + ' (' + item.o_5 + ')' : '')
    }

    const onEdit = (item) => {
        setShouldOpenEditModal(item ? true : false)
        setId(item ? item.o_1 : 0)
        idRef.current = item && item.o_1 > 0 ? item.o_1 : 0
    }

    const handleDelete = (e) => {
        // e.preventDefault();
        idRef.current = id
        setProcessing(true)
        sendRequest(serviceInfo.DELETE, [id], handleResultRemove, true, handleTimeOut)
    }

    const handleResultRemove = (reqInfoMap, message) => {
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        setProcessing(false)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            dataSourceRef.current = []
            setName('')
            setId(0)
            setDataSource([])
            setTotalRecords(0)
            setShouldOpenRemoveModal(false)
            getList(glb_sv.defaultValueSearch, searchValue)
        }
    }

    const getNextData = () => {
        if (dataSourceRef.current.length > 0) {
            const lastIndex = dataSourceRef.current.length - 1
            const lastID = dataSourceRef.current[lastIndex].o_1
            getList(lastID, searchValue)
        }
    }

    const headersCSV = [
        { label: t('stt'), key: 'stt' },
        { label: t('menu.product'), key: 'product' },
        { label: t('menu.configUnit'), key: 'unit' },
        { label: t('config.price.importPrice'), key: 'importPrice' },
        { label: t('config.price.importVAT'), key: 'importVAT' },
        { label: t('config.price.price'), key: 'price' },
        { label: t('config.price.wholePrice'), key: 'wholePrice' },
        { label: t('config.price.exportVAT'), key: 'exportVAT' },
        { label: t('config.price.note'), key: 'note' },
        { label: t('createdUser'), key: 'createdUser' },
        { label: t('createdDate'), key: 'createdDate' },
        // { label: t('titleBranch'), key: 'titleBranch' }
    ]

    const dataCSV = () => {
        const result = dataSource.map((item, index) => {
            const data = item
            item = {}
            item['stt'] = index + 1
            item['product'] = data.o_3
            item['unit'] = data.o_5
            item['importPrice'] = data.o_6
            item['importVAT'] = data.o_7
            item['price'] = data.o_8
            item['wholePrice'] = data.o_9
            item['exportVAT'] = data.o_10
            item['note'] = data.o_11
            item['createdUser'] = data.o_12
            item['createdDate'] = glb_sv.formatValue(data.o_13, 'date')
            // item['titleBranch'] = data.o_9
            return item
        })
        return result
    }

    const handleRefresh = () => {
        dataSourceRef.current = []
        setTotalRecords(0)
        getList(glb_sv.defaultValueSearch, searchValue)
    }

    return (
        <>
            <Card className="mb-2">
                <CardHeader title={t('lbl.search')} />
                <CardContent>
                    <SearchOne
                        process={searchProcess}
                        name="product_name"
                        label={'product.search_name'}
                        searchSubmit={searchSubmit}
                    />
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
                            {t('config.price.titleList')}
                            <DisplayColumn columns={tableColumn} handleCheckChange={onChangeColumnView} />
                        </>
                    }
                    action={
                        <div className="d-flex align-items-center">
                            <PriceAdd onRefresh={handleRefresh} />
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
                                                                        onClick={(e) => {
                                                                            onEdit(item)
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
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
                        <ExportExcel filename="price" data={dataCSV()} headers={headersCSV} />
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
                    <CardHeader title={t('config.price.titleRemove', { name: name })} />
                    <CardContent>{name}</CardContent>
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

            {/* modal edit */}
            <PriceEdit
                id={id}
                shouldOpenModal={shouldOpenEditModal}
                setShouldOpenModal={setShouldOpenEditModal}
                onRefresh={handleRefresh}
            />
        </>
    )
}

export default PriceList
