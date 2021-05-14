import { useState,useEffect } from 'react';
import { Button } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import {
  SchemaForm,
  SchemaMarkupField as Field,
  FormEffectHooks,
  // FormPath,
  createFormActions,
} from '@formily/antd';
import { Input, FormCard, ArrayTable, Checkbox, Select } from '@formily/antd-components';
import 'antd/dist/antd.css';
import { useSetState } from 'ahooks';
import type { IFormEffect, IFieldState } from '@formily/react/lib'; // interface
import * as enums from './enums';
import { schemaExample } from './initialValues';
import styles from './style.less';
import Modal from './Modal';

// 改变表格数据 onFieldValueChange$:监听value ; onFieldChange$:监听整个State
const { onFieldValueChange$, onFieldChange$ } = FormEffectHooks;
const modelDesignAction = createFormActions();

const Index = () => {
  const onSubmit = (values: any) => {
    console.log(values);
  };

  const [fieldPath, setFieldPath] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalState, setModalState] = useSetState({
    type: '',
    values: {},
  });

  useEffect(() => {
    if (modalState.type) {
      setModalVisible(true);
    }
  }, [modalState.type]);



  const onModelDesign: IFormEffect = (_, { setFieldState /* setFieldValue */ ,getFieldValue}) => {
    // setFieldState能改变所有State
    // 数据改变时调用，参数是path，.subscribe参数是自身数据State
    onFieldValueChange$('fieldsCard.fields.*.type').subscribe(({ value, path }) => {
      // 需求：逻辑实现:通过改变fields的type选中listSorter
      //   if (value === 'number') {
      //     // 此处path: fieldsCard.fields.0.listSorter
      //     // 使对应的listSorter选中
      //     // setFieldValue(path.replace('type', 'listSorter').toString(), true);
      //     // 使用FormPath来替换path
      //     setFieldValue(
      //       // 使上一个listSorter选中
      //       FormPath.transform(path, /\d/g, (index) => {
      //         // index为查找的数字
      //         return `fieldsCard.fields.${parseInt(index) - 1}.listSorter`;
      //       }),
      //       true,
      //     );
      //   }

      // 需求 选择对应type 控制 按钮是否可用
      if (value === 'switch' || value === 'radio') {
        setFieldState(path.replace('type', 'data'), (state: IFieldState) => {
          state.editable = true;
          state.required = true;
        });
      } else {
        setFieldState(path.replace('type', 'data'), (state: IFieldState) => {
          state.editable = false;
          state.required = false;
        });
      }
    });
    // 监听按钮Data  active能判断按钮是否被点击
    onFieldChange$('fieldsCard.fields.*.data').subscribe(({ path, active,value }) => {
      if (active === true) {
        setModalVisible(true);
        setFieldPath(path as string);

        setModalState({
          values: value,
          type: getFieldValue(path?.replace('data', 'type')),
        });
      }
    });
    // 改变Basic的Route-Name替换uri
    onFieldValueChange$('basicCard.routeName').subscribe(({ value }) => {
      // *.*.*.uri 所有有uri的path
      setFieldState('*.*.*.uri', (state: IFieldState) => {
        state.value = state.value?.replace('admins', value);
      });
    });
  };

  // Model点击提交
  const modalSubmitHandler = (values: any) => {
    setModalVisible(false);
    // 将Modal选项的数据设置为Data自己的数据
    modelDesignAction.setFieldValue(fieldPath, values.data);
    setModalState({ type: '', values: {} });
  };

  return (
    <PageContainer>
      <SchemaForm
        onSubmit={onSubmit}
        effects={onModelDesign} // 内部事件监听器  包括了ations
        actions={modelDesignAction} // 外部动作处理器 如在外部提交按钮
        components={{ Input, ArrayTable, Checkbox, Select, Button }}
        initialValues={schemaExample}
        className={styles.formilyForm}
      >
        <FormCard title="Basic" name="basicCard">
          <Field title="Route-Name" name="routeName" x-component="Input" />
        </FormCard>
        <FormCard title="Fields" name="fieldsCard">
          <Field name="fields" type="array" x-component="ArrayTable">
            <Field type="object">
              <Field title="Name" name="name" x-component="Input" />
              <Field title="Title" name="title" x-component="Input" />
              <Field title="Type" name="type" x-component="Select" enum={enums.fieldType} />
              <Field
                title="Data"
                name="data"
                x-component="Button"
                x-component-props={{
                  children: 'Data',
                }}
              />
              <Field title="List Sorter" name="listSorter" x-component="Checkbox" />
              <Field title="Hide InColumn" name="hideInColumn" x-component="Checkbox" />
              <Field title="Edit Disabled" name="editDisabled" x-component="Checkbox" />
            </Field>
          </Field>
        </FormCard>

        <FormCard title="List Action">
          <Field name="listAction" type="array" x-component="ArrayTable">
            <Field type="object">
              <Field title="Title" name="title" x-component="Input" />
              <Field title="Type" name="type" x-component="Select" enum={enums.buttonType} />
              <Field title="Action" name="action" x-component="Select" enum={enums.buttonAction} />
              <Field title="Uri" name="uri" x-component="Input" />
              <Field title="Method" name="method" x-component="Select" enum={enums.httpMethod} />
            </Field>
          </Field>
        </FormCard>

        <FormCard title="Add Action">
          <Field name="addAction" type="array" x-component="ArrayTable">
            <Field type="object">
              <Field title="Title" name="title" x-component="Input" />
              <Field title="Type" name="type" x-component="Select" enum={enums.buttonType} />
              <Field title="Action" name="action" x-component="Select" enum={enums.buttonAction} />
              <Field title="Uri" name="uri" x-component="Input" />
              <Field title="Method" name="method" x-component="Select" enum={enums.httpMethod} />
            </Field>
          </Field>
        </FormCard>

        <FormCard title="Edit Action">
          <Field name="editAction" type="array" x-component="ArrayTable">
            <Field type="object">
              <Field title="Title" name="title" x-component="Input" />
              <Field title="Type" name="type" x-component="Select" enum={enums.buttonType} />
              <Field title="Action" name="action" x-component="Select" enum={enums.buttonAction} />
              <Field title="Uri" name="uri" x-component="Input" />
              <Field title="Method" name="method" x-component="Select" enum={enums.httpMethod} />
            </Field>
          </Field>
        </FormCard>

        <FormCard title="Table Toolbar">
          <Field name="tableToolbar" type="array" x-component="ArrayTable">
            <Field type="object">
              <Field title="Title" name="title" x-component="Input" />
              <Field title="Type" name="type" x-component="Select" enum={enums.buttonType} />
              <Field title="Action" name="action" x-component="Select" enum={enums.buttonAction} />
              <Field title="Uri" name="uri" x-component="Input" />
              <Field title="Method" name="method" x-component="Select" enum={enums.httpMethod} />
            </Field>
          </Field>
        </FormCard>

        <FormCard title="Batch Toolbar">
          <Field name="batchToolbar" type="array" x-component="ArrayTable">
            <Field type="object">
              <Field title="Title" name="title" x-component="Input" />
              <Field title="Type" name="type" x-component="Select" enum={enums.buttonType} />
              <Field title="Action" name="action" x-component="Select" enum={enums.buttonAction} />
              <Field title="Uri" name="uri" x-component="Input" />
              <Field title="Method" name="method" x-component="Select" enum={enums.httpMethod} />
            </Field>
          </Field>
        </FormCard>

        <FormCard title="Batch Toolbar - Trashed">
          <Field name="batchToolbarTrashed" type="array" x-component="ArrayTable">
            <Field type="object">
              <Field title="Title" name="title" x-component="Input" />
              <Field title="Type" name="type" x-component="Select" enum={enums.buttonType} />
              <Field title="Action" name="action" x-component="Select" enum={enums.buttonAction} />
              <Field title="Uri" name="uri" x-component="Input" />
              <Field title="Method" name="method" x-component="Select" enum={enums.httpMethod} />
            </Field>
          </Field>
        </FormCard>
      </SchemaForm>
      <FooterToolbar
        extra={
          <Button
            type="primary"
            onClick={() => {
              modelDesignAction.submit();
            }}
          >
            Submit
          </Button>
        }
      />
      <Modal
        modalVisible={modalVisible}
        hideModal={() => {
          setModalVisible(false);
          setModalState({ type: '', values: {} });
        }}
        modalSubmitHandler={modalSubmitHandler}
        modalState={modalState}
      />
    </PageContainer>
  );
};

export default Index;
