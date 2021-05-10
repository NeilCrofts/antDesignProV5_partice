import React, { useState, useEffect } from 'react';
import { Table, Row, Col, Card, Pagination, Space, Modal as AntdModal, message } from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { useRequest } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ActionBuilder from './builder/ActionBuilder';
import ColumnBuilder from './builder/ColumnBuilder';
import Modal from './component/Modal';
import style from './index.less';

const Index = () => {
  const [page, setPage] = useState(1); // 设置当前页数和函数setPage
  const [per_page, setPerPage] = useState(12); // 设置每页的条目数和函数setPerPage
  // 定义排序请求字符
  const [sortQuery, setSortQuery] = useState('');
  // 控制弹窗关闭
  const [modalVisible, setModalVisible] = useState(false);
  // 定义Modal接口(不同的按钮展示不同的弹窗数据)
  const [modalUri, setModalUri] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const { confirm } = AntdModal;
  // 将列表存为全局
  const [tableColumn, setTableColumn] = useState<BasicListApi.Filed[]>([]);

  // useRequest 获取 列表(admit list) 数据
  const init = useRequest<{ data: BasicListApi.ListData }>(
    `https://public-api-v2.aspirantzhang.com/api/admins?X-API-KEY=antd&page=${page}&per_page=${per_page}${sortQuery}`,
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
        // body: JSON.stringify(formValues),
        data: {
          ...formValues,
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
      },
      formatResult: (res) => {
        return res;
      },
    },
  );

  // 当page||per_page变量改变后，运行init.run()，解决init.run会异步执行的问题
  useEffect(() => {
    init.run();
  }, [page, per_page, sortQuery]);

  useEffect(() => {
    if (init?.data?.layout?.tableColumn) {
      setTableColumn(ColumnBuilder(init?.data?.layout?.tableColumn, actionHandler));
    }
  }, [init?.data?.layout?.tableColumn]);

  const batchOverView = () => {
    return (
      <Table
        size="small"
        rowKey="id"
        columns={[tableColumn[0] || {}, tableColumn[1] || {}]}
        dataSource={selectedRows}
        pagination={false}
      ></Table>
    );
  };

  // 页面头部
  const searchLayout = () => {};

  // 点击add添加按钮 显示弹窗和设置请求地址
  function actionHandler(action: BasicListApi.Action, record: any) {
    switch (action.action) {
      case 'modal':
        setModalUri(
          action.uri?.replace(/:\w+/g, (field) => {
            // field 为正则查询到的 :id
            // 取出record 中的 id 属性的值
            return record[field.replace(':', '')];
          }) as string,
        );
        setModalVisible(true);
        break;
      case 'reload':
        init.run();
        break;
      case 'delete':
        confirm({
          title: 'Do you Want to delete these items?',
          icon: <ExclamationCircleOutlined />,
          content: batchOverView(),
          okText: 'Sure to delete!',
          okType: 'danger',
          cancelText: 'No',
          onOk() {
            return request.run({
              uri: action.uri,
              method: action.method,
              type: 'delete',
              ids: selectedRowKeys,
            });
          },
          onCancel() {
            console.log('concal');
          },
        });
        break;
      default:
        break;
    }
  }
  // 右上角按钮
  const beforeTableLayout = () => {
    return (
      <Row>
        <Col span={12}>...</Col>
        <Col span={12} className={style.tableToobar}>
          <Space>{ActionBuilder(init?.data?.layout?.tableToolBar, actionHandler)}</Space>
        </Col>
      </Row>
    );
  };
  const pagenationChangeHandler = (_page: any, _per_page: any) => {
    setPage(_page);
    setPerPage(_per_page);
    // 异步 会先于前两行执行
    // init.run()
  };
  // 列表排列功能
  const tableChangeHandler = (_: any, __: any, sorter: any) => {
    if (sorter.order === undefined) {
      setSortQuery('');
    } else {
      const orderBy = sorter.order === 'ascend' ? 'asc' : 'desc';
      setSortQuery(`&sort=${sorter.field}&order=${orderBy}`);
    }
  };
  // 列表选择功能
  const rowSelection = {
    selectedRowKeys,
    onChange: (_selectedRowKeys: any, _selectedRows: any) => {
      setSelectedRowKeys(_selectedRowKeys);
      setSelectedRows(_selectedRows);
    },
  };
  // 页面尾部
  const afterTableLayout = () => {
    return (
      <Row>
        <Col span={12}>...</Col>
        <Col span={12} className={style.tableToobar}>
          <Pagination
            total={init?.data?.meta?.total || 0}
            current={init?.data?.meta?.page || 1}
            pageSize={init?.data?.meta?.per_page || 10}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Total ${total} items`}
            // 都为改变页码和每页条目数的方法
            onChange={pagenationChangeHandler}
            onShowSizeChange={pagenationChangeHandler}
          />
        </Col>
      </Row>
    );
  };

  const hideModal = (reload = false) => {
    setModalVisible(false);
    // 弹窗关闭后，刷新界面数据，默认不刷新
    if (reload) init.run();
  };

  const patchToolBar = () => {
    return (
      selectedRowKeys.length > 0 && (
        <Space>{ActionBuilder(init?.data?.layout?.batchToolBar, actionHandler)}</Space>
      )
    );
  };
  return (
    <PageContainer>
      {searchLayout()}
      <Card>
        {beforeTableLayout()}
        <Table
          rowKey="id"
          dataSource={init?.data?.dataSource}
          columns={tableColumn}
          pagination={false}
          onChange={tableChangeHandler}
          rowSelection={rowSelection}
        />
        {afterTableLayout()}
      </Card>
      <Modal modalVisible={modalVisible} hideModal={hideModal} modalUri={modalUri} />
      <FooterToolbar extra={patchToolBar()}></FooterToolbar>
    </PageContainer>
  );
};
export default Index;
