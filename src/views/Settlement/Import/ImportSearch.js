import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Button, TextField } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import moment from 'moment'
import SearchIcon from '@material-ui/icons/Search'
import LoopIcon from '@material-ui/icons/Loop'
import glb_sv from "../../../utils/service/global_service";

import {
    TextFieldCpn,
    TitleFilterCpn,
    SelectCpn,
    DatePickerCpn,
    ButtonCpn,
  } from "../../../basicComponents";

const ImportSearch = ({ handleSearch, process = false }) => {
    const { t } = useTranslation()

    const [searchModal, setSearchModal] = useState({
        start_dt: moment().subtract(1, 'months').toString(),
        end_dt: glb_sv.endDay,
    })
    const [isExpanded, setIsExpanded] = useState(true)

    const handleChangeExpand = () => {
        setIsExpanded((e) => !e)
    }

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

    const handleChange = (e) => {
        const newSearchModal = { ...searchModal }
        newSearchModal[e.target.name] = e.target.value
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
                            label={t('order.import.start_date')}
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
                            label={t('order.import.end_date')}
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
    );
}

export default ImportSearch
