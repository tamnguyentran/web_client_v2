import React, { useState, useEffect, useRef } from 'react'
import NumberFormat from 'react-number-format'
import moment from 'moment'
import DateFnsUtils from '@date-io/date-fns'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { useTranslation } from 'react-i18next'
import {
    Card,
    CardHeader,
    CardContent,
    Grid,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Tooltip,
} from '@material-ui/core'

import Product_Autocomplete from '../../Products/Product/Control/Product.Autocomplete'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { productExportRepayModal } from './Modal/ExportRepay.modal'
import LotNoByProduct_Autocomplete from '../../../components/LotNoByProduct'

import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions'
import sendRequest from '../../../utils/service/sendReq'

import { ReactComponent as IC_SCANNER } from '../../../asset/images/scanner.svg'
import { ReactComponent as IC_ADD_BASIC } from '../../../asset/images/add-basic.svg'

import ConfirmProduct from './ConfirmProduct'

const serviceInfo = {
    GET_PRICE_BY_PRODUCT_ID: {
        functionName: 'get_by_prodid',
        reqFunct: reqFunction.EXPORT_BY_ID,
        biz: 'common',
        object: 'setup_price',
    },
    GET_PRODUCT_BY_BARCODE: {
        functionName: 'get_exp_barcode',
        reqFunct: reqFunction.GET_PRODUCT_BY_BARCODE,
        biz: 'common',
        object: 'products',
    },
}

const AddProduct = ({ onAddProduct, resetFlag }) => {
    const { t } = useTranslation()
    const [productInfo, setProductInfo] = useState({ ...productExportRepayModal })
    const [isInventory, setIsInventory] = useState(true)
    const [priceList, setPriceList] = useState([])
    const [selectLotNoFlag, setSelectLotNoFlag] = useState(false)
    const [barcodeScaned, setBarcodeScaned] = useState('')
    const [isScan, setIsScan] = useState(false)
    const [shouldConfirmOpenModal, setShouldConfirmOpenModal] = useState(false)
    const [dataConfirm, setDataConfirm] = useState({})
    const inputBarcodeRef = useRef(null)

    const stepOneRef = useRef(null)
    const stepTwoRef = useRef(null)
    const stepThreeRef = useRef(null)
    const stepFourRef = useRef(null)
    const stepFiveRef = useRef(null)
    const stepSixRef = useRef(null)
    const stepSevenRef = useRef(null)

    useEffect(() => {
        if (resetFlag) {
            setProductInfo({ ...productExportRepayModal })
            if (stepOneRef.current) stepOneRef.current.focus()
        }
    }, [resetFlag])

    useEffect(() => {
        if (selectLotNoFlag && productInfo.prod_id) {
            setPriceList([])
            sendRequest(
                serviceInfo.GET_PRICE_BY_PRODUCT_ID,
                [productInfo.prod_id],
                handleResultGetPrice,
                true,
                handleTimeOut
            )
        }
    }, [selectLotNoFlag])

    const handleSelectProduct = (obj) => {
        const newProductInfo = { ...productInfo }
        newProductInfo['prod_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['prod_nm'] = !!obj ? obj?.o_2 : ''
        newProductInfo['lot_no'] = null
        newProductInfo['quantity_in_stock'] = ''
        if (!!obj) {
            stepThreeRef.current.focus()

            // bắn event lấy thông tin cấu hình bảng giá => nhập fill vào các ô dưới
        }
        setProductInfo(newProductInfo)
    }

    const handleResultGetPrice = (reqInfoMap, message) => {
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            let data = message['PROC_DATA']
            setPriceList(data.rows)
            if (data.rows.length > 0) {
                let itemMinUnit = data.rows.find((x) => x.o_4 === productInfo?.unit_id)
                const newProductInfo = { ...productInfo }
                if (itemMinUnit) {
                    // bảng giá đã config giá nhỏ nhất
                    newProductInfo['price'] = itemMinUnit.o_9 // invoiceType ? itemMinUnit.o_8 : itemMinUnit.o_9
                    newProductInfo['discount_per'] = 0
                    newProductInfo['vat_per'] = itemMinUnit.o_10
                    setProductInfo(newProductInfo)
                } else {
                    // bảng giá chưa config giá nhỏ nhất
                    newProductInfo['unit_id'] = data.rows[0].o_4
                    newProductInfo['price'] = data.rows[0].o_9 // invoiceType ? data.rows[0].o_8 : data.rows[0].o_9
                    newProductInfo['discount_per'] = 0
                    newProductInfo['vat_per'] = data.rows[0].o_10
                    setProductInfo(newProductInfo)
                }
            } else {
                const newProductInfo = { ...productInfo }
                newProductInfo['price'] = 0
                newProductInfo['discount_per'] = 0
                newProductInfo['vat_per'] = 0
                setProductInfo(newProductInfo)
            }
        }
    }

    const handleSelectUnit = (obj) => {
        const newProductInfo = { ...productInfo }
        newProductInfo['unit_id'] = !!obj ? obj?.o_1 : null
        newProductInfo['unit_nm'] = !!obj ? obj?.o_2 : ''
        const priceData = priceList.find((x) => x.o_4 === obj.o_1)
        if (priceData) {
            newProductInfo['price'] = priceData.o_9
            newProductInfo['discount_per'] = 0
            newProductInfo['vat_per'] = priceData.o_10
        } else {
            newProductInfo['price'] = 0
            newProductInfo['discount_per'] = 0
            newProductInfo['vat_per'] = 0
        }
        setProductInfo(newProductInfo)
    }

    const handleQuantityChange = (value) => {
        const newProductInfo = { ...productInfo }
        newProductInfo['qty'] = Number(value.value)
        setProductInfo(newProductInfo)
    }

    const handlePriceChange = (value) => {
        const newProductInfo = { ...productInfo }
        newProductInfo['price'] = Number(value.value)
        setProductInfo(newProductInfo)
    }

    const handleDiscountChange = (value) => {
        const newProductInfo = { ...productInfo }
        newProductInfo['discount_per'] =
            Number(value.value) >= 0 && Number(value.value) <= 100 ? Math.round(value.value) : 10
        setProductInfo(newProductInfo)
    }

    const handleVATChange = (value) => {
        const newProductInfo = { ...productInfo }
        newProductInfo['vat_per'] =
            Number(value.value) >= 0 && Number(value.value) <= 100 ? Math.round(value.value) : 10
        setProductInfo(newProductInfo)
    }

    const handleSelectLotNo = (object) => {
        const newProductInfo = { ...productInfo }
        newProductInfo['quantity_in_stock'] = !!object ? object.o_5 : null
        newProductInfo['lot_no'] = !!object ? object.o_3 : null
        newProductInfo['unit_id'] = !!object ? object.o_7 : null
        newProductInfo['exp_dt'] = !!object ? object.o_4 : null
        setProductInfo(newProductInfo)
        setSelectLotNoFlag(true)
        setTimeout(() => {
            setSelectLotNoFlag(false)
        }, 100)
    }

    const handleBarCodeChange = (e) => {
        setBarcodeScaned(e.target.value)
    }

    const handleScanner = (e) => {
        setBarcodeScaned([])
        // Gửi event lấy thông tin sp theo barcode
        sendRequest(
            serviceInfo.GET_PRODUCT_BY_BARCODE,
            [barcodeScaned, 'Y'],
            handleResultGetProductByBarcode,
            true,
            handleTimeOut
        )
    }

    const handleResultGetProductByBarcode = (reqInfoMap, message) => {
        console.log('handleResultGetProductByBarcode: ', reqInfoMap, message)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
        } else if (message['PROC_DATA']) {
            // thêm sản phẩm xuống form
            const data = message['PROC_DATA']
            if (data.rows.length > 0) {
                const dataConvert = {
                    exp_tp: '1',
                    prod_id: data.rows[0].o_1,
                    lot_no: data.rows[0].o_3,
                    qty: 1,
                    unit_id: data.rows[0].o_6,
                    price: data.rows[0].o_9,
                    discount_per: 0,
                    vat_per: data.rows[0].o_11,
                }
                setDataConfirm(dataConvert)
                setShouldConfirmOpenModal(true)
            }
        }
    }

    const handleClostConfirmModal = () => {
        setDataConfirm({})
        setShouldConfirmOpenModal(false)
        setBarcodeScaned('')
        inputBarcodeRef.current.focus()
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const checkValidate = () => {
        if (
            !!productInfo.prod_id &&
            !!productInfo.lot_no &&
            productInfo.qty > 0 &&
            !!productInfo.unit_id &&
            productInfo.price >= 0 &&
            productInfo.discount_per >= 0 &&
            productInfo.discount_per <= 100 &&
            productInfo.vat_per >= 0 &&
            productInfo.vat_per <= 100
        ) {
            return false
        }
        return true
    }

    return (
        <Card className="mb-2">
            <ConfirmProduct
                productData={dataConfirm}
                isInventory={isInventory}
                shouldOpenModal={shouldConfirmOpenModal}
                handleCloseModal={handleClostConfirmModal}
                onAddProduct={onAddProduct}
                // invoiceType={invoiceType}
            />
            <CardHeader
                title={
                    <>
                        {t('order.import.productAdd')}
                        <span className="ml-2 p-1 action_ctr">
                            {isScan ? (
                                <Tooltip
                                    onClick={() => {
                                        setIsScan(false)
                                    }}
                                    title={t('edit_base')}
                                >
                                    <IC_SCANNER />
                                </Tooltip>
                            ) : (
                                <Tooltip
                                    onClick={() => {
                                        setIsScan(true)
                                    }}
                                    title={t('scan_barcode')}
                                >
                                    <IC_ADD_BASIC />
                                </Tooltip>
                            )}
                        </span>
                    </>
                }
                action={
                    <>
                        <FormControlLabel
                            style={{ margin: 0 }}
                            control={
                                <Checkbox
                                    style={{ padding: 0, color: '#e9e6e0' }}
                                    checked={isInventory}
                                    onChange={(e) => setIsInventory(e.target.checked)}
                                    name="only_get_inventory_lot_no"
                                />
                            }
                            label={t('only_get_inventory_lot_no')}
                        />
                    </>
                }
            />
            <CardContent>
                {isScan ? (
                    <Grid container spacing={1}>
                        <Grid item xs={3}>
                            <Tooltip placement="top" title={t('product.tooltip.barcode')} arrow>
                                <TextField
                                    fullWidth={true}
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('product.barcode')}
                                    onChange={handleBarCodeChange}
                                    value={barcodeScaned}
                                    name="barcode"
                                    variant="outlined"
                                    autoFocus={true}
                                    inputRef={inputBarcodeRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            handleScanner()
                                        }
                                    }}
                                />
                            </Tooltip>
                        </Grid>
                    </Grid>
                ) : (
                    <>
                        <Grid container spacing={1}>
                            <Grid item xs>
                                <Product_Autocomplete
                                    value={productInfo.prod_nm}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.product')}
                                    onSelect={handleSelectProduct}
                                    inputRef={stepOneRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            stepTwoRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <LotNoByProduct_Autocomplete
                                    isInventory={isInventory}
                                    disabled={!productInfo.prod_id}
                                    productID={productInfo.prod_id}
                                    label={t('order.export.lot_no')}
                                    onSelect={handleSelectLotNo}
                                    inputRef={stepTwoRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            stepThreeRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                        disabled={true}
                                        disableToolbar
                                        margin="dense"
                                        variant="outlined"
                                        style={{ width: '100%' }}
                                        inputVariant="outlined"
                                        format="dd/MM/yyyy"
                                        id="exp_dt-picker-inline"
                                        label={t('order.export.exp_dt')}
                                        value={
                                            productInfo.exp_dt
                                                ? moment(productInfo.exp_dt, 'YYYYMMDD').toString()
                                                : null
                                        }
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item xs>
                                <TextField
                                    disabled={true}
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.store_current')}
                                    value={productInfo.quantity_in_stock || ''}
                                    name="quantity_in_stock"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={1}>
                            <Grid item xs>
                                <NumberFormat
                                    className="inputNumber"
                                    style={{ width: '100%' }}
                                    required
                                    value={productInfo.qty}
                                    label={t('order.export.qty')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    thousandSeparator={true}
                                    onValueChange={handleQuantityChange}
                                    inputProps={{
                                        min: 0,
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    inputRef={stepThreeRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            stepFourRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <Unit_Autocomplete
                                    unitID={productInfo.unit_id || null}
                                    // value={productInfo.unit_nm || ''}
                                    style={{ marginTop: 8, marginBottom: 4 }}
                                    size={'small'}
                                    label={t('menu.configUnit')}
                                    onSelect={handleSelectUnit}
                                    inputRef={stepFourRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            stepFiveRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat
                                    className="inputNumber"
                                    style={{ width: '100%' }}
                                    required
                                    value={productInfo.price}
                                    label={t('order.export.price')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    thousandSeparator={true}
                                    onValueChange={handlePriceChange}
                                    inputProps={{
                                        min: 0,
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    inputRef={stepFiveRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            stepSixRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat
                                    className="inputNumber"
                                    style={{ width: '100%' }}
                                    required
                                    value={productInfo.discount_per}
                                    label={t('order.export.discount_per')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    suffix="%"
                                    thousandSeparator={true}
                                    onValueChange={handleDiscountChange}
                                    inputProps={{
                                        min: 0,
                                        max: 100,
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    inputRef={stepSixRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            stepSevenRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs>
                                <NumberFormat
                                    className="inputNumber"
                                    style={{ width: '100%' }}
                                    required
                                    value={productInfo.vat_per}
                                    label={t('order.export.vat_per')}
                                    customInput={TextField}
                                    autoComplete="off"
                                    margin="dense"
                                    type="text"
                                    variant="outlined"
                                    suffix="%"
                                    thousandSeparator={true}
                                    onValueChange={handleVATChange}
                                    inputProps={{
                                        min: 0,
                                        max: 100,
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    inputRef={stepSevenRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            if (checkValidate()) return
                                            onAddProduct(productInfo)
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item className="d-flex align-items-center">
                                <Button
                                    onClick={() => {
                                        onAddProduct(productInfo)
                                    }}
                                    variant="contained"
                                    disabled={checkValidate()}
                                    className={checkValidate() === false ? 'bg-success text-white' : ''}
                                >
                                    {t('btn.save')} (F3)
                                </Button>
                            </Grid>
                        </Grid>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default AddProduct
