var signed = false;
var draw = false;

var canvas = document.getElementById('canvas').getContext('2d');


$('#canvas').on('click', function() {
  signed = true;
});


$('#canvas').on('mousedown', function() {
  console.log('mouse goes down');
  draw = true;
  signed = true;
  canvas.lineWidth = 3;
  canvas.beginPath();
});

$('#canvas').on('mousemove', function(e) {
  console.log('mouse movin');
  if (draw == true) {
    canvas.lineTo(e.pageX - $('#canvas').offset().left, e.pageY - $('#canvas').offset().top);
    canvas.stroke();
  }
});

$('#canvas').on('mouseup', function() {
  draw = false;
  console.log('mouse goes up');
  var data = document.getElementById('canvas').toDataURL();
  $("input[name=signature]").val(data);
});
//
// //Canvas
// var canvas = document.getElementById('canvas');
// var ctx = canvas.getContext('2d');
// //Variables
// var canvasx = $(canvas).offset().left;
// var canvasy = $(canvas).offset().top;
// var last_mousex = last_mousey = 0;
// var mousex = mousey = 0;
// var mousedown = false;
// var tooltype = 'draw';
//
// //Mousedown
// $(canvas).on('mousedown', function(e) {
//     console.log('touch????');
//     // let sig = canvas.toDataUrl();
//     var canvas = document.getElementById("canvas");
//     var dataURL = canvas.toDataURL();
//     console.log(dataURL);
//     last_mousex = mousex = parseInt(e.clientX-canvasx);
// 	last_mousey = mousey = parseInt(e.clientY-canvasy);
//     mousedown = true;
// });
//
// //Mouseup
// $(canvas).on('mouseup', function(e) {
//     mousedown = false;
//     var data = canvas.toDataURL()
//     $('input:hidden').val(data)
// });
//
// //Mousemove
// $(canvas).on('mousemove', function(e) {
//     mousex = parseInt(e.clientX-canvasx);
//     mousey = parseInt(e.clientY-canvasy);
//     if(mousedown) {
//         ctx.beginPath();
//         if(tooltype =='draw') {
//             ctx.globalCompositeOperation = 'source-over';
//             ctx.strokeStyle = 'black';
//             ctx.lineWidth = 3;
//         } else {
//             ctx.globalCompositeOperation = 'destination-out';
//             ctx.lineWidth = 10;
//         }
//         ctx.moveTo(last_mousex,last_mousey);
//         ctx.lineTo(mousex,mousey);
//         ctx.lineJoin = ctx.lineCap = 'round';
//         ctx.stroke();
//     }
//     last_mousex = mousex;
//     last_mousey = mousey;
//     //Output
//     $('#output').html('current: '+mousex+', '+mousey+'<br/>last: '+last_mousex+', '+last_mousey+'<br/>mousedown: '+mousedown);
// });
