import i18next from '../config/i18next'
import data from '../assets/languages/en.json'
export type i18Keys = keyof typeof data

export const FM = (id: i18Keys, values?: any): string => {
  // @ts-ignore
  return i18next.t(id, values)
}
