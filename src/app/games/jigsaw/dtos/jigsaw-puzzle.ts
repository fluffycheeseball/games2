export class JigsawPuzzle {
    public puzzleWidth: number;
    public puzzleHeight: number;
    public pieceWidth: number;
    public pieceHeight: number;
    public verticals: string[];
    public horizontals: string[];
    public imageUrl: string;
    // Each jigsaw piece extends beyond its basic rectangle by amount that 
    // is dependent on the  jigsaw size/num pieces and also whether the nodule
    // is concave or convext relative to the piece
    public concaveAllowance: number;
    public convexAllowance: number;
}

