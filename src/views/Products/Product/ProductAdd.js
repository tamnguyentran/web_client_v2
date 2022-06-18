import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Tooltip,
    TextField,
    Grid,
    Button,
    Dialog,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    Divider,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import SaveIcon from '@material-ui/icons/Save'
import UnitAdd_Autocomplete from '../../Config/Unit/Control/UnitAdd.Autocomplete'
import ProductGroupAdd_Autocomplete from '../ProductGroup/Control/ProductGroupAdd.Autocomplete'
import sendRequest from '../../../utils/service/sendReq'
import glb_sv from '../../../utils/service/global_service'
import control_sv from '../../../utils/service/control_services'
import SnackBarService from '../../../utils/service/snackbar_service'
import reqFunction from '../../../utils/constan/functions'
import { productDefaulModal } from './Modal/Product.modal'

import AddIcon from '@material-ui/icons/Add'
import LoopIcon from '@material-ui/icons/Loop'
import NumberFormat from 'react-number-format'
import Unit_Autocomplete from '../../Config/Unit/Control/Unit.Autocomplete'
import { modalDefaultAdd } from '../../Config/StoreLimit/Modal/StoreLimit.modal'
import { priceDefaultModal } from '../../Config/Price/Modal/Price.modal'
import moment from 'moment'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'

const serviceInfo = {
    CREATE_PRODUCT: {
        functionName: 'insert_full',
        reqFunct: reqFunction.PRODUCT_ADD,
        biz: 'common',
        object: 'products',
    },
}

const ProductAdd = ({ onRefresh }) => {
    const { t } = useTranslation()

    const [product, setProduct] = useState(productDefaulModal)
    const [isExpandedInfo, setIsExpandedInfo] = useState(false)
    const [isExpandedInfo2, setIsExpandedInfo2] = useState(false)
    const [isExpandedInfo3, setIsExpandedInfo3] = useState(false)
    const [shouldOpenModal, setShouldOpenModal] = useState(false)
    const [process, setProcess] = useState(false)
    const saveContinue = useRef(false)
    const [requireExpDate, setRequireExpDate] = useState(false)
    const [invoiceInventory, setInvoiceInventory] = useState({ lot_no: '', exp_dt: null, imp_price: 0 })
    const [unitRate, setUnitRate] = useState({ unit: null, rate: 0 })
    const [storeLimit, setStoreLimit] = useState(modalDefaultAdd)
    const [Price, setPrice] = useState(priceDefaultModal)

    // const prodCodeRef = useRef(null)
    const prodNameRef = useRef(null)
    const prodGroupRef = useRef(null)
    const prodUnitRef = useRef(null)
    const prodBarCodeRef = useRef(null)
    const packingRef = useRef(null)
    const contentRef = useRef(null)
    const designateRef = useRef(null)
    const contraindRef = useRef(null)
    const dosageRef = useRef(null)
    const manufactRef = useRef(null)
    const interactRef = useRef(null)
    const storagesRef = useRef(null)
    const effectRef = useRef(null)
    const overdoseRef = useRef(null)
    const rateParentRef = useRef(null)
    const rateRef = useRef(null)
    const storeCurrentRef = useRef(null)
    const LotNoRef = useRef(null)
    const importInvenPrice = useRef(null)
    const ExpDateRef = useRef(null)
    const minQtyRef = useRef(null)
    const maxQtyRef = useRef(null)
    const impPriceRef = useRef(null)
    const impVATRef = useRef(null)
    const priceRef = useRef(null)
    const wholePriceRef = useRef(null)
    const expVATRef = useRef(null)

    useHotkeys(
        'f2',
        () => {
            resetForm()
            setShouldOpenModal(true)
        },
        { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] }
    )
    useHotkeys(
        'f3',
        () => {
            if (process) return
            handleCreate()
        },
        { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] }
    )
    useHotkeys(
        'f4',
        () => {
            if (process) return
            handleCreate()
        },
        { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] }
    )
    useHotkeys(
        'esc',
        () => {
            if (process) return
            setShouldOpenModal(false)
            setProduct(productDefaulModal)
        },
        { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] }
    )

    const handleResultCreate = (reqInfoMap, message) => {
        console.log(reqInfoMap, message)
        setProcess(false)
        SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
        if (message['PROC_STATUS'] !== 1) {
            // xử lý thất bại
            const cltSeqResult = message['REQUEST_SEQ']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            control_sv.clearReqInfoMapRequest(cltSeqResult)
            setTimeout(() => {
                if (prodNameRef.current) prodNameRef.current.focus()
            }, 100)
        } else if (message['PROC_DATA']) {
            onRefresh()
            if (saveContinue.current) {
                resetForm()
                const newObj = Object.assign({}, productDefaulModal)
                newObj.productGroup = product.productGroup
                setProduct(newObj)
                setTimeout(() => {
                    if (prodNameRef.current) prodNameRef.current.focus()
                }, 100)
            } else {
                setShouldOpenModal(false)
            }
        }
    }

    //-- xử lý khi timeout -> ko nhận được phản hồi từ server
    const handleTimeOut = (e) => {
        setProcess(false)
        SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000)
    }

    const resetForm = () => {
        setInvoiceInventory({ lot_no: '', exp_dt: null, imp_price: 0 })
        setStoreLimit(modalDefaultAdd)
        setUnitRate({ unit: null, rate: 0 })
        setPrice(priceDefaultModal)
        setProduct(productDefaulModal)
    }

    const handleCreate = () => {
        if (process) return
        if (!product.name.trim() || !product.unit || !product.productGroup) return

        //-- check thông tin hàng tồn
        if (product.store_current > 0) {
            if (invoiceInventory.lot_no != undefined && invoiceInventory.lot_no.trim() !== '') {
                // Nếu nhóm sp thuộc loại cần nhập ngày hết hạn
                if (requireExpDate) {
                    // Đã nhập ngày hết hạn
                    if (!invoiceInventory.exp_dt) {
                        // Chưa nhập ngày hết hạn
                        SnackBarService.alert(t('message.require_exp_date'), true, 4, 3000)
                        return
                    }
                }
            } else {
                // Nhập sai format thông tin tồn kho
                SnackBarService.alert(t('message.require_inventory'), true, 4, 3000)
                return
            }
            if (invoiceInventory.imp_price < 0) {
                SnackBarService.alert(t('product.inven_price_cannot_less_zero'), true, 4, 3000)
                return
            }
        }

        // check min - max
        if (storeLimit.minQuantity < 0 || storeLimit.maxQuantity < 0) {
        } else if (storeLimit.minQuantity > 0 || storeLimit.maxQuantity > 0) {
            if (storeLimit.minQuantity >= storeLimit.maxQuantity && storeLimit.maxQuantity > 0) {
                SnackBarService.alert(t('message.require_store_limit'), true, 4, 3000)
                return
            }
        }

        // Check nhập thông tin giá
        if (
            Price.importPrice < 0 ||
            Price.price < 0 ||
            Price.wholePrice < 0 ||
            Price.importVAT < 0 ||
            Price.exportVAT < 0
        ) {
            SnackBarService.alert(t('message.price_not_correct'), true, 4, 3000)
            return
        }

        // Check đơn vị và giá trị chuyển đổi
        if (unitRate.unit !== null && unitRate.unit > 0) {
            if (unitRate?.rate <= 1) {
                // Nhập sai/thiếu format của đơn vị chuyển đổi
                SnackBarService.alert(t('message.require_unit_rate'), true, 4, 3000)
                return
            }
        }
        setProcess(true)

        // 0 -- id nhóm sp
        // 1 -- mã sp
        // 2 -- tên sp
        // 3 -- mã vạch
        // 4 -- đv tính nhỏ nhất
        // 5 -- thành phần - hợp chất
        // 6 -- chống chỉ định
        // 7 -- chỉ định
        // 8 -- liều lượng - cách dùng
        // 9 -- tương tác thuốc
        // 10 -- xuất xứ
        // 11 -- tác dụng phụ
        // 12 -- Quá liều và cách xử lý
        // 13 -- Điều kiện bảo quản
        // 14 -- Dạng bào chế và quy cách đóng gói

        // Cập nhật thông tin tồn kho
        // 15 -- Sl tồn
        // 16 -- Số lô
        // 17 -- Giá vốn
        // 18 -- Ngày hết hạn sd

        // Cập nhật Hạn mức kho
        // 19 -- Hạn mức kho tối thiểu
        // 20 -- Hạn mức kho tối đa

        // Cập nhật thông tin giá
        // 21 -- giá nhập
        // 22 -- VAT nhập (%)
        // 23 -- Giá bán lẻ
        // 24 -- Giá bán sỉ
        // 25 -- VAT xuất (%)

        // Cập nhật thông tin chuyển đổi đơn vị khác
        // 26 -- đơn vị 1
        // 27 -- tỷ lệ chuyển đổi 1

        const inputParam = [
            product.productGroup,
            !product.code || product.code.trim() === '' ? 'AUTO' : product.code.trim(),
            product.name,
            product.barcode,
            product.unit,
            product.content || '',
            product.contraind || '',
            product.designate || '',
            product.dosage || '',
            product.interact || '',
            product.manufact || '',
            product.effect || '',
            product.overdose || '',
            product.storages || '',
            product.packing || '',

            product.store_current || 0,
            invoiceInventory.lot_no || '',
            invoiceInventory.imp_price || 0,
            invoiceInventory.exp_dt ? moment(invoiceInventory.exp_dt).format('YYYYMMDD') : '',

            Number(storeLimit.minQuantity) || 0,
            Number(storeLimit.maxQuantity) || 0,

            Price.importPrice || 0,
            Price.importVAT || 0,
            Price.price || 0,
            Price.wholePrice || 0,
            Price.exportVAT || 0,

            unitRate.unit || 0,
            Number(unitRate.rate) || 0,
        ]
        sendRequest(serviceInfo.CREATE_PRODUCT, inputParam, handleResultCreate, true, handleTimeOut)
    }

    const checkValidate = () => {
        if (!!product?.name?.trim() && !!product?.productGroup && !!product?.unit) {
            return false
        }
        return true
    }

    const handleChange = (e) => {
        const newProduct = { ...product }
        newProduct[e.target.name] = e.target.value
        setProduct(newProduct)
    }

    const handleChangeExpandInfo = () => {
        setIsExpandedInfo((e) => !e)
    }
    const handleChangeExpandInfo2 = () => {
        setIsExpandedInfo2((e) => !e)
    }
    const handleChangeExpandInfo3 = () => {
        setIsExpandedInfo3((e) => !e)
    }

    const handleSelectProductGroup = (obj) => {
        const newProduct = { ...product }
        newProduct['productGroup'] = !!obj ? obj?.o_1 : null
        setRequireExpDate(!!obj ? glb_sv.defaultProductGroupId.includes(obj.o_2) : false)
        setProduct(newProduct)
    }

    const handleSelectUnit = (obj) => {
        const newProduct = { ...product }
        newProduct['unit'] = !!obj ? obj?.o_1 : null
        newProduct['unit_nm'] = !!obj ? obj?.o_2 : ''
        setProduct(newProduct)
    }

    const handleSelectUnitRate = (obj) => {
        const newUnitRate = { ...unitRate }
        newUnitRate['unit'] = !!obj ? obj?.o_1 : null
        setUnitRate(newUnitRate)
    }

    const handleChangeRate = (obj) => {
        const newUnitRate = { ...unitRate }
        newUnitRate['rate'] = Number(obj.value) >= 0 ? Number(obj.value) : Math.abs(Number(obj.value))
        setUnitRate(newUnitRate)
    }

    const handleMinQuantityChange = (obj) => {
        const newStoreLimit = { ...storeLimit }
        newStoreLimit['minQuantity'] = Number(obj.value) >= 0 ? Number(obj.value) : Math.abs(Number(obj.value))
        setStoreLimit(newStoreLimit)
    }

    const handleMaxQuantityChange = (obj) => {
        const newStoreLimit = { ...storeLimit }
        newStoreLimit['maxQuantity'] = Number(obj.value) >= 0 ? Number(obj.value) : Math.abs(Number(obj.value))
        setStoreLimit(newStoreLimit)
    }

    const handleStoreCurrentChange = (obj) => {
        const newProduct = { ...product }
        newProduct['store_current'] = Number(obj.value) >= 0 ? Number(obj.value) : Math.abs(Number(obj.value))
        setProduct(newProduct)
    }

    const handleImportPriceChange = (obj) => {
        const newPrice = { ...Price }
        newPrice['importPrice'] = Number(obj.value)
        setPrice(newPrice)
    }

    const handleImportVATChange = (obj) => {
        const newPrice = { ...Price }
        newPrice['importVAT'] = Number(obj.value) >= 0 && Number(obj.value) < 100 ? Math.round(obj.value) : 10
        setPrice(newPrice)
    }

    const handlePriceChange = (obj) => {
        const newPrice = { ...Price }
        newPrice['price'] = Number(obj.value) >= 0 ? Number(obj.value) : Math.abs(Number(obj.value))
        setPrice(newPrice)
    }

    const handleWholePriceChange = (obj) => {
        const newPrice = { ...Price }
        newPrice['wholePrice'] = Number(obj.value) >= 0 ? Number(obj.value) : Math.abs(Number(obj.value))
        setPrice(newPrice)
    }

    const handleExportVATChange = (obj) => {
        const newPrice = { ...Price }
        newPrice['exportVAT'] = Number(obj.value) >= 0 && Number(obj.value) < 100 ? Math.round(obj.value) : 10
        setPrice(newPrice)
    }

    const handleInvoiceChange = (e) => {
        const newInvoice = { ...invoiceInventory }
        newInvoice[e.target.name] = e.target.value
        setInvoiceInventory(newInvoice)
    }

    const handleChangeInvenPrice = (obj) => {
        const newInvoice = { ...invoiceInventory }
        newInvoice['imp_price'] = Number(obj.value)
        setInvoiceInventory(newInvoice)
    }

    const handleExpDateChange = (date) => {
        console.log(date)
        const newInvoice = { ...invoiceInventory }
        newInvoice['exp_dt'] = date
        setInvoiceInventory(newInvoice)
    }

    return (
        <>
            <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                    resetForm()
                    setShouldOpenModal(true)
                }}
                style={{ color: 'var(--white)', border: '1px solid white', maxHeight: 22 }}
            >
                {t('btn.add')} (F2)
            </Button>
            <Dialog fullWidth={true} maxWidth="md" open={shouldOpenModal}>
                <Card className="product-card">
                    <CardHeader title={t('product.titleAdd')} />
                    <CardContent className="cardContent_modal">
                        <Grid container spacing={1}>
                            <Grid item xs={6} sm={3} md={3}>
                                <TextField
                                    fullWidth={true}
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    margin="dense"
                                    label={t('product.name')}
                                    onChange={handleChange}
                                    value={product.name}
                                    name="name"
                                    variant="outlined"
                                    className="uppercaseInput"
                                    inputRef={prodNameRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            prodGroupRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3} className="d-flex align-items-center">
                                <ProductGroupAdd_Autocomplete
                                    required={true}
                                    size={'small'}
                                    label={t('menu.productGroup')}
                                    onSelect={handleSelectProductGroup}
                                    inputRef={prodGroupRef}
                                    productGroupID={product.productGroup}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            prodUnitRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3} className="d-flex align-items-center">
                                <UnitAdd_Autocomplete
                                    required={true}
                                    unitID={product.unit}
                                    size={'small'}
                                    label={t('product.minUnit')}
                                    onSelect={handleSelectUnit}
                                    inputRef={prodUnitRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            prodBarCodeRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3} md={3}>
                                <Tooltip placement="top" title={t('product.tooltip.barcode')} arrow>
                                    <TextField
                                        fullWidth={true}
                                        autoComplete="off"
                                        margin="dense"
                                        label={t('product.barcode')}
                                        onChange={handleChange}
                                        value={product.barcode}
                                        name="barcode"
                                        variant="outlined"
                                        inputRef={prodBarCodeRef}
                                        onKeyPress={(event) => {
                                            if (event.key === 'Enter') {
                                                contentRef.current.focus()
                                            }
                                        }}
                                    />
                                </Tooltip>
                            </Grid>
                        </Grid>
                        <Divider orientation="horizontal" />
                        <Grid container spacing={1}>
                            <Grid item xs={6} sm={4} md={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.content')}
                                    onChange={handleChange}
                                    value={product.content}
                                    name="content"
                                    variant="outlined"
                                    inputRef={contentRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            setTimeout(() => {
                                                designateRef.current.focus()
                                            }, 10)
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4} md={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.designate')}
                                    onChange={handleChange}
                                    value={product.designate}
                                    name="designate"
                                    variant="outlined"
                                    inputRef={designateRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            contraindRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4} md={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.contraind')}
                                    onChange={handleChange}
                                    value={product.contraind}
                                    name="contraind"
                                    variant="outlined"
                                    inputRef={contraindRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            packingRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={1}>
                            <Grid item xs={6} sm={4} md={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.packing')}
                                    onChange={handleChange}
                                    value={product.packing}
                                    name="packing"
                                    variant="outlined"
                                    inputRef={packingRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            dosageRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4} md={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.dosage')}
                                    onChange={handleChange}
                                    value={product.dosage}
                                    name="dosage"
                                    variant="outlined"
                                    inputRef={dosageRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            manufactRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4} md={4}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.manufact')}
                                    onChange={handleChange}
                                    value={product.manufact}
                                    name="manufact"
                                    variant="outlined"
                                    inputRef={manufactRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            interactRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={3} md={3}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.interact')}
                                    onChange={handleChange}
                                    value={product.interact}
                                    name="interact"
                                    variant="outlined"
                                    inputRef={interactRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            storagesRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3} md={3}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.storages')}
                                    onChange={handleChange}
                                    value={product.storages}
                                    name="storages"
                                    variant="outlined"
                                    inputRef={storagesRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            effectRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3} md={3}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.effect')}
                                    onChange={handleChange}
                                    value={product.effect}
                                    name="effect"
                                    variant="outlined"
                                    inputRef={effectRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            overdoseRef.current.focus()
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3} md={3}>
                                <TextField
                                    fullWidth={true}
                                    margin="dense"
                                    autoComplete="off"
                                    label={t('product.overdose')}
                                    onChange={handleChange}
                                    value={product.overdose}
                                    name="overdose"
                                    variant="outlined"
                                    inputRef={overdoseRef}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            setIsExpandedInfo(true)
                                            setTimeout(() => {
                                                storeCurrentRef.current.focus()
                                            }, 500)
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Divider orientation="horizontal" />
                        <Accordion expanded={isExpandedInfo} onChange={handleChangeExpandInfo}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1bh-content"
                                id="panel1bh-header"
                                height="50px"
                            >
                                <Typography className="" style={{ color: '#085da7' }}>
                                    {t('product.inven_info')}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={1} className="pt-0">
                                    <Grid item xs={12} sm={3} md={3}>
                                        <NumberFormat
                                            className="inputNumber"
                                            style={{ width: '100%' }}
                                            value={product.store_current}
                                            label={t('product.store_current')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleStoreCurrentChange}
                                            onFocus={(e) => e.target.select()}
                                            inputRef={storeCurrentRef}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    importInvenPrice.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2} md={2}>
                                        <TextField
                                            disabled={true}
                                            fullWidth={true}
                                            margin="dense"
                                            autoComplete="off"
                                            label={t('min_unit')}
                                            value={product.unit_nm || ''}
                                            name="unit_nm"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2} md={2}>
                                        <NumberFormat
                                            className="inputNumber"
                                            style={{ width: '100%' }}
                                            value={invoiceInventory.imp_price}
                                            label={t('product.inven_price')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleChangeInvenPrice}
                                            onFocus={(e) => e.target.select()}
                                            inputRef={importInvenPrice}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    LotNoRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2} md={2}>
                                        <TextField
                                            fullWidth={true}
                                            margin="dense"
                                            required={product.store_current > 0}
                                            autoComplete="off"
                                            label={t('order.import.lot_no')}
                                            onChange={handleInvoiceChange}
                                            value={invoiceInventory.lot_no || ''}
                                            name="lot_no"
                                            variant="outlined"
                                            inputRef={LotNoRef}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    ExpDateRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3} md={3}>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <KeyboardDatePicker
                                                required={requireExpDate}
                                                disableToolbar
                                                margin="dense"
                                                variant="outlined"
                                                style={{ width: '100%' }}
                                                inputVariant="outlined"
                                                format="dd/MM/yyyy"
                                                id="exp_dt-picker-inline"
                                                label={t('order.import.exp_dt')}
                                                value={invoiceInventory.exp_dt}
                                                onChange={handleExpDateChange}
                                                KeyboardButtonProps={{
                                                    'aria-label': 'change date',
                                                }}
                                                inputRef={ExpDateRef}
                                                onKeyPress={(event) => {
                                                    if (event.key === 'Enter') {
                                                        setIsExpandedInfo2(true)
                                                        setTimeout(() => {
                                                            minQtyRef.current.focus()
                                                        }, 500)
                                                    }
                                                }}
                                            />
                                        </MuiPickersUtilsProvider>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={isExpandedInfo2} onChange={handleChangeExpandInfo2}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel2bh-content"
                                id="panel2bh-header"
                                height="50px"
                            >
                                <Typography className="" style={{ color: '#085da7' }}>
                                    {t('product.price_info')}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails className="pt-0">
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={3} md={3}>
                                        <Tooltip placement="top" title={t('product.tooltip.minmax_notinput')} arrow>
                                            <NumberFormat
                                                className="inputNumber"
                                                style={{ width: '100%' }}
                                                value={storeLimit.minQuantity}
                                                label={t('config.store_limit.minQuantity')}
                                                customInput={TextField}
                                                autoComplete="off"
                                                margin="dense"
                                                type="text"
                                                variant="outlined"
                                                thousandSeparator={true}
                                                onValueChange={handleMinQuantityChange}
                                                onFocus={(e) => e.target.select()}
                                                inputRef={minQtyRef}
                                                onKeyPress={(event) => {
                                                    if (event.key === 'Enter') {
                                                        maxQtyRef.current.focus()
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={12} sm={3} md={3}>
                                        <Tooltip placement="top" title={t('product.tooltip.minmax_notinput')} arrow>
                                            <NumberFormat
                                                className="inputNumber"
                                                style={{ width: '100%' }}
                                                value={storeLimit.maxQuantity}
                                                label={t('config.store_limit.maxQuantity')}
                                                customInput={TextField}
                                                autoComplete="off"
                                                margin="dense"
                                                type="text"
                                                variant="outlined"
                                                thousandSeparator={true}
                                                onValueChange={handleMaxQuantityChange}
                                                onFocus={(e) => e.target.select()}
                                                inputRef={maxQtyRef}
                                                onKeyPress={(event) => {
                                                    if (event.key === 'Enter') {
                                                        impPriceRef.current.focus()
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={12} sm={2} md={2}>
                                        <TextField
                                            disabled={true}
                                            fullWidth={true}
                                            margin="dense"
                                            autoComplete="off"
                                            label={t('min_unit')}
                                            value={product.unit_nm || ''}
                                            name="unit_nm"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2} md={2}>
                                        <NumberFormat
                                            className="inputNumber"
                                            style={{ width: '100%' }}
                                            value={Price.importPrice || 0}
                                            label={t('config.price.importPrice')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleImportPriceChange}
                                            inputRef={impPriceRef}
                                            onFocus={(e) => e.target.select()}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    impVATRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2} md={2}>
                                        <NumberFormat
                                            className="inputNumber"
                                            style={{ width: '100%' }}
                                            value={Price.importVAT || 0}
                                            label={t('config.price.importVAT')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            suffix="%"
                                            thousandSeparator={true}
                                            onValueChange={handleImportVATChange}
                                            inputRef={impVATRef}
                                            onFocus={(e) => e.target.select()}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    priceRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4}>
                                        <NumberFormat
                                            className="inputNumber"
                                            style={{ width: '100%' }}
                                            value={Price.price || 0}
                                            label={t('config.price.price')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handlePriceChange}
                                            inputRef={priceRef}
                                            onFocus={(e) => e.target.select()}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    wholePriceRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4}>
                                        <NumberFormat
                                            className="inputNumber"
                                            style={{ width: '100%' }}
                                            value={Price.wholePrice || 0}
                                            label={t('config.price.wholePrice')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleWholePriceChange}
                                            inputRef={wholePriceRef}
                                            onFocus={(e) => e.target.select()}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    expVATRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4}>
                                        <NumberFormat
                                            className="inputNumber"
                                            style={{ width: '100%' }}
                                            value={Price.exportVAT || 0}
                                            label={t('config.price.exportVAT')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            suffix="%"
                                            thousandSeparator={true}
                                            onValueChange={handleExportVATChange}
                                            inputRef={expVATRef}
                                            onFocus={(e) => e.target.select()}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    setIsExpandedInfo3(true)
                                                    setTimeout(() => {
                                                        rateParentRef.current.focus()
                                                    }, 500)
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={isExpandedInfo3} onChange={handleChangeExpandInfo3}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel3bh-content"
                                id="panel3bh-header"
                                height="50px"
                            >
                                <Typography className="" style={{ color: '#085da7' }}>
                                    {t('product.unit_info')}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails className="pt-0">
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={4} md={4}>
                                        <Unit_Autocomplete
                                            unitID={unitRate.unit || null}
                                            style={{ marginTop: 8, marginBottom: 4 }}
                                            size={'small'}
                                            label={t('config.price.unit')}
                                            onSelect={handleSelectUnitRate}
                                            inputRef={rateParentRef}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    rateRef.current.focus()
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4}>
                                        <NumberFormat
                                            className="inputNumber"
                                            style={{ width: '100%' }}
                                            required
                                            value={unitRate.rate || 0}
                                            label={t('config.unitRate.rate')}
                                            customInput={TextField}
                                            autoComplete="off"
                                            margin="dense"
                                            type="text"
                                            variant="outlined"
                                            thousandSeparator={true}
                                            onValueChange={handleChangeRate}
                                            onFocus={(e) => e.target.select()}
                                            inputRef={rateRef}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    handleCreate()
                                                }
                                            }}
                                            inputProps={{
                                                min: 0,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4}>
                                        <TextField
                                            disabled={true}
                                            fullWidth={true}
                                            margin="dense"
                                            autoComplete="off"
                                            label={t('min_unit')}
                                            value={product.unit_nm || ''}
                                            name="unit_nm"
                                            variant="outlined"
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        <Grid container>
                            <span className="required_note">(*) {t('required_note')}</span>
                        </Grid>
                    </CardContent>
                    <CardActions className="align-items-end" style={{ justifyContent: 'flex-end' }}>
                        <Button
                            size="small"
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
                            size="small"
                            onClick={() => {
                                if (process) return
                                saveContinue.current = false
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
                                if (process) return
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
                            {t('save_continue')} (F4)
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </>
    )
}

export default ProductAdd
