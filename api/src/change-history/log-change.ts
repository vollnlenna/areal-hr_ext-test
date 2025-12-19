import { ChangeHistoryService } from './change-history.service';

type EntityType =
  | 'organization'
  | 'department'
  | 'position'
  | 'employee'
  | 'hr_operation';

type IdKeyMap = {
  organization: 'id_organization';
  department: 'id_department';
  position: 'id_position';
  employee: 'id_employee';
  hr_operation: 'id_hr_operation';
};

const idKeys: IdKeyMap = {
  organization: 'id_organization',
  department: 'id_department',
  position: 'id_position',
  employee: 'id_employee',
  hr_operation: 'id_hr_operation',
};

interface LogChangeParams<T extends Record<string, unknown>> {
  entity: EntityType;
  oldRow: T;
  newRow: T;
  id_user: number;
}

export async function logEntityChanges<T extends Record<string, unknown>>(
  history: ChangeHistoryService,
  params: LogChangeParams<T>,
): Promise<void> {
  const { entity, oldRow, newRow, id_user } = params;

  const idKey = idKeys[entity];

  const entityId =
    (oldRow[idKey] as number | undefined) ??
    (newRow[idKey] as number | undefined);

  const skipFields = new Set(['created_at', 'updated_at']);

  for (const key of Object.keys(newRow) as Array<keyof T>) {
    if (skipFields.has(key as string)) continue;

    const oldVal = oldRow[key];
    const newVal = newRow[key];

    if (key === 'deleted_at') {
      const oldIsNull = oldVal == null;
      const newIsNull = newVal == null;
      if (oldIsNull && newIsNull) continue;
    }

    if (key === 'birth_date') {
      const oldStr = String(oldVal).trim();
      const newStr = String(newVal).trim();
      if (oldStr === newStr) continue;
    }

    if (oldVal === newVal) continue;

    await history.logChange({
      id_user,
      [idKey]: entityId ?? null,
      field_name: String(key),
      old_value: oldVal != null ? String(oldVal) : null,
      new_value: newVal != null ? String(newVal) : null,
    });
  }
}
