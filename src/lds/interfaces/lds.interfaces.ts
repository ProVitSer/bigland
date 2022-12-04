export interface LdsUserStatusResponse {
  items: Item[];
}

export interface Item {
  id: number;
  sip_id: number | null;
  is_active: boolean;
  amo: Amo[] | [];
  post: Post;
}

export interface Post {
  user_id: number;
  amo_account_id: number;
  amo_id: number;
}

export interface Amo {
  id: number;
  title: string;
  description: string | null;
  plan_daily_calls_air: string;
  plan_daily_calls_amount: number;
}
