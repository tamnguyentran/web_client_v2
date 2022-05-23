import moment from 'moment'
import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'stt', title: 'STT', show: true, disabled: true, minWidth: 100 },
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'order.exportRepay.invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'order.exportRepay.invoice_stat_nm', show: true, disabled: false, minWidth: 200, type: 'status' },
    { field: 'o_5', title: 'order.exportRepay.supplier_nm', show: true, disabled: false, minWidth: 200 },
    { field: 'o_6', title: 'order.exportRepay.order_dt', show: false, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    // { field: 'o_7', title: 'order.exportRepay.input_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    // { field: 'o_8', title: 'order.exportRepay.staff_nm', show: true, disabled: false, minWidth: 200 },
    { field: 'o_9', title: 'order.exportRepay.cancel_reason', show: false, disabled: false, minWidth: 200 },
    { field: 'o_10', title: 'order.exportRepay.note', show: false, disabled: false, minWidth: 100 },
    { field: 'o_11', title: 'order.exportRepay.total_prod', show: true, disabled: false, minWidth: 100, type: 'number', align: 'right' },
    { field: 'o_12', title: 'order.exportRepay.invoice_val', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_13', title: 'order.exportRepay.invoice_discount', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_14', title: 'order.exportRepay.invoice_vat', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    // { field: 'o_15', title: 'order.exportRepay.invoice_settl', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_15', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_16', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const config = {
    biz: 'export',
    screenName: 'exportRepay',
    object: 'exp_repay',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.EXPORT_REPAY_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.EXPORT_REPAY_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.EXPORT_REPAY_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.EXPORT_REPAY_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.EXPORT_REPAY_DELETE
    },
}

const productExportRepayModal = {
    invoice_id: '',
    exp_dt: null,
    prod_id: null,
    prod_nm: '',
    lot_no: '',
    qty: 0,
    unit_id: null,
    unit_nm: '',
    price: 0,
    discount_per: 0,
    payment_amount: 0,
    vat_per: 0,
    quantity_in_stock: null
}

const tableListAddColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'o_3', title: 'order.exportRepay.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_4', title: 'order.exportRepay.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_5', title: 'order.exportRepay.qty', show: true, disabled: true, minWidth: 100, align: 'right' },
    { field: 'o_7', title: 'order.exportRepay.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'order.exportRepay.price', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'o_9', title: 'order.exportRepay.discount_per', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'o_10', title: 'order.exportRepay.vat_per', show: true, disabled: false, minWidth: 100, align: 'right' },
    { field: 'action', title: '', show: true, disabled: false, minWidth: 100, align: 'center' },
]

const tableListEditColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'o_3', title: 'order.exportRepay.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_4', title: 'order.exportRepay.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_5', title: 'order.exportRepay.qty', show: true, disabled: true, minWidth: 100, type: 'number', align: 'center' },
    { field: 'o_7', title: 'order.exportRepay.unit_nm', show: true, disabled: true, minWidth: 100 },
    { field: 'o_8', title: 'order.exportRepay.price', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_9', title: 'order.exportRepay.discount_per', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_10', title: 'order.exportRepay.vat_per', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    // { field: 'o_11', title: 'updateUser', show: false, disabled: false, minWidth: 100, type: 'date' },
    // { field: 'o_12', title: 'updateDate', show: false, disabled: false, minWidth: 100, type: 'date' },
    { field: 'action', title: '', show: true, disabled: false, minWidth: 100, align: 'center' }
]

const invoiceExportRepayModal = {
    invoice_id: null,
    order_dt: moment().toString(),
    supplier: null,
    invoice_no: '',
    staff_exp: '',
    invoice_val: 0,
    invoice_discount: 0,
    invoice_vat: 0,
    invoice_settl: 0,
    note: ''
}

export {
    invoiceExportRepayModal,
    tableListAddColumn,
    tableListEditColumn,
    productExportRepayModal,
    tableColumn,
    config
}