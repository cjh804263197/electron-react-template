import React, { useCallback, useState } from 'react'
import { Button, Input, Row, Col } from 'antd';
import Electron from 'electron';
const { ipcRenderer } = window.require('electron') as typeof Electron
import '../style/App.css';

interface Props
{
}

const App: React.FunctionComponent<Props> = function (props)
{
    const [dir, setDir] = useState<string | null>()
    const handleOpenDirClick = useCallback(() =>
    {
        // use preload.js
        // const dir = (window as any).electron.ipcRenderer.pickDir()
        const dir = ipcRenderer.sendSync("PICK_DIR") as string | null;
        setDir(dir)
    }, [])

    return (
        <div className="app-page">
            <Row gutter={[ 24, 24 ]}>
                <Col className="gutter-row" span={6}>
                    <Button
                        className="pick-btn"
                        type="primary"
                        onClick={handleOpenDirClick}
                    >Open Dir</Button>
                </Col>
                <Col className="gutter-row" span={18}>
                    <Input disabled value={dir} />
                </Col>
            </Row>
        </div>
    )
}

export default App
