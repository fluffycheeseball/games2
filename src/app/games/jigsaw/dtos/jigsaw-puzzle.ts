export class JigsawPuzzle {
    public puzzleWidth: number;
    public puzzleHeight: number;
    public pieceWidth: number;
    public pieceHeight: number;
    public verticals: string[];
    public horizontals: string[];
    public imageUrl: string;
    public lockedPieceIndex?: number;
    public lockX?: number;
    public lockY?: number;
}

