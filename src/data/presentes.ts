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
  imageUrl: string
  linkLoja: string
  comodo: (typeof ROOM_OPTIONS)[number]
  removeBg?: boolean
  bgTolerance?: number
  bgSample?: 'corners' | 'border'
}

// =========================
// ARRAYS SEPARADOS POR CÔMODO
// =========================

export const presentesCozinha: Presente[] = [
  { id: 1, nome: 'Prato', linkLoja: 'https://br.shp.ee/wMydspn', comodo: 'Cozinha', imageUrl: '' },
  { id: 2, nome: 'Conjunto copos de vidro', linkLoja: 'https://br.shp.ee/xuhRm93', comodo: 'Cozinha', imageUrl: 'https://down-br.img.susercontent.com/file/sg-11134201-7rbkj-lpauaenldlqv72.webp' },
  { id: 3, nome: 'Conjunto jarra de suco e copos', linkLoja: 'https://br.shp.ee/4Tjmonq', comodo: 'Cozinha', imageUrl: '' },
  { id: 4, nome: '24 peças de talheres de aço inox', linkLoja: 'https://br.shp.ee/D6YDPbu', comodo: 'Cozinha', imageUrl: '' },
  { id: 5, nome: 'Kit utensílios de cozinha', linkLoja: 'https://br.shp.ee/bVtDkW6', comodo: 'Cozinha', imageUrl: '' },
  { id: 6, nome: 'Conjunto de assadeiras', linkLoja: 'https://br.shp.ee/JRUyKDd', comodo: 'Cozinha', imageUrl: '' },
  { id: 7, nome: 'Garrafa térmica café', linkLoja: 'https://br.shp.ee/g4aJKdu', comodo: 'Cozinha', imageUrl: '' },
  { id: 8, nome: 'Kit 3 formas redondas', linkLoja: 'https://br.shp.ee/zo2VyfG', comodo: 'Cozinha', imageUrl: '' },
  { id: 9, nome: 'Jogo de 6 canecas tulipas', linkLoja: 'https://br.shp.ee/JAPQdbU', comodo: 'Cozinha', imageUrl: '' },
  { id: 10, nome: 'Conjunto bowls inox com tampa', linkLoja: 'https://br.shp.ee/WHVr842', comodo: 'Cozinha', imageUrl: '' },
  { id: 11, nome: 'Porta frios acrílico', linkLoja: 'https://br.shp.ee/fJYimBH', comodo: 'Cozinha', imageUrl: '' },
  { id: 12, nome: 'Fatiador, cortador e ralador', linkLoja: 'https://br.shp.ee/Dkbmcrn', comodo: 'Cozinha', imageUrl: '' },
  { id: 13, nome: 'Jogo de xícara', linkLoja: 'https://br.shp.ee/FGL4vmu', comodo: 'Cozinha', imageUrl: '' },
  { id: 14, nome: 'Porta pão', linkLoja: 'https://br.shp.ee/WWh9zGA', comodo: 'Cozinha', imageUrl: '' },
  { id: 15, nome: 'Forma de gelo', linkLoja: 'https://br.shp.ee/KNaMrQB', comodo: 'Cozinha', imageUrl: '' },
  { id: 16, nome: 'Jogo de taças champanhe', linkLoja: 'https://br.shp.ee/jhfZFWY', comodo: 'Cozinha', imageUrl: '' },
  { id: 17, nome: 'Abridor de garrafa', linkLoja: 'https://br.shp.ee/AgepyF9', comodo: 'Cozinha', imageUrl: '' },
  { id: 18, nome: 'Jogo 6 taças de vinho', linkLoja: 'https://br.shp.ee/p4y29CN', comodo: 'Cozinha', imageUrl: '' },
  { id: 19, nome: 'Porta ovos', linkLoja: 'https://br.shp.ee/L1gBDGA', comodo: 'Cozinha', imageUrl: '' },
  { id: 20, nome: 'Prato para bolo', linkLoja: 'https://br.shp.ee/Vo2gnaN', comodo: 'Cozinha', imageUrl: '' },
  { id: 21, nome: 'Kit 6 taças de vidro pra sobremesa', linkLoja: 'https://br.shp.ee/s35DJ99', comodo: 'Cozinha', imageUrl: '' },
  { id: 22, nome: 'Kit organizador de geladeira', linkLoja: 'https://br.shp.ee/Lga7EMu', comodo: 'Cozinha', imageUrl: '' },
  { id: 23, nome: 'Kit lixeira, dispenser', linkLoja: 'https://br.shp.ee/TZfQnhU', comodo: 'Cozinha', imageUrl: '' },
  { id: 24, nome: 'Tapioqueira', linkLoja: 'https://br.shp.ee/TD8FELN', comodo: 'Cozinha', imageUrl: '' },
  { id: 25, nome: 'Fruteira de inox', linkLoja: 'https://br.shp.ee/CQ3NKfy', comodo: 'Cozinha', imageUrl: '' },
  { id: 26, nome: 'Meleira', linkLoja: 'https://br.shp.ee/RKuSc58', comodo: 'Cozinha', imageUrl: '' },
  { id: 27, nome: 'Kit panela de pressão e cuscuzeira', linkLoja: 'https://br.shp.ee/j7WnWhz', comodo: 'Cozinha', imageUrl: '' },
  { id: 28, nome: 'Potes hermético para mantimentos', linkLoja: 'https://br.shp.ee/MQGYFgr', comodo: 'Cozinha', imageUrl: '' },
]

export const presentesBanheiro: Presente[] = [
  // exemplo (adicione os seus)
  { id: 29, nome: 'Jogo de Toalhas', linkLoja: 'https://exemplo.com/jogo-de-toalhas', comodo: 'Banheiro', imageUrl: '' },
]

export const presentesSala: Presente[] = [
  // vazio por enquanto
]

export const presentesQuarto: Presente[] = [
  // exemplos (adicione os seus)
  { id: 30, nome: 'Jogo de Lençóis', linkLoja: 'https://exemplo.com/jogo-de-lencois', comodo: 'Quarto', imageUrl: '' },
  { id: 31, nome: 'Organizadores de Gaveta', linkLoja: 'https://exemplo.com/organizadores', comodo: 'Quarto', imageUrl: '' },
]

export const presentesLavanderia: Presente[] = [
  // vazio por enquanto
]

export const presentesOutros: Presente[] = [
  // vazio por enquanto
]

// =========================
// ARRAY FINAL (TUDO JUNTO)
// =========================
export const presentes: Presente[] = [
  ...presentesCozinha,
  ...presentesBanheiro,
  ...presentesSala,
  ...presentesQuarto,
  ...presentesLavanderia,
  ...presentesOutros,
]

// (opcional, mas útil) mapa por cômodo
export const presentesPorComodo = {
  Cozinha: presentesCozinha,
  Banheiro: presentesBanheiro,
  Sala: presentesSala,
  Quarto: presentesQuarto,
  Lavanderia: presentesLavanderia,
  Outros: presentesOutros,
} satisfies Record<(typeof ROOM_OPTIONS)[number], Presente[]>
