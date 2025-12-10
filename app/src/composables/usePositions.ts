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

  const searchPositions = async (
    q: string,
    limit = 5,
    offset = 0,
  ): Promise<{ items: Position[]; hasMore: boolean }> => {
    const res = await http.get('/positions/search', {
      params: {
        q,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
    return res.data as { items: Position[]; hasMore: boolean }
  }

  const getPositionById = async (id: number): Promise<Position | null> => {
    const res = await http.get<Position>(`/positions/${id}`)
    return res.data ?? null
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
    searchPositions,
    getPositionById,
    savePosition,
    deletePosition,
    restorePosition
  }
}
