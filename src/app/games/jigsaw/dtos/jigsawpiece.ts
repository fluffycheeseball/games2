export interface JigsawPiece {
   id: number;
   topLeft: number[];
   GridPosition: number[];
   pattern: string;
   joiningPieces?: number[];
   sideAllowance: number[];
   tlbr: number[];
}
