import { Button} from 'antd';

const actionBuilder = (actions:BasicListApi.Action[] | undefined)=>{
  return (actions||[]).map((action)=>{
    if(action.component === 'button'){
      return <Button type={action.type}>{action.text}</Button>
    }
    return null
  })
}

export default actionBuilder
