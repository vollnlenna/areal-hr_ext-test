export interface ChangeHistory {
  id_change_history: number;
  id_user: number;

  id_organization?: number | null;
  id_department?: number | null;
  id_position?: number | null;
  id_employee?: number | null;
  id_hr_operation?: number | null;

  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;

  changed_at: Date;
}

export interface ChangeHistoryView extends ChangeHistory {
  objectType: string;
  objectId: number | null;
  userName: string;
}
