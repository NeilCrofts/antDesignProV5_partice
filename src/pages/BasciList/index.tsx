import { useState, useEffect } from 'react';
import {
  Table,
  Row,
  Col,
  Card,
  Pagination,
  Space,
  Modal as AntdModal,
  message,
  Tooltip,
  Button,
  Form,
} from 'antd';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { useRequest, useIntl, history, useLocation } from 'umi';
import { useUpdateEffect } from 'ahooks';
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { stringify } from 'query-string';
import QueueAnim from 'rc-queue-anim';
import ActionBuilder from './builder/ActionBuilder';
import SearchBuilder from './builder/SearchBuilder';
import ColumnBuilder from './builder/ColumnBuilder';
import Modal from './component/Modal';
import styles from './index.less';
import { submitFieldsAdaptor } from './helper';

const Index = () => {
  const [pageQuery, setPageQuery] = useState(''); // 设置第几页and每页多少项
  // 定义排序请求字符
  const [sortQuery, setSortQuery] = useState('');
  // 控制弹窗关闭
  const [modalVisible, setModalVisible] = useState(false);
  // 定义Modal接口(不同的按钮展示不同的弹窗数据)
  const [modalUri, setModalUri] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const { confirm } = AntdModal;

  const lang = useIntl();
  const [searchForm] = Form.useForm();
  const location = useLocation();

  // useRequest 获取 列表(admit list)数据 + searchLayout查询数据
  const init = useRequest<{ data: BasicListApi.ListData }>(
    (values) => {
      // 解决在其他页码的情况下点击不同菜单时 会传递页码信息且页码不刷新回第一页 的问题
      if(values === true){
        return {
          url: `${location.pathname.replace('/basic-list', '')}`,
        };
      }
      return {
        url: `${location.pathname.replace('/basic-list', '')}?${pageQuery}${sortQuery}`,
        params: values,
        paramsSerializer: (params: any) => {
          return stringify(params, { arrayFormat: 'comma', skipEmptyString: true, skipNull: true });
        },
      };
    },
    {
      onSuccess: () => {
        // 解决加载其他界面时批量选择工具栏没有刷新的问题
        setSelectedRowKeys([]);
        setSelectedRows([]);
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
        url: `${uri}`,
        method,
        // body: JSON.stringify(formValues),
        data: {
          ...formValues,
        },
      };
    },
    {
      manual: true,
      onSuccess: (data) => {
        message.success({
          content: data?.message,
          key: 'process',
        });
        init.run();
      },
      formatResult: (res) => {
        return res;
      },
    },
  );

  // 当page||per_page变量改变后，运行init.run()，解决init.run会异步执行的问题
  useUpdateEffect(() => {
    init.run();
  }, [pageQuery, sortQuery]);

  useUpdateEffect(() => {
    init.run(true);
  }, [location.pathname]);


  // 弹窗有数据后才打开窗口
  useEffect(() => {
    if (modalUri) {
      setModalVisible(true);
    }
  }, [modalUri]);

  function actionHandler(action: BasicListApi.Action, record: BasicListApi.Filed) {
    const operationName = lang.formatMessage({
      id: `basic-list.list.actionHandler.operation.${action.action}`,
    });
    switch (action.action) {
      // 点击add添加按钮 显示弹窗和设置请求地址
      case 'modal':
        setModalUri(
          // 将:id 替换为对应id号码
          (action.uri || '').replace(/:\w+/g, (field) => {
            // field 为正则查询到的 :id
            // 取出record 中的 id 属性的值
            return record[field.replace(':', '')];
          }),
        );
        break;
      case 'page': {
        const uri = (action.uri || '').replace(/:\w+/g, (field) => {
          return record[field.replace(':', '')];
        });
        history.push(`/basic-list${uri}`);
      }
      break;
      case 'modelDesign': {
        const uri = (action.uri || '').replace(/:\w+/g, (field) => {
          return record[field.replace(':', '')];
        });
        history.push(`/model-design${uri}`);
      }
      break;
      case 'reload':
        init.run();
        break;
      case 'delete':
      case 'deletePermanently':
      case 'restore': {
        confirm({
          title: lang.formatMessage(
            {
              id: 'basic-list.list.actionHandler.confirmTitle',
            },
            {
              operationName,
            },
          ),
          // title: `Do you Want to ${action.action} these items?`,
          icon: <ExclamationCircleOutlined />,
          content: batchOverView(Object.keys(record).length ? [record] : selectedRows),
          okText: `Sure to ${action.action}!`,
          okType: 'danger',
          cancelText: 'No',
          onOk() {
            return request.run({
              uri: action.uri,
              method: action.method,
              type: action.action,
              ids: Object.keys(record).length ? [record.id] : selectedRowKeys,
            });
          },
          onCancel() {},
        });
        break;
      }
      default:
        break;
    }
  }

  function batchOverView(dataSourse: BasicListApi.Filed[]) {
    // 删除栏获取表单数据
    const tableColumns = ColumnBuilder(init?.data?.layout?.tableColumn, actionHandler);
    return (
      <Table
        size="small"
        rowKey="id"
        columns={ [tableColumns[0] || {}, tableColumns[1] || {}]}
        dataSource={dataSourse}
        pagination={false}
      ></Table>
    );
  }

  const pagenationChangeHandler = (page: any, per_page: any) => {
    setPageQuery(`&page=${page}&per_page=${per_page}`);
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

  const patchToolBar = () => {
    return (
      selectedRowKeys.length > 0 && (
        <Space>{ActionBuilder(init?.data?.layout?.batchToolBar, actionHandler)}</Space>
      )
    );
  };

  const hideModal = (reload = false) => {
    setModalVisible(false);
    // 清空Uri地址
    setModalUri('');
    // 弹窗关闭后，刷新界面数据，默认不刷新
    if (reload) init.run();
  };

  const onFinish = (value: any) => {
    init.run(submitFieldsAdaptor(value));
    console.log(submitFieldsAdaptor(value));
  };
  // 页面头部 搜索栏
  const searchLayout = () => {
    return (
      <QueueAnim type="top">
        {searchVisible && (
          <div key="searchForm">
            <Card className={styles.searchForm} key="searchForm">
              <Form onFinish={onFinish} form={searchForm}>
                <Row gutter={24}>{SearchBuilder(init?.data?.layout.tableColumn)}</Row>
                <Row justify="end">
                  <Col>
                    <Space>
                      <Button type="primary" htmlType="submit">
                        submit
                      </Button>
                      <Button
                        onClick={() => {
                          init.run();
                          searchForm.resetFields();
                          // clear后清空批量选择工具栏
                          setSelectedRowKeys([]);
                          setSelectedRows([]);
                        }}
                      >
                        clear
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form>
            </Card>
          </div>
        )}
      </QueueAnim>
    );
  };

  // 右上角按钮
  const beforeTableLayout = () => {
    return (
      <Row>
        <Col span={12}>...</Col>
        <Col span={12} className={styles.tableToobar}>
          <Space>
            <Tooltip title="search">
              <Button
                shape="circle"
                icon={<SearchOutlined />}
                type={searchVisible ? 'primary' : 'default'}
                onClick={() => {
                  setSearchVisible(!searchVisible);
                }}
              />
            </Tooltip>
            {ActionBuilder(init?.data?.layout?.tableToolBar, actionHandler)}
          </Space>
        </Col>
      </Row>
    );
  };

  // 页面尾部
  const afterTableLayout = () => {
    return (
      <Row>
        <Col span={12}>...</Col>
        <Col span={12} className={styles.tableToobar}>
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

  return (
    <PageContainer>
      {searchLayout()}
      <Card>
        {beforeTableLayout()}
        <Table
          rowKey="id"
          dataSource={init?.data?.dataSource}
          columns={ColumnBuilder(init?.data?.layout?.tableColumn, actionHandler)}
          loading={init?.loading}
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
