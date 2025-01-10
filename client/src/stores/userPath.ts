import { defineStore } from 'pinia'


export const usePathStore = defineStore('path', {
    state: () => ({
      currentPath: '',
      isGroup: false,
      isPersonal: false,
    }),
    actions: {
      setPath(path: string) {
        this.currentPath = path
        this.isGroup = path.includes('/:username/:group')
        this.isPersonal = path.includes('/:username') && !path.includes('/:username/:group')
      }
    },
    getters: {
      isGroupPath: (state) => state.isGroup,
      isPersonalPath: (state) => state.isPersonal,
    },
  })

export type UserPath = ReturnType<typeof usePathStore>