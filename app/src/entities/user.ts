export interface User {
  id_user: number;
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  login: string;
  id_role: number;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;

  fullName: string;
}
