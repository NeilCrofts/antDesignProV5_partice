import React, { useEffect } from 'react';
import { Modal as AntModal, Form, Input } from 'antd';
import { useRequest } from 'umi';
import moment from 'moment';
import FormBuilder from '../builder/FormBuilder';
import ActionBuilder from '../builder/ActionBuilder';
import { submitFieldsAdaptor, setFieldsAdaptor } from '../helper';

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

  // 向后台请求 弹窗内容
  const init = useRequest<{ data: BasicListApi.PageData }>(
    `https://public-api-v2.aspirantzhang.com${modalUri}?X-API-KEY=antd`,
    {
      // 手动触发，init.run()时才执行
      manual: true,
      onError: () => {
        hideModal();
      },
    },
  );

  // useRequest 向后台发送弹窗选项数据
  const request = useRequest(
    (values:any) => {
      const { uri, method, ...formValues } = values;
      return {
        url: `https://public-api-v2.aspirantzhang.com${uri}`,
        method,
        // body: JSON.stringify(formValues),
        data: {
          ...submitFieldsAdaptor(formValues),
          'X-API-KEY': 'antd',
        },
      };
    },
    {
      manual: true,
      onSuccess:(data)=>{
        console.log(data);
      }
    },
  );

  const actionHandler = (action: BasicListApi.Action) => {
    switch (action.action) {
      case 'submit':
        const formData = { uri: action.uri, method: action.method, ...form.getFieldsValue(true) };
        request.run(formData);
        break;

      default:
        break;
    }
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
        >
          {FormBuilder(init?.data?.layout?.tabs[0]?.data)}
        </Form>
      </AntModal>
    </div>
  );
};

export default Modal;
