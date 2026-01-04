export const ROOM_OPTIONS = [
  'Cozinha',
  'Banheiro',
  'Sala',
  'Quarto',
  'Lavanderia',
  'Outros',
] as const

export type Presente = {
  id: number
  nome: string
  imagemUrl?: string
  linkLoja: string
  comodo: (typeof ROOM_OPTIONS)[number]
}

export const presentes: Presente[] = [
  { id: 1, nome: 'Jogo de Toalhas', linkLoja: 'https://exemplo.com/jogo-de-toalhas', comodo: 'Banheiro' },
  { id: 2, nome: 'Conjunto de Pratos', linkLoja: 'https://exemplo.com/conjunto-de-pratos', comodo: 'Cozinha' },
  { id: 3, nome: 'Panela de Ferro', linkLoja: 'https://exemplo.com/panela-de-ferro', comodo: 'Cozinha' },
  { id: 4, nome: 'Kit de Copos', linkLoja: 'https://exemplo.com/kit-de-copos', comodo: 'Cozinha' },
  { id: 5, nome: 'Jarra de Vidro', linkLoja: 'https://exemplo.com/jarra-de-vidro', comodo: 'Cozinha' },
  { id: 6, nome: 'Jogo de Lençóis', linkLoja: 'https://exemplo.com/jogo-de-lencois', comodo: 'Quarto' },
  { id: 7, nome: 'Organizadores de Gaveta', linkLoja: 'https://exemplo.com/organizadores', comodo: 'Quarto' },
  { id: 8, nome: 'Conjunto de Talheres', linkLoja: 'https://exemplo.com/talheres', comodo: 'Cozinha' },
  { id: 9, nome: 'Assadeiras', linkLoja: 'https://exemplo.com/assadeiras', comodo: 'Cozinha' },
]
