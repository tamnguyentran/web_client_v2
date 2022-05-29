import React from 'react'
import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'
import { Tooltip, Chip } from '@material-ui/core'
import * as XLSX from "xlsx"
// import { ReactComponent as IC_EXCEL } from '../../asset/images/excel.svg'
import GetAppIcon from '@material-ui/icons/GetApp'
import { ExportSheet } from 'react-xlsx-sheet'

const ExportExcel = ({ filename = '', data = [], headers = [], styleSvg = {}, ...props }) => {
    headers.forEach((item)=>{
        item['title'] = item['label']
        item['dataIndex'] = item['key']
        delete item['label']
        delete item['key']
    })
    const { t } = useTranslation()

    return (
        <ExportSheet fileName={filename} dataSource={data} header={headers} xlsx={XLSX} isRequiredNameDate={false}>
            <Tooltip title={t('exportExcel')} className="tooltip-override">
                <Chip
                    {...props}
                    size="small"
                    className="mr-1"
                    deleteIcon={<GetAppIcon />}
                    onDelete={() => null}
                    label={t('exportExcel')}
                    variant="outlined"
                />
            </Tooltip>
        </ExportSheet>
    )
}

export default ExportExcel
