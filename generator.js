/**
 * Joins closed Potrace paths while minimizing un-cut travel moves
 * Developed by Costel (costycnc)
 */
function extract(costyx) {
    let pathx = [[0,0]];
    let minDiff = Number.MAX_VALUE;
    let currDiff = 0;
    let pos0, pat1, pos1;
    let x, y, x1, y1, x2, y2, p;

    while(costyx.length) {    
        minDiff = Number.MAX_VALUE;
        for(let i = 0; i < pathx.length; i = i + 10) {
            for(let m = 0; m < costyx.length; m++) {
                for(let n = 0; n < costyx[m].length; n++) {
                    x = pathx[i][0];
                    y = pathx[i][1];
                    x1 = costyx[m][n][0];
                    y1 = costyx[m][n][1];                        
                    x2 = x - x1;
                    y2 = y - y1;
                    currDiff = x2 * x2 + y2 * y2;                      
                    if(currDiff < minDiff) {
                        minDiff = currDiff;
                        pos0 = i;
                        pat1 = m;
                        pos1 = n;
                    } 
                }           
            }    
        }
    
        p = costyx.splice(pat1, 1)[0];
        p = p.splice(pos1).concat(p); // Rotate path
        p.push(p[0]);                 // Close path
        pathx = pathx.slice(0, pos0).concat(p, pathx.slice(pos0 - 1));
    }
    return pathx;
}

/**
 * Encodes the continuous coordinate path into a compressed 2-bit byte stream
 */
function convertPathTo2BitBytes(pathx) {
    let streamBytes = [];
    let currentByte = 0;
    let moveCount = 0;

    for (let i = 1; i < pathx.length; i++) {
        let p1 = pathx[i - 1]; // Previous point [x, y]
        let p2 = pathx[i];     // Current point [x, y]
        let moveBits = 0b00;

        // Compare X and Y elements to determine relative single-step direction
        if (p2[0] > p1[0])      moveBits = 0b00; // Right (+X)
        else if (p2[0] < p1[0]) moveBits = 0b01; // Left (-X)
        else if (p2[1] > p1[1]) moveBits = 0b10; // Up (+Y)
        else if (p2[1] < p1[1]) moveBits = 0b11; // Down (-Y)

        // Shift existing bits left by 2, then overlay new move bits
        currentByte = (currentByte << 2) | moveBits;
        moveCount++;

        // Once 4 moves fill up the byte (8 bits), store it and reset
        if (moveCount === 4) {
            streamBytes.push(currentByte);
            currentByte = 0;
            moveCount = 0;
        }
    }

    // Handle any leftover trailing moves in the final byte
    if (moveCount > 0) {
        currentByte = currentByte << ((4 - moveCount) * 2);
        streamBytes.push(currentByte);
    }

    return streamBytes;
}
