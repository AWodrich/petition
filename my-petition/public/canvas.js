$('#canv').on("mousedown", getMouse);


function getMouse(e){
    console.log("Clicked canvas");
    let canvas = $('#canv');
    const canvasOffset = canvas.offset();

    let x = e.pageX;
    let y = e.pageY;
    let left = x - canvasOffset.left;
    let top = y - canvasOffset.top;
    console.log('X:', x);
    console.log('=================');
    console.log('LEFT:', left);
    console.log('+++++++++++++++++');
    console.log('TOP:', top);
    let context = canv.getContext("2d");
    console.log('CONTEXT:', context);
    context.beginPath();
    context.fillStyle = "blue";
    context.fill();
    return;

}

//
// canvas.on('mousedown', (e) => {
//
//     var offX = e.layerX - canvas.offsetLeft;
//     var offY = e.layerY - canvas.offsetTop;
//     console.log(offX);
//     console.log(offY);

    // console.log('Canvas:', canvas);
    // const canvasLeft = canvas.offsetLeft;
    // const canvasTop = canvas.offsetTop;
    // console.log('top:',canvasTop);
    // console.log('left:',canvasLeft);

    //
    // canvas.style.left = canvasLeft - 50+ 'px';
    // canvas.style.top = canvasTop - 50+ 'px';
    //
    //
    // console.log('in here');
    // console.log(e);
    // console.log(e.currentTarget);
    // console.log(canvas.getContext);
    // if(canvas.getContext){
    //     var context = canvas.getContext('2d');
    //     console.log('CONTEXT:',context);
    //     context.strokeStyle = '#000';
    //     context.lineWidth = 3;
    //     context.beginPath();
    //     context.lineTo(100, 70);
    //     context.moveTo(10, 25);
    //     context.lineTo(10, 70);
    //     context.stroke();
    // }







// checking if object being returned by canvas does have method getContext.
// if check is successful, the canvas API is being supported by the browser.
    // if(canvas.getContext){
    //     var context = canvas.getContext('2d');
    //     context.strokeStyle = '#000';
    //     context.lineWidth = 3;
    //     context.beginPath();
    //     context.arc(100, 70, 50, 0, 2 * Math.PI);
    //     context.moveTo(100, 125);
    //     context.lineTo(100, 270);
    //     context.lineTo(30, 350);
    //     context.moveTo(100, 270);
    //     context.lineTo(170, 350);
    //     context.moveTo(100, 190);
    //     context.lineTo(180, 110);
    //     context.moveTo(100, 190);
    //     context.lineTo(20, 110);
    //     context.stroke();
    // }
// })();

//
// (function() {
//     var x = 0
//     var y = 0
//
//     var contextBig = document.getElementById('outer').getContext('2d')
//     contextBig.drawImage(fig, x, y);
//     document.addEventListener("keydown", function(e) {
//         console.log(e.which)
//         if (e.which === 40) {
//             x += 3
//             contextBig.clearRect(0, 0, 700, 700)
//             contextBig.drawImage(fig, y, x)
//         }
//         if (e.which === 39) {
//             y += 3
//             contextBig.clearRect(0, 0, 700, 700)
//             contextBig.drawImage(fig, y, x)
//         }
//         if (e.which === 38) {
//             x -= 3
//             contextBig.clearRect(0, 0, 700, 700)
//             contextBig.drawImage(fig, y, x)
//         }
//         if (e.which === 37) {
//             y -= 3
//             contextBig.clearRect(0, 0, 700, 700)
//             contextBig.drawImage(fig, y, x)
//         }
//     })
// })()
