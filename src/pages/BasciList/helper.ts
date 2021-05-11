import moment from 'moment'

// 字段适配（转换），解决表单提交的time格式问题
export const submitFieldsAdaptor = (formValues: any) => {
  const result = formValues;
  Object.keys(formValues).forEach((key) => {
     // 判断是否是monent对象
     if (moment.isMoment(formValues[key])) {
      result[key] = moment(formValues[key]).format()
    }
    // 若遍历的值也是数组
    if (Array.isArray(formValues[key])) {
       result[key] = formValues[key].map((innerValue: any) => {
        if (moment.isMoment(innerValue)) {
          return moment(innerValue).format()
        }
          return innerValue;
      })
    }
  })
  return result
}

// 字段适配（转换），解决dataSourse的time格式问题
export const setFieldsAdaptor = (data: BasicListApi.PageData) => {
  if (data?.layout?.tabs && data?.dataSource) {
    const result = {};
    data.layout.tabs.forEach((tab) => {
      tab.data.forEach((field) => {
        switch (field.type) {
          case 'datetime':
            // 根据tabs中data内的key值(datetime) 获取dataSourse的对应项
            result[field.key] = moment(data.dataSource[field.key]);
            break;
          default:
            // 也添加对应的默认数据
            result[field.key] = data.dataSource[field.key];
            break;
        }
      });
    });
    return result;
  }
  return {};
};
