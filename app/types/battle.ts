export interface Battle {
  battleId: number;
  pet1: number;
  pet2: number;
  creator: string;
  active: boolean;
  totalStakePet1: string;
  totalStakePet2: string;
  winner: number;
  createdAt?: number;
}

export interface Pet {
  tokenId: number;
  owner: string;
  image: string;
  name: string;
  multiplier: string;
  level: string;
}
