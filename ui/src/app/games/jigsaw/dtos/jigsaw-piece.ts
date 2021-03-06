export interface JigsawPiece {
    id: number;
    topLeft: number[];
    GridPosition: number[];
    pattern: string;
    joiningPieces?: number[];
    sideAllowance: number[];
    top: number;
    left: number;
    bottom: number;
    right: number;
    centre: number;
    middle: number;
    height: number;
    width: number;
}
