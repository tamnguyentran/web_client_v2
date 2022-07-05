import moment from 'moment';
import reqFunction from '../../../../utils/constan/functions';

const tableColumn = [
    { field: 'stt', title: 'STT', show: true, disabled: true, minWidth: 100 },
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    { field: 'o_2', title: 'order.import.invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'order.import.invoice_stat', show: true, disabled: false, minWidth: 200, type: 'status' },
    { field: 'o_4', title: 'order.import.total_prod', show: true, disabled: false, minWidth: 200, type: 'number', align: 'right' },
    { field: 'o_5', title: 'order.import.invoice_val', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_6', title: 'order.import.cancel_reason', show: false, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'order.import.note', show: false, disabled: false, minWidth: 300 },
    { field: 'o_8', title: 'order.import.input_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_9', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_10', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const config = {
    biz: 'import',
    screenName: 'import_inventory',
    object: 'imp_inventory',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.IMPORT_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.IMPORT_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.IMPORT_CREATE,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.IMPORT_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.IMPORT_DELETE
    },
}

const productImportModal = {
    invoice_id: null,
    edit_id: null,
    prod_id: null,
    prod_nm: '',
    lot_no: '',
    made_dt: moment().format('YYYYMMDD'),
    exp_dt: null,
    qty: 0,
    unit_id: null,
    unit_nm: '',
    price: 0
}

const invoiceImportInventoryModal = {
    invoice_no: '',
    note: ''
}

const tableListAddColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'o_4', title: 'order.import.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_5', title: 'order.import.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_8', title: 'order.import.qty', show: true, disabled: true, minWidth: 100, align: 'right', type: 'number' },
    { field: 'o_10', title: 'order.import.unit_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_11', title: 'order.import.price', show: true, disabled: false, minWidth: 100, align: 'right', type: 'number' },
    { field: 'o_7', title: 'order.import.exp_dt', show: true, disabled: false, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'action', title: '', show: true, disabled: false, minWidth: 100, align: 'center' },
]

const tableListEditColumn = [
    { field: 'stt', title: 'stt', show: true, disabled: true, minWidth: 100, align: 'center' },
    { field: 'o_4', title: 'order.import.prod_nm', show: true, disabled: false, minWidth: 100 },
    { field: 'o_5', title: 'order.import.lot_no', show: true, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'order.import.exp_dt', show: true, disabled: true, minWidth: 100, type: 'dated', align: 'center' },
    { field: 'o_8', title: 'order.import.qty', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'center' },
    { field: 'o_10', title: 'order.import.unit_nm', show: true, disabled: false, minWidth: 100, align: 'center'},
    { field: 'o_11', title: 'order.import.price', show: true, disabled: false, minWidth: 100, type: 'currency', align: 'center' },
    // { field: 'o_12', title: 'updateUser', show: false, disabled: false, minWidth: 100, type: 'date' },
    // { field: 'o_13', title: 'updateDate', show: false, disabled: false, minWidth: 100, type: 'date' },
    { field: 'action', title: 'order.export.action', show: true, disabled: true, minWidth: 100, align: 'center' }

]


export {
    tableListAddColumn,
    tableListEditColumn,
    invoiceImportInventoryModal,
    productImportModal,
    tableColumn,
    config
}