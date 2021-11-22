import React, { useEffect, useState } from 'react'
import { Input } from 'reactstrap'
import { FaCogs, FaEye, FaPlusCircle, FaSave, FaTimes } from 'react-icons/fa'
import * as configApi from '../../actions/config/config_api'
import SimpleTable from '../../components/SimpleTable'
import BaseContainer from '../../components/BaseContainer'
import IconButton from '../../components/IconButton2'
import BaseModal from '../../components/BaseModal'
import * as Notification from '../../components/Notification'
import HelpButton from '../../components/HelpButton'

const isJson = (item) => {
    let temp = typeof item !== 'string' ? JSON.stringify(item) : item
    try {
        temp = JSON.parse(item)
    } catch (e) {
        return false
    }

    if (typeof temp === 'object' && item !== null) {
        return true
    }

    return false
}

const Config = () => {
    const { data: dataRaw } = configApi.useConfig()
    const { mutate: saveConfig, status: saveConfigStatus } = configApi.useSaveConfig()
    const [data, setData] = useState([])
    const [isListModalOpen, setIsListModalOpen] = useState(false)
    const [modalData, setModalData] = useState({
        key: undefined,
        config: undefined,
        values: [],
    })

    useEffect(() => {
        if (saveConfigStatus === 'success') {
            Notification.showSuccess('Config Saved')
        }
    }, [saveConfigStatus])

    const onChange = (key, value) => {
        setData(
            data.map((el) => {
                if (el.key === key) {
                    return {
                        ...el,
                        value,
                    }
                }
                return el
            }),
        )
    }

    useEffect(() => {
        if (dataRaw) {
            setData(dataRaw)
        }
    }, [dataRaw])
    return (
        <BaseContainer>
            <BaseModal
                size="sm"
                isShowCancelButton
                isOpen={isListModalOpen}
                footer={
                    <IconButton
                        isSave
                        onClick={() => {
                            setIsListModalOpen(false)
                            onChange(modalData.key, modalData.values)
                        }}
                    />
                }
                toggle={() => setIsListModalOpen(false)}
            >
                <div>
                    <div style={{display: 'flex', justifyContent: 'center'}} >
                        <IconButton
                            style={{marginBottom: 20}}
                            left={<FaPlusCircle />}
                            onClick={() => {
                                let newItem = ''
                                if (modalData.config) {
                                    if (modalData.config.type === 'number') {
                                        newItem = modalData.config.min
                                            ? modalData.config.min
                                            : 0
                                    }
                                }
                                setModalData({
                                    ...modalData,
                                    values: [...modalData.values, newItem],
                                })
                            }}
                            right="Add Item"
                        />
                    </div>
                    {modalData.values.map((el, i) => (
                        <div style={{display: 'flex', justifyContent: 'center', marginTop: 3}} >
                            <Input
                                style={{
                                    width: 150,
                                }}
                                type={modalData.config.type}
                                min={modalData.config.min}
                                max={modalData.config.max}
                                step={modalData.config.step}
                                onChange={(e) => {
                                    setModalData({
                                        ...modalData,
                                        values: modalData.values.map((el2, j) => {
                                            if (j === i) {
                                                return e.currentTarget.value
                                            }
                                            return el2
                                        }),
                                    })
                                }}
                                value={el}
                            />
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 2}}>
                                <IconButton
                                    onClick={() => {
                                        setModalData({
                                            ...modalData,
                                            values: modalData.values.filter(
                                                (el2, j) => j !== i,
                                            ),
                                        })
                                    }}
                                    color="danger"
                                    style={{padding: 1}}
                                    left={<FaTimes />}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </BaseModal>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: 10}} >
                <h2>Configuration</h2>
                <FaCogs style={{marginLeft: 15}}  size={36} />
            </div>
            <SimpleTable
                elements={data.map((el) => {
                    let config = {}
                    const isListDefaultValue = isJson(el.defaultValue)
                    if (el.config) {
                        try {
                            config = JSON.parse(el.config)
                        } catch (e) {
                            Notification.showError('Cant parse Config json ')
                        }
                    }

                    const tableLeft = (
                        <>
                            {el.key} <HelpButton id={el.key} text={el.description} />
                        </>
                    )
                    if (isListDefaultValue) {
                        const isListValue = isJson(el.value)

                        let list = JSON.parse(el.defaultValue)
                        if (typeof el.value === 'object' && el.value !== null) {
                            list = el.value
                        } else if (isListValue) {
                            list = JSON.parse(el.value)
                        }

                        return {
                            left: tableLeft,
                            right: (
                                <>
                                    <IconButton
                                        onClick={() => {
                                            setIsListModalOpen(true)
                                            setModalData({
                                                config,
                                                key: el.key,
                                                values: list,
                                            })
                                        }}
                                        right="Edit List"
                                        left={<FaEye />}
                                    />
                                </>
                            ),
                        }
                    }
                    return {
                        left: tableLeft,
                        right: (
                            <Input
                                type={config.type}
                                min={config.min}
                                max={config.max}
                                step={config.step}
                                onChange={(e) => {
                                    onChange(el.key, e.currentTarget.value)
                                }}
                                value={el.value ? el.value : el.defaultValue}
                            />
                        ),
                    }
                })}
            />
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: 8}}>
                <IconButton
                    style={{marginTop: 30}}
                    onClick={() => saveConfig(data)}
                    right="Save"
                    left={<FaSave />}
                />
            </div>
        </BaseContainer>
    )
}

export default Config
