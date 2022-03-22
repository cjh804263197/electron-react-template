import React, { useCallback, useState } from 'react'
import { Checkbox, Form, InputNumber, Row, Col, Button, message, Spin } from 'antd';
import Electron from 'electron';
import { Region, ResizeOptions, JpegOptions } from 'sharp';
import DirPicker from './Elements/DirPicker';

const { ipcRenderer } = window.require('electron') as typeof Electron
import '../style/App.css';

const { useForm } = Form

interface Props
{
}

type IResize = Pick<ResizeOptions, "width" | "height">

type IJpeg = Pick<JpegOptions, "quality">

interface FormData
{
    sourceDir: string;
    targetDir: string;
    jpeg: IJpeg;
    corp?: Region;
    resize?: IResize;
}

function processImg(data: FormData)
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            ipcRenderer.send("PROCESS_IMGS", data)
            ipcRenderer.once("PROCESS_IMGS_FAIL", (event, err) =>
            {
                reject(err)
            })
            ipcRenderer.once("PROCESS_IMGS_SUCCESS", (event, files) =>
            {
                resolve(files)
            })
        }
        catch(err)
        {
            reject(err)
        }
    })

}

const App: React.FunctionComponent<Props> = function (props)
{
    const [form] = useForm<FormData>()

    const [hasCorp, setHasCorp] = useState<boolean>()

    const [hasResize, setHasResize] = useState<boolean>()

    const [loading, setLoading] = useState<boolean>(false)

    const handlePickDirClick = useCallback((cb: (dir: string) => void) =>
    {
        const dir = ipcRenderer.sendSync("PICK_DIR") as string;
        cb(dir)
    }, [])

    const handleSubmitClick = useCallback(() => 
    {
        form.submit();
    }, [])

    const handleFormFinish = useCallback((values: FormData) =>
    {
        setLoading(true)
        processImg(values)
        .then(files =>
        {
            console.log('files => ', files)
            message.success('执行成功')
        })
        .catch(err =>
        {
            console.log('err => ', err)
            message.error(err?.message || '执行失败')
        })
        .finally(() =>
        {
            setLoading(false)
        })
        
    }, [])

    return (
        <div className="app-page">
            <img src="https://camo.githubusercontent.com/acf8c44b9856bca88b888a210d772e622f741d55f349914cbe322bd8e980d5fe/68747470733a2f2f63646e2e6a7364656c6976722e6e65742f67682f6c6f76656c6c2f7368617270406d61737465722f646f63732f696d6167652f73686172702d6c6f676f2e737667" alt="" />
            <h2>Sharp 图片处理</h2>
            <Spin spinning={loading} tip="处理中..." >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormFinish}
                >
                    <Form.Item
                        label="源文件路径"
                        name="sourceDir"
                        rules={[{ required: true, message: '请选择源文件路径' }]}
                    >
                        <DirPicker
                            onClick={handlePickDirClick}
                        />
                    </Form.Item>
                    <Form.Item
                        label="输出文件路径"
                        name="targetDir"
                        rules={[{ required: true, message: '请选择输出文件路径' }]}
                    >
                        <DirPicker
                            onClick={handlePickDirClick}
                        />
                    </Form.Item>
                    <Form.Item
                        required
                        label="压缩质量"
                        name={["jpeg", "quality"]}
                        initialValue={100}
                    >
                        <InputNumber
                            min={Number(1)}
                            max={Number(100)}
                            formatter={value => `${value}%`}
                            parser={value => Number(value.replace('%', ''))}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Checkbox
                            checked={hasCorp}
                            onChange={(e) => setHasCorp(e.target.checked)}
                        >裁剪图片</Checkbox>
                    </Form.Item>
                    {
                        hasCorp ?
                        <Row gutter={[ 24, 0 ]}>
                            <Col span={12}>
                                <Form.Item
                                    label="X 方向偏移量"
                                    
                                    name={[ "corp", "left" ]}
                                    initialValue={0}
                                >
                                    <InputNumber
                                        min={0}
                                        addonAfter="px"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Y 方向偏移量"
                                    name={[ "corp", "top" ]}
                                    initialValue={0}
                                >
                                    <InputNumber
                                        min={0}
                                        addonAfter="px"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="宽度"
                                    name={[ "corp", "width" ]}
                                    initialValue={100}
                                >
                                    <InputNumber
                                        min={0}
                                        addonAfter="px"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="高度"
                                    name={[ "corp", "height" ]}
                                    initialValue={100}
                                >
                                    <InputNumber
                                        min={1}
                                        addonAfter="px"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        : null
                    }
                    <Form.Item>
                        <Checkbox
                            checked={hasResize}
                            onChange={(e) => setHasResize(e.target.checked)}
                        >调整大小</Checkbox>
                    </Form.Item>
                    {
                        hasResize ?
                        <Row gutter={[ 24, 0 ]}>
                            <Col span={12}>
                                <Form.Item
                                    label="宽度"
                                    name={[ "resize", "width" ]}
                                    initialValue={100}
                                >
                                    <InputNumber
                                        min={1}
                                        addonAfter="px"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="高度"
                                    name={[ "resize", "height" ]}
                                    initialValue={0}
                                >
                                    <InputNumber
                                        min={0}
                                        addonAfter="px"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        : null
                    }
                </Form>
                <Button
                    type="primary"
                    onClick={handleSubmitClick}
                >
                    执行
                </Button>
            </Spin>
        </div>
    )
}

export default App
