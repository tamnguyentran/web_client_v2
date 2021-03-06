import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Breadcrumbs } from '@material-ui/core'
import HomeIcon from '@material-ui/icons/Home'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import style from './Breadcrumb.module.css'
import { menuList, menuAdmin } from '../../components/Menu/index'


const RenderBreadcrumb = () => {
    const history = useHistory()
    const { t } = useTranslation()
    const [commitMenu, setCommitMenu] = useState([...menuList, ...menuAdmin])

    let keyActive = window.location.pathname.split('/').filter((x) => x)
    let topItem = commitMenu.find((x) => x.key === keyActive[1])
    let childItem =
        !!topItem && !!topItem.children && topItem.children.find((x) => x.link === keyActive.slice(1).join('/'))

    return (
        <Breadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextIcon fontSize="small" />}
            className="breadcrumb-layout"
            style={{ color: '#fff' }}
        >
            {keyActive.map((item, index) => (
                <div
                style={{color:'#fff'}}
                key={index}
                    className={'cursor-pointer fw-bold breadText flex aligh-item-center'}
                    onClick={() => history.push(`/${keyActive.slice(0, index + 1).join('/')}`)}
                    color="inherit"
                    // href={`/${keyActive.slice(0, index + 1).join('/')}`}
                >
                    {index === 0 && <HomeIcon className={style.icon} />}
                    {index === 1 && topItem ? t(topItem.title) : ''}
                    {index === 2 && childItem ? t(childItem.title) : ''}
                </div>
            ))}
        </Breadcrumbs>
    )
}



export default RenderBreadcrumb
