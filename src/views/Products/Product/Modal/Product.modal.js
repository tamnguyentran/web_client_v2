import reqFunction from '../../../../utils/constan/functions'

const tableColumn = [
    { field: 'stt', title: 'STT', show: true, disabled: true, minWidth: 100 },
    { field: 'action', title: 'lbl.action', show: true, disabled: true, minWidth: 100 },
    // { field: 'o_4', title: 'product.code', show: false, disabled: true, minWidth: 100 },
    { field: 'o_19', title: 'Hình ảnh', show: true, disabled: true, minWidth: 200 },
    { field: 'o_5', title: 'product.name', show: true, disabled: true, minWidth: 200 },
    { field: 'o_3', title: 'menu.productGroup', show: true, disabled: true, minWidth: 200 },
    { field: 'o_18', title: 'menu.configMinUnit', show: true, disabled: false, minWidth: 200 },
    { field: 'o_6', title: 'product.barcode', show: false, disabled: false, minWidth: 100 },
    { field: 'o_7', title: 'product.content', show: true, disabled: false, minWidth: 300 },
    { field: 'o_9', title: 'product.designate', show: true, disabled: false, minWidth: 300 },
    { field: 'o_8', title: 'product.contraind', show: true, disabled: false, minWidth: 300 },
    { field: 'o_15', title: 'product.packing', show: false, disabled: false, minWidth: 300 },
    { field: 'o_10', title: 'product.dosage', show: false, disabled: false, minWidth: 300 },
    { field: 'o_12', title: 'product.manufact', show: true, disabled: false, minWidth: 300 },
    { field: 'o_11', title: 'product.interact', show: false, disabled: false, minWidth: 300 },
    { field: 'o_16', title: 'product.storages', show: false, disabled: false, minWidth: 300 },
    { field: 'o_13', title: 'product.effect', show: false, disabled: false, minWidth: 300 },
    { field: 'o_14', title: 'product.overdose', show: false, disabled: false, minWidth: 300 },
    { field: 'o_20', title: 'createdUser', show: true, disabled: false, minWidth: 100 },
    { field: 'o_21', title: 'createdDate', show: true, disabled: false, minWidth: 100, type: 'date' },
    { field: 'o_22', title: 'titleBranch', show: false, disabled: false, minWidth: 100 },
    { field: 'o_23', title: 'product.block_yn', show: false, disabled: false, minWidth: 1 },
]

const config = {
    biz: 'common',
    moduleName: 'common',
    screenName: 'product',
    object: 'products',
    list: {
        functionName: 'get_all',
        operation: 'Q',
        reqFunct: reqFunction.PRODUCT_LIST,
    },
    byId: {
        functionName: 'get_by_id',
        operation: 'Q',
        reqFunct: reqFunction.PRODUCT_BY_ID,
    },
    insert: {
        functionName: 'insert',
        operation: 'I',
        reqFunct: reqFunction.PRODUCT_ADD,
    },
    update: {
        functionName: 'update',
        operation: 'U',
        reqFunct: reqFunction.PRODUCT_UPDATE,
    },
    delete: {
        functionName: 'delete',
        operation: 'D',
        reqFunct: reqFunction.PRODUCT_DELETE,
    },
}

const productDefaulModal = {
    barcode: '',
    code: '',
    content: '',
    contraind: '',
    designate: '',
    dosage: '',
    effect: '',
    interact: '',
    manufact: '',
    name: '',
    overdose: '',
    packing: '',
    productGroup: null,
    storages: '',
    store_current: 0,
    unit: null,
    unit_nm: '',
}

export { productDefaulModal, tableColumn, config }
