import { Piece } from "../../decoder/dtos/piece";


export interface JigsawPiece extends Piece {
   locationCoords: number[];
   GridPosition: number[];
}
