import React, { useState, useEffect, useRef } from 'react';
import { Dropdown, Ref, Popup, Header } from 'semantic-ui-react';

const LabelInput = ({ defaultLabel, disabled, focusOnRender, initLabelIds, multilabels, possibleLabelsProp, relatedId, renderPopup, visible, open, onClose, onLabelConfirmed, onLabelUpdate }) => {
    const [label, setLabel] = useState([]);
    const [possibleLabels, setPossibleLabels] = useState([]);
    const [performInit, setPerformInit] = useState(true);
    const [confirmLabel, setConfirmLabel] = useState(0);

    const inputRef = useRef(null);

    useEffect(() => {
        updatePossibleLabels();
    }, []);

    useEffect(() => {
        if (initLabelIds) {
            setPerformInit(true);
        }
    }, [initLabelIds]);

    useEffect(() => {
        if (visible) {
            if (focusOnRender) {
                if (inputRef.current) {
                    inputRef.current.click();
                }
            }
        }

        if (confirmLabel !== 0) {
            annoLabelUpdate(label);
            closeLabelInput();
        }

        if (initLabelIds) {
            if (performInit) {
                setPerformInit(false);

                if (initLabelIds.length > 0) {
                    setLabel(initLabelIds);
                } else {
                    setLabel([]);
                }
            }
        }
    }, [visible, focusOnRender, label, confirmLabel, possibleLabelsProp, initLabelIds, relatedId]);

    const onKeyDown = (e) => {
        e.stopPropagation();
        performKeyAction(e.key);
    }

    const onChange = (e, item) => {
        let lbl;

        if (multilabels) {
            lbl = item.value !== -1 ? item.value : [];
        } else {
            lbl = item.value !== -1 ? [item.value] : [];
        }

        setLabel(lbl);
        annoLabelUpdate(lbl);
    }

    const onItemClick = (e, item) => {
        incrementConfirmLabel();
    }

    const updatePossibleLabels = () => {
        let _possibleLabels = [];
        let _defaultLabel;

        if (defaultLabel) {
            if (Number.isInteger(defaultLabel)) {
                _defaultLabel = undefined;
            } else {
                _defaultLabel = defaultLabel;
            }
        } else {
            _defaultLabel = 'no label';
        }

        if (possibleLabelsProp.length > 0) {
            _possibleLabels = possibleLabelsProp.map(e => {
                return {
                    key: e.id,
                    value: e.id,
                    text: e.label,
                    content: (
                        <div onClick={(event) => onItemClick(event, e.id)}>
                            {e.label}
                        </div>
                    )
                };
            });
        }

        if (_defaultLabel) {
            _possibleLabels.unshift({
                key: -1,
                value: -1,
                text: _defaultLabel,
                content: (
                    <div onClick={(event) => onItemClick(event, -1)}>
                        {_defaultLabel}
                    </div>
                )
            });
        }

        setPossibleLabels(_possibleLabels);
    }

    const performKeyAction = (key) => {
        switch (key) {
            case 'Enter':
                if (!multilabels) {
                    if (visible) incrementConfirmLabel();
                }
                break;
            case 'Escape':
                closeLabelInput();
                break;
            default:
                break;
        }
    }

    const annoLabelUpdate = (label) => {
        console.log('LabelInput -> annoLabelUpdate ', label);

        if (onLabelUpdate) {
            onLabelUpdate(label.filter(val => val !== -1));
        }
    }

    const incrementConfirmLabel = () => {
        setConfirmLabel(confirmLabel + 1);
    }

    const closeLabelInput = () => {
        console.log('LabelInput -> closeLabelInput');

        if (onLabelConfirmed) onLabelConfirmed(label.filter(val => val !== -1));
        if (onClose) onClose();
    }

    const renderLabelInput = () => {
        let lbl;

        if (multilabels) lbl = label;
        else {
            lbl = (label.length > 0 ? label[0] : -1)
        }

        return (
            <Ref innerRef={inputRef}>
                <Dropdown
                    multiple={multilabels}
                    search
                    selection
                    closeOnChange
                    icon="search"
                    options={possibleLabels}
                    placeholder='Enter label'
                    tabIndex={0}
                    onKeyDown={e => onKeyDown(e)}
                    value={lbl}
                    onChange={(e, item) => onChange(e, item)}
                    style={{ opacity: 0.8 }}
                    disabled={disabled}
                    open={open}
                />
            </Ref>
        );
    }

    const renderLabelInfo = () => {
        if (!label) return null;

        let lbl = undefined;

        if (label.length > 0) {
            lbl = possibleLabels.find(e => label[label.length - 1] === e.id);
        }

        if (!lbl) return "No label";

        return (
            <div>
                <Header>{lbl.label}</Header>
                <div dangerouslySetInnerHTML={{ __html: lbl.description }} />
            </div>
        );
    }

    const renderPopupContent = () => {
        return (
            <div>
                {renderLabelInfo()}
            </div>
        );
    }

    if (!visible) return null;

    if (renderPopup) {
        return (
            <Popup
                trigger={renderLabelInput()}
                content={renderPopupContent()}
                open
                position="right center"
                style={{ opacity: 0.9 }}
            />
        );
    } else {
        return renderLabelInput();
    }
}

export default LabelInput;