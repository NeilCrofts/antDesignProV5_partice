declare module BasicListApi {

  type ActionHandler=(action: BasicListApi.Action) => void;
  type Page = {
    title: string;
    type: string;
    searchBar: boolean;
    trash: boolean;
  }


  type Action = {
    component: string;
    text: string;
    type: string;
    action: string;
    uri?: string;
    method?: string;
  }

  type Filed = {
    title: string;
    dataIndex: string;
    key: string;
    [key: string]: any;
  }

  type Actions = {
    name: string;
    title: string;
    data: Action[];
  }
  type Tabs = {
    name: string;
    title: string;
    data: Filed[];
  }

  type ListLayout = {
    tableColumn: Filed[];
    tableToolBar: Action[];
    batchToolBar: Action[];
  }

  type PageLayout = {
    tabs: Tabs[];
    actions: Actions[];
  }


  type DataSource = {
    [key: string]: any;
  }


  type Meta = {
    total: number;
    per_page: number;
    page: number;
  }

  type ListData = {
    page: Page;
    layout: ListLayout;
    dataSource: DataSource[];
    meta: Meta;
  }
  type PageData = {
    page: Page;
    layout: PageLayout;
    dataSource: DataSource;
  }

  type Root = {
    success: boolean;
    message: string;
    data: PageData | ListData;
  }

}

