import moment from 'moment';
import { Space, Tag } from 'antd';
import ActionBuilder from './ActionBuilder';

// 列表内容
const columnsBuilder = (
  tableColumn: BasicListApi.Filed[] | undefined,
  actionHandler: BasicListApi.ActionHandler,
) => {
  const newCloumns: BasicListApi.Filed[] = [];
  // dataSourse的数据是在tableColumn中处理的
  (tableColumn || []).forEach((column) => {
    if (column.hideInColumn !== true) {
      switch (column.type) {
        // 修改时间格式
        case 'datetime':
          // .render 对column的数据加工返回 参数value为dataSourse的每一项
          column.render = (value: any) => {
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
          };
          break;
        // 修改状态state
        case 'switch':
          column.render = (value: any) => {
            const option = (column.data || []).find((item: any) => item.value === value);
            return <Tag color={value ? 'blue' : 'red'}>{option?.title}</Tag>;
          };
          break;
        case 'actions':
          column.render = (_: any, record: any) => {
            return <Space>{ActionBuilder(column.actions, actionHandler, false, record)}</Space>;
          };
          break;

        default:
          break;
      }

      newCloumns.push(column);
    }
  });
  const idCloumn: BasicListApi.Filed[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
  ];
  return idCloumn.concat(newCloumns);
};

export default columnsBuilder;
