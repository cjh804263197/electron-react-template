import React, { useCallback } from 'react'
import { Input, Button } from 'antd';
// import styles from 'src/styles/'

interface Props
{
    value?: string;
    onChange?: (newVal: string) => void;
    onClick?: (cb: (val: string) => void) => void;
}

const DirPicker: React.FunctionComponent<Props> = function (props)
{
    const { value, onChange, onClick } = props

    const acceptValue = useCallback((val: string) =>
    {
        onChange && onChange(val)
    }, [onChange])

    const handleClick = useCallback(() =>
    {
        onClick && onClick(acceptValue)
    }, [onClick])

    return (
        <Input.Group compact>
            <Input
                style={{ width: 'calc(100% - 200px)' }}
                value={value}
                disabled
            />
            <Button
                type="primary"
                onClick={handleClick}
            >...</Button>
        </Input.Group>
    )
}

export default DirPicker
