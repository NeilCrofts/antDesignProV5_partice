import React, { useEffect } from 'react';
import { Modal as AntModal, Form, Input } from 'antd';
import { useRequest } from 'umi';
import moment from 'moment';
import FormBuilder from '../builder/FormBuilder';
import ActionBuilder from '../builder/ActionBuilder';

// modalVisible是由props内提取出的modalVisible
const Modal = ({
  modalVisible,
  hideModal,
  modalUri,
}: {
  modalVisible: boolean;
  hideModal: () => void;
  modalUri: string;
}) => {
  const [form] = Form.useForm();

  // 请求弹窗选项
  const init = useRequest<{ data: PageApi.Data }>(`${modalUri}`, {
    // 手动触发，init.run()时才执行
    manual: true,
  });

  // useRequest 向后台发送数据
  const request = useRequest(
    (values) => {
      const { uri, method, ...formValues } = values;
      return {
        url: `https://public-api-v2.aspirantzhang.com${uri}`,
        method,
        // body: JSON.stringify(formValues),
        data: {
          ...formValues,
          'X-API-KEY': 'antd',
          create_time: moment(formValues.create_time).format(),
          update_time: moment(formValues.update_time).format(),
        },
      };
    },
    {
      manual: true,
    },
  );

  // 字段适配（转换），解决dataSourse的time格式问题
  const setFieldsAdaptor = (data: PageApi.Data) => {
    if (data?.layout?.tabs && data?.dataSource) {
      const result = {};
      data.layout.tabs.forEach((tab) => {
        tab.data.forEach((field) => {
          switch (field.type) {
            case 'datetime':
              // 根据tabs中data内的key值(datetime) 获取dataSourse的对应项
              result[field.key] = moment(data.dataSource[field.key]);
              break;
            default:
              // 也添加对应的默认数据
              result[field.key] = data.dataSource[field.key];
              break;
          }
        });
      });
      return result;
    }
    return {};
  };

  const actionHandler = (action: PageApi.Datum3) => {
    switch (action.action) {
      case 'submit':
        // 将uri method存在表单上
        form.setFieldsValue({ uri: action.uri, method: action.method });
        // form.submit()->数据到onFinish
        form.submit();
        break;

      default:
        break;
    }
  };

  const onFinish = (values: any) => {
    request.run(values);
  };

  useEffect(() => {
    // 数据获取前清空数据，解决add弹窗遗留edit弹窗数据问题
    form.resetFields();
    if (modalVisible) init.run();
    // 弹窗打开就重新抓取数据
  }, [modalVisible]);

  // 设置edit弹窗的各选项默认值(当init数据获取的时候执行)
  useEffect(() => {
    if (init.data) {
      form.setFieldsValue(setFieldsAdaptor(init.data));
    }
  }, [init.data]);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  return (
    <div>
      <AntModal
        title={init?.data?.page?.title}
        visible={modalVisible}
        onCancel={hideModal}
        footer={ActionBuilder(init?.data?.layout?.actions[0]?.data, actionHandler)}
        // 取消点击遮罩层时弹窗关闭
        maskClosable={false}
      >
        <Form
          form={form}
          {...layout}
          // 给部分内容添加默认值，提高用户体验
          initialValues={{
            create_time: moment(),
            update_time: moment(),
            status: 1,
          }}
          onFinish={onFinish}
        >
          {FormBuilder(init?.data?.layout?.tabs[0]?.data)}
          <Form.Item name="uri" key="uri" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="method" key="method" hidden>
            <Input />
          </Form.Item>
        </Form>
      </AntModal>
    </div>
  );
};

export default Modal;
