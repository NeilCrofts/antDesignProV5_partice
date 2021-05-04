import moment from 'moment';
import { Space, Tag } from 'antd';
import ActionBuilder from './ActionBuilder';

// 列表内容
const columnsBuilder=(tableColumn: BasicListApi.TableColumn[] | undefined) => {
  const newCloumns: BasicListApi.TableColumn[] = [];
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
            const option = (column.data || []).find((item) => item.value === value);
            return <Tag color={value ? 'blue' : 'red'}>{option?.title}</Tag>;
          };
          break;
        case 'actions':
          column.render = () => {
            return <Space>{ActionBuilder(column.actions)}</Space>;
          };
          break;

        default:
          break;
      }

      newCloumns.push(column);
    }
  });
  const idCloumn = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
  ];
  return idCloumn.concat(newCloumns);
};

export default columnsBuilder;
