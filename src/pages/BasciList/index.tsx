import React,{useState,useEffect} from 'react';
import { Table, Row,Col,Card,Button,Pagination,Space,Tag} from 'antd';
import moment from 'moment'
import { PageContainer} from '@ant-design/pro-layout';
import {useRequest} from 'umi'
import style from './index.less'

const Index=()=>{
  const [page,setPage] = useState(1)//设置当前页数和函数名setPage
  const [per_page,setPerPage]= useState(12)//设置每页的条目数和函数名setPerPage
  //useRequest 获取接口数据
  const init = useRequest<{data:BasicListApi.Data}>(
    `https://public-api-v2.aspirantzhang.com/api/admins?X-API-KEY=antd&page=${page}&per_page=${per_page}`
    )
  console.log(init);

  //当page||per_page改变后，运行init.run()，解决init.run会异步执行的问题
  useEffect(()=>{
    init.run()
  },[page,per_page])

  const actionBuilder = (actions:BasicListApi.Action[] | undefined)=>{
    return (actions||[]).map((action)=>{
      if(action.component === 'button'){
        return <Button type={action.type}>{action.text}</Button>
      }
      return null
    })
  }

  //页面头部
  const searchLayout =()=>{};
  const beforeTableLayout =()=>{
    return(
      <Row>
        <Col span={12}>...</Col>
        <Col span={12} className={style.tableToobar}>
          <Space>
            {actionBuilder(init?.data?.layout?.tableToolBar)}
          </Space>
        </Col>
      </Row>
    )
  };
  const pagenationChangeHandler=(_page:any,_per_page:any)=>{
    setPage(_page)
    setPerPage(_per_page)
    //异步 会先于前两行执行
    // init.run()
  }
  //页面尾部
  const afterTableLayout =()=>{
    return(
      <Row>
        <Col span={12}>...</Col>
        <Col span={12} className={style.tableToobar}>
          <Pagination
            total={init?.data?.meta?.total||0}
            current={init?.data?.meta?.page || 1}
            pageSize={init?.data?.meta?.per_page || 10}
            showSizeChanger
            showQuickJumper
            showTotal={total => `Total ${total} items`}
            //都为改变页码和每页条目数的方法
            onChange={pagenationChangeHandler}
            onShowSizeChange={pagenationChangeHandler}
          />
        </Col>
      </Row>
    )
  };

  //列表内容
  const columnsBuilder=()=>{
      const newCloumns:any[] =[];
      //dataSourse的数据是在tableColumn中处理的
      (init?.data?.layout?.tableColumn||[]).forEach((column)=>{
        if(column.hideInColumn!==true){
          switch(column.type){
            //修改时间格式
            case 'datetime':
              //.render 对column的数据加工返回 参数value为dataSourse的每一项
              column.render = (value:any)=>moment(value).format('YYYY-MM-DD HH:mm:ss');
              break;
            //修改状态state
            case 'switch':
              column.render=(value:any)=>{
                const option = (column.data||[]).find((item)=>item.value===value)
                return <Tag color={value ? 'blue' : 'red'}>{option?.title}</Tag>
              }
              break;
            case 'actions':
              column.render=(value:any)=>{
                return <Space>{actionBuilder(column.actions)}</Space>
              }
            break;

            default:
              break;
          }
          newCloumns.push(column)
        }
    })
    return newCloumns

  }
    return (
    <PageContainer>
      {searchLayout()}
      <Card>
        {beforeTableLayout()}
        <Table
          dataSource={init?.data?.dataSource}
          columns={columnsBuilder()}
          pagination={false}/>
        {afterTableLayout()}
      </Card>
    </PageContainer>
    )
}



export default Index
