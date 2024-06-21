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
  id: number;
  fullname: string;
  phone: string;
  token: string;
  dataUser: number;
  total_play: number;
  count_play: number;
  time_win: number;
};
