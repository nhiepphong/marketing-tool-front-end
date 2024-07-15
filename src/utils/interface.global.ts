export type ValuePropsGetUser = {
  email: string;
  password: string;
};

export type defaultValue = {
  address: string;
  code_shop: string;
  email: string;
  id: number;
  is_change_pass: boolean;
  key_login: string;
  name_shop: string;
  phone: string;
};

export type DataUser = {
  user: any;
  token: {
    accessToken: string;
    refreshToken: string;
  };
};

export interface ScrapedItem {
  id: number;
  group_id: number;
  name: string;
  uid: string;
  gender: string;
  link: string;
  phone: string | null;
  type: string | "";
  message: string;
}

export interface GroupItem {
  id: number;
  name: string;
  date: string;
  link: string;
  status: number;
}
