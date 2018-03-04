export interface JigsawPiece {
   id: number;
   topleft: number[];
   GridPosition: number[];
   pattern: string;
   tlCorner: number[];
   joiningPieces?: number[];
}
