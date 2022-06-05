import moment from 'moment'

const tableColumn = [
    { field: 'stt', title: 'STT', show: true, disabled: true, minWidth: 100 },
    { field: 'o_3', title: 'invoice_no', show: true, disabled: true, minWidth: 200 },
    { field: 'o_4', title: 'partner.supplier.vender_nm_v', show: true, disabled: true, minWidth: 200},
    { field: 'o_6', title: 'report.amount_received', show: true, disabled: true, minWidth: 100, type: 'currency', align: 'right' },
    { field: 'o_8', title: 'report.payment_method', show: true, disabled: true, minWidth: 100 },
    { field: 'o_9', title: 'report.payment_date', show: true, disabled: true, minWidth: 100,type: 'dated', align: 'center' },
    { field: 'o_18', title: 'note', show: true, disabled: false, minWidth: 300 },
    { field: 'o_19', title: 'updateUser', show: true, disabled: false, minWidth: 200 },
    { field: 'o_20', title: 'updateDate', show: true, disabled: false, minWidth: 100, type: 'date', align: 'center' }
]

const searchDefaultModal = {
    start_dt: moment().subtract(1, 'months').format('YYYYMMDD'),
    end_dt: moment().format('YYYYMMDD'),
    supplier_id: 0,
    supplier_nm: '',
    invoice_no: '%',
    last_invoice_id: 999999999999,
    last_invoice_detail_id: 999999999999
}

export {
    searchDefaultModal,
    tableColumn
}