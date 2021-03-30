import React from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { useTranslation } from 'react-i18next'
import deImg from '../assets/img/languages/de.png'
import enImg from '../assets/img/languages/en.png'

const LanguageDropdownItem = ({ language, onClick, countryCode }) => (
    <div role="button" tabIndex="0" onMouseDown={onClick}>
        <p style={{ textAlign: 'center', lineHeight: 2, margin: 0 }}>
            {language}
            <span>
                <img
                    alt=""
                    src={countryCode === 'de' ? deImg : enImg}
                    style={{ width: 30, height: 30, float: 'right' }}
                    className="c-avatar-img"
                />
            </span>
        </p>
    </div>
)

const TheHeaderDropdownTasks = () => {
    const { t, i18n } = useTranslation()
    return (
        <CDropdown inNav className="c-header-nav-items mx-2" direction="down">
            <CDropdownToggle className="c-header-nav-link" caret={false}>
                <img
                    alt=""
                    className="c-avatar-img"
                    src={i18n.language === 'de' ? deImg : enImg}
                    style={{ width: 28, height: 28 }}
                />
            </CDropdownToggle>
            <CDropdownMenu placement="bottom-end" className="pt-0">
                <CDropdownItem header tag="div" className="text-center" color="light">
                    <strong>{t('general.chooseLanguage')}</strong>
                </CDropdownItem>
                <CDropdownItem className="d-block">
                    <div>
                        {/* <LanguageDropdownItem
                            language="Deutsch"
                            onClick={() => {
                                i18n.changeLanguage('de')
                            }}
                            countryCode="de"
                        /> */}
                    </div>
                </CDropdownItem>
                <CDropdownItem className="d-block">
                    <div>
                        <LanguageDropdownItem
                            language="English"
                            onClick={() => {
                                i18n.changeLanguage('en')
                            }}
                            countryCode="en"
                        />
                    </div>
                </CDropdownItem>
            </CDropdownMenu>
        </CDropdown>
    )
}

export default TheHeaderDropdownTasks
