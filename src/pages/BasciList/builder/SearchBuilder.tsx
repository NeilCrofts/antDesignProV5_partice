import { Input, Form, DatePicker, TreeSelect, Col, InputNumber, Select } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
// 该组件仅负责渲染展示
const FormBuilder = (data: BasicListApi.Filed[] | undefined) => {
  const idInput = (
    <Col sm={6} key="id">
      <Form.Item label="ID" name="id" key="id">
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
    </Col>
  );
  const dataInput = (data || []).map((field) => {
    const basicAttr = {
      label: field.title,
      name: field.key,
      key: field.key,
    };
    switch (field.type) {
      case 'text':
        return (
          <Col sm={6} key={field.key}>
            <Form.Item {...basicAttr}>
              <Input disabled={field.disabled} />
            </Form.Item>
          </Col>
        );
      case 'datetime':
        return (
          <Col sm={12} key={field.key}>
            <Form.Item {...basicAttr}>
              <RangePicker
                showTime
                disabled={field.disabled}
                style={{ width: '100%' }}
                ranges={{
                  Today: [moment().startOf('day'), moment().endOf('day')],
                  'Last 7 Days': [moment().subtract(7, 'd'), moment()],
                  'Last 30 Days': [moment().subtract(30, 'days'), moment()],
                  'Last Month': [
                    moment().subtract(1, 'months').startOf('month'),
                    moment().subtract(1, 'months').endOf('month'),
                  ],
                }}
              />
            </Form.Item>
          </Col>
        );
      case 'tree':
        return (
          <Col sm={6} key={field.key}>
            <Form.Item {...basicAttr}>
              <TreeSelect treeData={field.data} disabled={field.disabled} treeCheckable />
            </Form.Item>
          </Col>
        );
      case 'switch':
      case 'select':
        return (
          <Col sm={6} key={field.key}>
            <Form.Item {...basicAttr} valuePropName="checked">
              <Select>
                {(field.data || []).map((option: any) => {
                  return (
                    <Option value={option.value} key={option.value}>
                      {option.title}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        );
      default:
        return null;
    }
  });
  dataInput.unshift(idInput);
  return dataInput;
};

export default FormBuilder;
