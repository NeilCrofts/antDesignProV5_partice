import { useEffect } from 'react';
import { Modal as AntModal, Form, message } from 'antd';
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
  hideModal: (reload?: boolean) => void;
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
    (values: any) => {
      message.loading({
        content: 'Processing...',
        key: 'process',
        duration: 0,
      });
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
      throttleInterval: 1000,
      onSuccess: (data) => {
        message.success({
          content: data.message,
          key: 'process',
        });
        hideModal(true);
      },
      formatResult: (res) => {
        return res;
      },
    },
  );

  const actionHandler = (action: BasicListApi.Action) => {
    const formData = { uri: action.uri, method: action.method, ...form.getFieldsValue(true) };
    switch (action.action) {
      case 'submit':
        request.run(formData);
        break;
      case 'cancel':
        hideModal();
        break;
      case 'reset':
        form.resetFields();
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
        onCancel={() => {
          return hideModal();
        }}
        footer={ActionBuilder(init?.data?.layout?.actions[0]?.data, actionHandler, request.loading)}
        // 取消点击遮罩层时弹窗关闭
        maskClosable={false}
        forceRender
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
