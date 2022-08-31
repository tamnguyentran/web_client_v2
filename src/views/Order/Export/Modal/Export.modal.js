import moment from 'moment'
import reqFunction from '../../../../utils/constan/functions';
import glb_sv from "../../../../utils/service/global_service";


const tableColumn = [
    { field: 'stt', title: 'STT', show: true, disabled: true, minWidth: 100 },
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'order.export.invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'order.export.invoice_stat_nm', show: true, disabled: false, minWidth: 200, type: 'status' },
    { field: 'o_5', title: 'order.export.cust_nm_v', show: true, disabled: false, minWidth: 200 },
    { field: 'o_6', title: 'order.export.order_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_7', title: 'order.export.input_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    // { field: 'o_8', title: 'order.export.staff_nm', show: true, disabled: false, minWidth: 200 },
    { field: 'o_9', title: 'order.export.cancel_reason', show: false, disabled: false, minWidth: 200 },
    { field: 'o_10', title: 'order.export.note', show: false, disabled: false, minWidth: 100 },
    { field: 'o_11', title: 'order.export.total_prod', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_12', title: 'order.export.invoice_val', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_13', title: 'order.export.invoice_discount', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_14', title: 'order.export.invoice_vat', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_15', title: 'order.export.invoice_settl', show: false, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_16', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_17', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const config = {
    biz: 'export',
    screenName: 'export',
    object: 'exp_invoices',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.EXPORT_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.EXPORT_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.EXPORT_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.EXPORT_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.EXPORT_DELETE
    },
}

const productExportModal = {
    invoice_id: '',
    exp_tp: '1',
    exp_tp_nm: '',
    exp_dt: null,
    prod_id: null,
    prod_nm: '',
    lot_no: '',
    qty: 0,
    unit_id: null,
    unit_nm: '',
    price: 0,
    discount_per: 0,
    vat_per: 0,
    quantity_in_stock: null
}

const tableListAddColumn = [
        { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
        { field: 'o_5', title: 'order.export.prod_nm', show: true, disabled: false, minWidth: 100 },
        { field: 'o_6', title: 'order.export.lot_no', show: true, disabled: false, minWidth: 100 },
        { field: 'o_3', title: 'order.export.exp_tp_nm', show: true, disabled: false, minWidth: 100 },
        { field: 'o_7', title: 'order.export.qty', show: true, disabled: true, minWidth: 100, align: 'right' },
        { field: 'o_9', title: 'order.export.unit_nm', show: true, disabled: false, minWidth: 100 },
        { field: 'o_10', title: 'order.export.price', show: true, disabled: false, minWidth: 100, align: 'right' },
        { field: 'o_11', title: 'order.export.discount_per', show: true, disabled: false, minWidth: 100, align: 'right' },
        { field: 'o_12', title: 'order.export.vat_per', show: true, disabled: false, minWidth: 100, align: 'right' },
        { field: 'action', title: '', show: true, disabled: false, minWidth: 100, align: 'center' },
    ]
    // test
const tableListAddColumn1 = [
        { field: 'stt', title: 'stt',tootip: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
        { field: 'o_3', title: 'order.export.exp_tp_nm', tootip: 'order.export.exp_tp_nm', show: true, disabled: false, minWidth: 100, align: 'center' },
        { field: 'o_5', title: 'order.export.name_product',tootip: 'order.export.prod_nm', show: false, disabled: false, minWidth: 100, align: 'center' },
        { field: 'o_6', title: 'order.export.lot_no',tootip: 'order.export.lot_no', show: true, disabled: true, minWidth: 100, align: 'center' },
        { field: 'o_14', title: 'order.export.HSD',tootip: 'order.export.exp_dt', show: false, disabled: false, minWidth: 100, align: 'center' },
        { field: 'o_7', title: 'order.export.export_quantity',tootip: 'order.export.qty', show: true, disabled: true, minWidth: 100, align: 'center',type: 'currency' },
        { field: 'o_9', title: 'order.export.unit',tootip: 'order.export.unit_nm', show: true, disabled: true, minWidth: 200, align: 'center' },
        { field: 'o_10', title: 'order.export.price',tootip: 'order.export.price', show: true, disabled: true, minWidth: 100, align: 'center', type: 'currency'},
        { field: 'o_11', title: '%CK',tootip: 'order.export.discount_per', show: false, disabled: false, minWidth: 100, align: 'center' },
        { field: 'o_12', title: 'order.export.vat_per',tootip: 'order.export.vat_per', show: true, disabled: true, minWidth: 100, align: 'center' },
        { field: 'action', title: 'order.export.action', show: true, disabled: true, minWidth: 100, align: 'center' },
    ]

    const tableListAddColumn2 = [
        { field: 'stt', title: 'STT',tooltip: 'STT', show: true, disabled: true, minWidth: 100, align: 'center' },
        // { field: 'o_4', title: 'MÃ SP/SKU', tooltip: 'MÃ SP/SKU', show: true, disabled: false, minWidth: 100, align: 'center' },
        { field: 'o_3', title: 'LOẠI HÌNH XUẤT', tooltip: 'LOẠI HÌNH XUẤT', show: true, disabled: false, minWidth: 100, align: 'center' },
        { field: 'o_5', title: 'TÊN SP',tooltip: 'TÊN SP', show: true, disabled: false, minWidth: 100, align: 'center' },
        { field: 'o_6', title: 'SỐ LÔ',tooltip: 'SỐ LÔ', show: true, disabled: true, minWidth: 100, align: 'center' },
        { field: 'o_8', title: 'SỐ LƯỢNG',tooltip: 'SỐ LƯỢNG', show: true, disabled: true, minWidth: 100, align: 'center',type: 'currency' },
        { field: 'o_10', title: 'ĐƠN VỊ',tooltip: 'ĐƠN VỊ', show: true, disabled: true, minWidth: 200, align: 'center' },
        { field: 'o_11', title: 'GIÁ',tooltip: 'GIÁ', show: true, disabled: true, minWidth: 100, align: 'center', type: 'currency'},
        { field: 'action', title: 'XÓA',tooltip: 'XÓA', show: true, disabled: false, minWidth: 100, align: 'center' },
    ]
    //test
const tableListEditColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'o_5', title: 'order.export.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_6', title: 'order.export.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_3', title: 'order.export.exp_tp_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'o_7', title: 'order.export.qty', show: true, disabled: true, minWidth: 100, type: 'number', align: 'center' },
    { field: 'o_9', title: 'order.export.unit_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'o_10', title: 'order.export.price', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_12', title: 'order.export.vat_per', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_11', title: 'order.export.discount_per', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    // { field: 'o_13', title: 'updateUser', show: false, disabled: false, minWidth: 100, type: 'date' },
    // { field: 'o_14', title: 'updateDate', show: false, disabled: false, minWidth: 100, type: 'date' },
    { field: 'action', title: '', show: true, disabled: false, minWidth: 100, align: 'center' }
]

const invoiceExportModal = {
    invoice_id: null,
    order_dt: glb_sv.endDay,
    customer: null,
    customer_id: null,
    invoice_no: '',
    staff_exp: '',
    invoice_val: 0,
    invoice_discount: 0,
    invoice_vat: 0,
    invoice_settl: 0,
    payment_amount: 0,
    note: '',
    discount_tp:"1"
}

const searchDefaultModal = {
    group_id: 0,
    group_nm: '',
    lot_no: '',
    invent_yn: 'Y',
    last_product_id: 999999999999,
    last_lot_no_id: 'ZZZ',
}

const searchDefaultModalInvoice = {
    start_dt: moment().format("YYYYMMDD"),
    end_dt: moment().format("YYYYMMDD"),
    last_id: 999999999999,
}

const defaultDataUpdateProduct = {
    expQty: 1,
    expPrice: 0,
}

export {
    searchDefaultModal,
    invoiceExportModal,
    tableListAddColumn,
    tableListAddColumn1,
    tableListEditColumn,
    productExportModal,
    tableColumn,
    config,
    defaultDataUpdateProduct,
    searchDefaultModalInvoice,
    tableListAddColumn2
}