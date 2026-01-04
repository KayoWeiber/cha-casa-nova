export type Presente = {
  id: number
  nome: string
  imagemUrl?: string
  linkLoja: string
}

export const presentes: Presente[] = [
  { id: 1, nome: 'Jogo de Toalhas', linkLoja: 'https://exemplo.com/jogo-de-toalhas' },
  { id: 2, nome: 'Conjunto de Pratos', linkLoja: 'https://exemplo.com/conjunto-de-pratos' },
  { id: 3, nome: 'Panela de Ferro', linkLoja: 'https://exemplo.com/panela-de-ferro' },
  { id: 4, nome: 'Kit de Copos', linkLoja: 'https://exemplo.com/kit-de-copos' },
  { id: 5, nome: 'Jarra de Vidro', linkLoja: 'https://exemplo.com/jarra-de-vidro' },
  { id: 6, nome: 'Jogo de Lençóis', linkLoja: 'https://exemplo.com/jogo-de-lencois' },
  { id: 7, nome: 'Organizadores de Gaveta', linkLoja: 'https://exemplo.com/organizadores' },
  { id: 8, nome: 'Conjunto de Talheres', linkLoja: 'https://exemplo.com/talheres' },
  { id: 9, nome: 'Assadeiras', linkLoja: 'https://exemplo.com/assadeiras' },
]
