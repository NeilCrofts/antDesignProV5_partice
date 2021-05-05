import React, { useEffect } from 'react';
import { Modal as AntModal, Form } from 'antd';
import { useRequest } from 'umi';
import FormBuilder from '../builder/FormBuilder'
import actionBuilder from '../builder/ActionBuilder';

// modalVisible是由props内提取出的modalVisible
const Modal = ({ modalVisible, hideModal, modalUri }: { modalVisible: boolean; hideModal: () => void; modalUri: string }) => {
  const init = useRequest<{ data: PageApi.Data }>(
    `${modalUri}`,
  );
  useEffect(() => {
    if (modalVisible) init.run();
    // 弹窗打开就重新抓取数据
  }, [modalVisible])

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  return (
    <div>
      <AntModal
        title={init?.data?.page?.title}
        visible={modalVisible}
        // onOk={handleOk}
        onCancel={hideModal}
        footer={actionBuilder(init?.data?.layout?.actions[0]?.data)}
      ><Form {...layout}>{FormBuilder(init?.data?.layout?.tabs[0]?.data)}</Form></AntModal>
    </div>
  );
};

export default Modal;
