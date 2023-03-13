export interface Combination {
  value: number;
  cards: number[];
}

export interface ApiResponse {
  equal?: Combination;
  ceil?: Combination;
  floor?: Combination;
}
