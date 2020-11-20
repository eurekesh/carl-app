function generateID() { // based on https://www.codegrepper.com/code-examples/delphi/how+to+generate+random+alphabet+in+javascript
    let res = "";
    let possible = "ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz023456789"; // I have removed i,I,l,L, and 1 because they are often confused

    for (let i = 0; i < 6; i++) {
        res += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return res;
}

function chooseNoun(){
    const nounArr = ["microwave","knife","candlestick","revolver","lamppost","YEET","school of fish","jungle","whale"];
    return nounArr[Math.floor(Math.random() * nounArr.length)];
}

module.exports = {
    generateID,
    chooseNoun
}