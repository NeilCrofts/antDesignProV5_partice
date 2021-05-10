import React, { useEffect } from 'react';
import { Col, Row, Tabs, Form, message, Card } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { useLocation, useRequest } from 'umi';
import ColumnBuilder from '../builder/ColumnBuilder';
import style from '../index.less';

const Page = () => {
  const location = useLocation();

  const init = useRequest(
    `https://public-api-v2.aspirantzhang.com/${location.pathname.replace(
      '/basic-list',
      '',
    )}?X-API-KEY=antd`,
  );
  const { TabPane } = Tabs;
  const Demo = () => (
    <Tabs type="card" className={style.pageTabs}>
      <TabPane tab="Tab 1" key="1">
        <Card>{ColumnBuilder(init?.data?.layout?.tabs[0].data,()=>{})}</Card>
      </TabPane>
      <TabPane tab="Tab 2" key="2">
        <Card>Content of Tab Pane 2</Card>
      </TabPane>
      <TabPane tab="Tab 3" key="3">
        Content of Tab Pane 3
      </TabPane>
    </Tabs>
  );

  return (
    <PageContainer>
      <Row gutter={18}>
        <Col xs={16}>{Demo()}</Col>
        <Col xs={8}>
          <Card>bb</Card>
        </Col>
      </Row>
      <FooterToolbar>222</FooterToolbar>
    </PageContainer>
  );
};

export default Page;
