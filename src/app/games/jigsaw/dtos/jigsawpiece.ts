import { Piece } from "../../decoder/dtos/piece";


export interface JigsawPiece extends Piece {
   topleft: number[];
   GridPosition: number[];
   pattern: string;
}
