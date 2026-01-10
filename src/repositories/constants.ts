export const ROOM_OPTIONS = [
  'Cozinha',
  'Banheiro',
  'Sala',
  'Quarto',
  'Lavanderia',
  'Outros',
] as const

export type Room = typeof ROOM_OPTIONS[number]
