import { SchemaForm, SchemaMarkupField as Field, createFormActions } from '@formily/antd';
import { Input, ArrayTable, Select, Checkbox } from '@formily/antd-components';
import { Modal as AntdModal } from 'antd';
import styles from './style.less';

const modalAction = createFormActions();

// modalVisible是由props内提取出的modalVisible
const Modal = ({
  modalVisible,
  hideModal,
  modalSubmitHandler,
}: {
  modalVisible: boolean;
  hideModal: (reload?: boolean) => void;
  modalSubmitHandler: (values: any) => void;
}) => {
  return (
    <div>
      <AntdModal
        visible={modalVisible}
        onCancel={() => {
          hideModal();
        }}
        onOk={() => {
          modalAction.submit();
        }}
        maskClosable={false}
        forceRender
        focusTriggerAfterClose={false}
      >
        <SchemaForm
          components={{ Input, ArrayTable, Select, Checkbox }}
          className={styles.formilyForm}
          actions={modalAction}
          onSubmit={modalSubmitHandler}
        >
          <Field name="data" type="array" x-component="ArrayTable">
            <Field type="object">
              <Field title="Title" name="title" x-component="Input" />
              <Field title="Value" name="value" x-component="Input" />
            </Field>
          </Field>
        </SchemaForm>
      </AntdModal>
    </div>
  );
};

export default Modal;
