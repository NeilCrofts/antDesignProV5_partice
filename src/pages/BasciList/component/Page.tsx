import React, { useEffect } from 'react';
import { Col, Row, Tabs, Form, message, Card, Space, Spin } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { useLocation, useRequest, history } from 'umi';
import moment from 'moment';
import Style from '../index.less';
import FormBuilder from '../builder/FormBuilder';
import actionBuilder from '../builder/ActionBuilder';
import { submitFieldsAdaptor, setFieldsAdaptor } from '../helper';

const { TabPane } = Tabs;

const Page = () => {
  const location = useLocation();
  const [form] = Form.useForm();

  const init = useRequest(
    `https://public-api-v2.aspirantzhang.com/${location.pathname.replace(
      '/basic-list',
      '',
    )}?X-API-KEY=antd`,
    {
      onError: () => {
        history.goBack();
      },
    },
  );

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
        data: {
          ...submitFieldsAdaptor(formValues),
          'X-API-KEY': 'antd',
        },
      };
    },
    {
      manual: true,
      onSuccess: (data) => {
        message.success({
          content: data.message,
          key: 'process',
        });
        history.goBack();
      },
      formatResult: (res) => {
        return res;
      },
    },
  );

  useEffect(() => {
    if (init.data) {
      form.setFieldsValue(setFieldsAdaptor(init.data));
    }
  }, [init.data]);

  const actionHandler = (action: BasicListApi.Action) => {
    const formData = { uri: action.uri, method: action.method, ...form.getFieldsValue(true) };
    switch (action.action) {
      case 'submit':
        request.run(formData);
        break;
      case 'cancel':
        history.goBack();
        break;
      case 'reset':
        form.resetFields();
        break;
      default:
        break;
    }
  };

  const onFinish = (values: any) => {
    request.run(values);
  };

  const pageTabs = () => {
    return (
      <Tabs type="card" className={Style.pageTabs}>
        {init?.data?.layout?.tabs.map((tab: BasicListApi.Tabs) => {
          return (
            <TabPane tab={tab.title} key={tab.title}>
              <Card>{FormBuilder(tab.data)}</Card>
            </TabPane>
          );
        })}
      </Tabs>
    );
  };

  const pageToolBar = () => {
    return init?.data?.layout?.actions.map((action: BasicListApi.Actions) => {
      return (
        <Card>
          <Space>{actionBuilder(action.data, actionHandler)}</Space>
        </Card>
      );
    });
  };

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };
  return (
    <PageContainer>
      {init?.loading ? (
        <Spin className={Style.formSpin} tip="Loading..." />
      ) : (
        <Form
          form={form}
          {...layout}
          initialValues={{
            create_time: moment(),
            update_time: moment(),
            status: 1,
          }}
          onFinish={onFinish}
        >
          <Row gutter={18}>
            <Col xs={16}>{pageTabs()}</Col>
            <Col xs={8} className={Style.textAlignCenter}>
              <Card>{pageToolBar()}</Card>
            </Col>
          </Row>
          <FooterToolbar>{pageToolBar()}</FooterToolbar>
        </Form>
      )}
    </PageContainer>
  );
};

export default Page;
