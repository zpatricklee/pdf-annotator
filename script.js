const canvas = document.getElementById('background-pdf');
const myCanvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
const ctx = myCanvas.getContext('2d');
const downloadBtn = document.getElementById('download-btn');
const output = document.querySelector('.output');

let canvasX;
let canvasY = myCanvas.offsetTop; // 13
let last_mouseX = 0;
let last_mouseY = 0;
let mouseX = 0;
let mouseY = 0;
let mousedown = false;

pdfjsLib.getDocument('./sample.pdf').then((doc) => {
  // console.log('This file has ' + doc._pdfInfo.numPages + ' page/s');

  doc
    .getPage(1)
    .then((page) => {
      const viewport = page.getViewport(1);
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      page.render({
        canvasContext: context,
        viewport: viewport,
      });

      // Set myCanvas element to have same dimensions as background-pdf and place download button below
    })
    .then(setElements);
});

const setElements = () => {
  myCanvas.width = canvas.width; // 792
  myCanvas.height = canvas.height; // 612
  downloadBtn.style.top = `${canvas.height + 20}px`;
  output.style.top = `${canvas.height + 50}px`;
  // console.log(myCanvas.width, myCanvas.height);

  canvasX = myCanvas.offsetLeft;
};

// ANNOTATE PDF
// Mousedown
myCanvas.onmousedown = (e) => {
  last_mouseX = parseInt(e.clientX - canvasX);
  last_mouseY = parseInt(e.clientY - canvasY);
  mousedown = true;
};

// Mouseup
myCanvas.onmouseup = (e) => {
  mousedown = false;
};

// Mousemove
myCanvas.onmousemove = (e) => {
  mouseX = parseInt(e.clientX - canvasX);
  mouseY = parseInt(e.clientY - canvasY);
  if (mousedown) {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    ctx.beginPath();
    let width = mouseX - last_mouseX;
    let height = mouseY - last_mouseY;
    ctx.rect(last_mouseX, last_mouseY, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0)';
    ctx.fill();
    ctx.strokeStyle = 'rgb(255,0,0)';
    ctx.lineWidth = 1;
    ctx.fillRect(last_mouseX, last_mouseY, width, height);
    ctx.stroke();
  }

  output.innerHTML = `current: ${mouseX}, ${mouseY} <br>mousedown: ${mousedown}`;
};

// Download/Save as PDF
downloadBtn.addEventListener('click', () => {
  // Merge canvasses and get PNG data URL
  const newCanvas = document.createElement('canvas'),
    newContext = newCanvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height;

  newCanvas.width = width;
  newCanvas.height = height;

  [canvas, myCanvas].forEach((n) => {
    newContext.beginPath();
    newContext.drawImage(n, 0, 0, width, height);
  });

  const filename = 'final.pdf';

  let pdf = new jsPDF('l', 'in', 'letter');
  pdf.addImage(newCanvas.toDataURL(), 'PNG', 0, 0, 11, 8.5);
  pdf.save(filename);
});
