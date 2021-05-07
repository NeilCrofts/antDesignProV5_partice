import { Button } from 'antd';
// 导出antd中button的定义类型
import type { ButtonType } from 'antd/lib/button';

const actionBuilder = (
  actions: BasicListApi.Action[] | undefined,
  actionHandler: BasicListApi.ActionHandler,
  loading=false,
  record={},
) => {
  return (actions || []).map((action) => {
    if (action.component === 'button') {
      return (
        <Button
          key={action.text}
          type={action.type as ButtonType}
          onClick={() => actionHandler(action, record)}
          loading={loading}
        >
          {action.text}
        </Button>
      );
    }
    return null;
  });
};

export default actionBuilder;
