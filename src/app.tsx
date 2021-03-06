import type { Settings as LayoutSettings , MenuDataItem} from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { message } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
// import { getIntl, getLocale, history, Link } from 'umi';
import { history } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import type { ResponseError } from 'umi-request';
import {
  currentUser as queryCurrentUser,
  currentMenu as queryCurrentMenu,
} from './services/ant-design-pro/api';

const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  currentMenu?: MenuDataItem[];
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  fetchMenu?: () => Promise<MenuDataItem[] | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const currentUser = await queryCurrentUser();
      return currentUser;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchMenu = async () => {
    try {
      const currentMenu = await queryCurrentMenu();
      return currentMenu;
    } catch (error) {
      message.error('Get menu data failed.', 10);
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    const currentMenu = await fetchMenu();
    return {
      fetchUserInfo,
      fetchMenu,
      currentUser,
      currentMenu,
      settings: {},
    };
  }
  return {
    fetchUserInfo,
    fetchMenu,
    settings: {},
  };
}

/**
 * 异常处理程序
 const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    405: '请求方法不被允许。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
 };
 * @see https://beta-pro.ant.design/docs/request-cn
 */
export const request: RequestConfig = {
  errorHandler: (error: ResponseError) => {
    // const { messages } = getIntl(getLocale());
    // const { response } = error;

    // if (response && response.status) {
    //   const { status, statusText, url } = response;
    //   const requestErrorMessage = messages['app.request.error'];
    //   const errorMessage = `${requestErrorMessage} ${status}: ${url}`;
    //   const errorDescription = messages[`app.request.${status}`] || statusText;
    //   notification.error({
    //     message: errorMessage,
    //     description: errorDescription,
    //   });
    // }

    // if (!response) {
    //   notification.error({
    //     description: '您的网络发生异常，无法连接服务器',
    //     message: '网络异常',
    //   });
    // }
    // throw error;

    switch (error.name) {
      case 'BizError':
        if (error.data.message) {
          message.error({
            content: error.data.message,
            key: 'process',
            duration: 10,
          });
        } else {
          message.error({
            content: 'Business Error, please try again.',
            key: 'process',
            duration: 10,
          });
        }
        break;
      case 'ResponseError':
        message.error({
          content: `${error.response.status} ${error.response.statusText}. Please try again.`,
          key: 'process',
          duration: 10,
        });
        break;
      case 'TypeError':
        message.error({
          content: `Network error. Please try again.`,
          key: 'process',
          duration: 10,
        });
        break;
      default:
        break;
    }
    throw error;
  },
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },

    menuHeaderRender: undefined,
    menuDataRender: () => {
      return initialState?.currentMenu||[];
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 展开即是defaultSettings.ts的内容
    ...initialState?.settings,
    // iconfontUrl: '//at.alicdn.com/t/font_2112134_uyx998l7ji.js',
  };
};
