import { ref, computed } from 'vue'
import http from '../api/http'
import type { Position, PositionSave } from '../entities/position'

export function usePositions() {
  const actualList = ref<Position[]>([])
  const deletedList = ref<Position[]>([])

  const loadPositions = async () => {
    const [actualRes, deletedRes] = await Promise.all([
      http.get<Position[]>('/positions'),
      http.get<Position[]>('/positions/deleted')
    ])
    actualList.value = actualRes.data
    deletedList.value = deletedRes.data
  }

  const savePosition = async (payload: PositionSave) => {
    const body = { name: payload.name }
    if (payload.id_position) {
      await http.patch(`/positions/${payload.id_position}`, body)
    } else {
      await http.post('/positions', body)
    }
    await loadPositions()
  }

  const deletePosition = async (id: number) => {
    await http.delete(`/positions/${id}`)
    await loadPositions()
  }

  const restorePosition = async (id: number) => {
    await http.patch(`/positions/restore/${id}`)
    await loadPositions()
  }

  return {
    actualList: computed(() => actualList.value),
    deletedList: computed(() => deletedList.value),
    loadPositions,
    savePosition,
    deletePosition,
    restorePosition
  }
}
