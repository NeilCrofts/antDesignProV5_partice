import React from 'react'
import { Input, Form } from 'antd'

// 该组件仅负责渲染展示
const FormBuilder = (data: PageApi.Datum[]|undefined) => {
  return (data || []).map((field) => {
    return (
        <Form.Item
          label={field.title}
          name={field.key}
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

    )
  })
}

export default FormBuilder
