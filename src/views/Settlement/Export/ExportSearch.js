import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { Grid, Button } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import LoopIcon from '@material-ui/icons/Loop'

import {
    TitleFilterCpn,
    Wrapper,
    IconButtonCpn,
    ButtonCpn,
    DatePickerCpn
  } from "../../../basicComponents";

const ExportSearch = ({ handleSearch, process = false }) => {
    const { t } = useTranslation()

    const [searchModal, setSearchModal] = useState({
        start_dt: moment().subtract(1, 'months').toString(),
        end_dt: moment().toString(),
    })

    const handleStartDateChange = (date) => {
        const newSearchModal = { ...searchModal }
        newSearchModal['start_dt'] = date
        setSearchModal(newSearchModal)
    }

    const handleEndDateChange = (date) => {
        const newSearchModal = { ...searchModal }
        newSearchModal['end_dt'] = date
        setSearchModal(newSearchModal)
    }

    return (
        <>
            {/* <Grid container spacing={2}>
                <Grid item xs={3}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            margin="dense"
                            variant="outlined"
                            style={{ width: '100%' }}
                            inputVariant="outlined"
                            format="dd/MM/yyyy"
                            id="order_dt-picker-inline"
                            label={t('order.export.start_date')}
                            value={searchModal.start_dt}
                            onChange={handleStartDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={3}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            margin="dense"
                            variant="outlined"
                            style={{ width: '100%' }}
                            inputVariant="outlined"
                            format="dd/MM/yyyy"
                            id="order_dt-picker-inline"
                            label={t('order.export.end_date')}
                            value={searchModal.end_dt}
                            onChange={handleEndDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={3} className="align-items-center d-flex">
                    <Button
                        className={process ? 'button-loading' : ''}
                        endIcon={process ? <LoopIcon /> : <SearchIcon />}
                        onClick={() => handleSearch(searchModal)}
                        variant="contained"
                    >
                        {t('search_btn')}
                    </Button>
                </Grid>
            </Grid> */}
            <div className="mb-4">
          <TitleFilterCpn className="mb-2" label="Lọc theo thời gian" />
          <DatePickerCpn
            label="Ngày bắt đầu"
            className="mb-1"
            value={searchModal.start_dt}
            onChange={handleStartDateChange}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
          />
          <DatePickerCpn
            label="Ngày kết thúc"
            value={searchModal.end_dt}
            onChange={handleEndDateChange}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
          />
        </div>
        </>
    )
}

export default ExportSearch
