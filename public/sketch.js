
let socket = io();
let drawing = false;
let lastPoint = null;
let isEraser = false;

let colorPicker, lineWidthSlider, opacitySlider, brushSelect;
let brushType = "aquarela";

let userName = '', roomName = '';

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);

  colorPicker = select('#colorPicker');
  lineWidthSlider = select('#lineWidthSlider');
  opacitySlider = select('#opacitySlider');
  brushSelect = select('#brushSelect');
  
  // select('#eraserBtn').mousePressed(() => {
  //   isEraser = !isEraser;
  //   select('#eraserBtn').html(isEraser ? '🖌️' : '🧽'); // alterna entre pincel e borracha
  //   select('#eraserBtn').style('background', isEraser ? '#ddd' : '#fff');
  // });

  select('#eraserBtn').mousePressed(() => {
    isEraser = !isEraser;
    const eraserBtn = select('#eraserBtn');
    eraserBtn.html(isEraser ? '🖌️' : '🧽');
    eraserBtn.style('background', isEraser ? '#ffc107' : '#eee');
    eraserBtn.class(isEraser ? 'active' : '');
  });
  

  const opacityValue = select('#opacityValue');
  opacitySlider.input(() => {
    opacityValue.html(`Opacidade: ${Math.round(opacitySlider.value() * 100)}%`);
  });

  brushSelect.changed(() => {
    brushType = brushSelect.value();
  });

  select('#joinBtn').mousePressed(() => {
    userName = select('#nameInput').value() || 'Anônimo';
    roomName = select('#roomInput').value() || 'geral';
    select('#loginScreen').hide();
    socket.emit('join-room', { user: userName, room: roomName });
  });

  socket.on('draw-brush', ({ x, y, color, size, opacity, type, isEraser }) => {
    drawBrush(x, y, color, size, opacity, type, isEraser);
  });

  select('#saveBtn').mousePressed(() => {
    saveCanvas('meu_desenho', 'png');
  });
  
}

function draw() {}

function mousePressed() {
  drawing = true;
  lastPoint = { x: mouseX, y: mouseY };
}

function mouseReleased() {
  drawing = false;
  lastPoint = null;
}

let lastEmit = 0;
const emitInterval = 10; // em ms

function mouseDragged() {
  if (!drawing) return;

  const now = millis();
  if (now - lastEmit < emitInterval) return;

  const colorVal = colorPicker.value();
  const size = parseInt(lineWidthSlider.value());
  const opacity = parseFloat(opacitySlider.value());
  const spacing = 4;
  const currentPoint = { x: mouseX, y: mouseY };
  const distance = dist(lastPoint.x, lastPoint.y, currentPoint.x, currentPoint.y);
  const steps = Math.ceil(distance / spacing);

  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const x = lerp(lastPoint.x, currentPoint.x, t);
    const y = lerp(lastPoint.y, currentPoint.y, t);
    drawBrush(x, y, colorVal, size, opacity, brushType, isEraser);
    // socket.emit('draw-brush', { x, y, color: colorVal, size, opacity, type: brushType, room: roomName });
    socket.emit('draw-brush', {
      x, y,
      color: colorVal,
      size,
      opacity,
      type: brushType,
      isEraser,
      room: roomName
    });
    
  }

  lastPoint = currentPoint;
  lastEmit = now;
}

function drawBrush(x, y, colorVal, size, opacity, type, isEraserRemote = false) {
  // Prioriza o estado da borracha recebido remotamente
 // const eraserActive = isEraserRemote || isEraser;
    const eraserActive = isEraserRemote ?? isEraser;

  if (eraserActive) {
    colorVal = '#ffffff';
    opacity = 1;
    type = 'marcador'; // borracha usa linha sólida
  }

  switch (type) {
    case "aquarela": return bleedingBrush(x, y, colorVal, size, opacity);
    case "marcador": return markerBrush(x, y, colorVal, size, opacity);
    case "spray": return sprayBrush(x, y, colorVal, size, opacity);
  }
}

function bleedingBrush(x, y, colorVal, size, opacity) {
  let c = color(colorVal);
  noStroke();
  for (let i = 0; i < 30; i++) {
    let angle = random(TWO_PI);
    let radius = random(size * 0.3, size);
    let r = radius + noise(x * 0.01 + i, y * 0.01 + i) * size * 0.2;
    let px = x + cos(angle) * r;
    let py = y + sin(angle) * r;
    c.setAlpha(random(0.02, 0.07) * opacity * 255);
    fill(c);
    ellipse(px, py, random(size * 0.2, size * 0.6));
  }
}

function markerBrush(x, y, colorVal, size, opacity) {
  let c = color(colorVal);
  c.setAlpha(opacity * 255);
  stroke(c);
  strokeWeight(size);
  strokeCap(ROUND);
  line(x, y, x + 0.1, y + 0.1); // micro linha contínua
}

function sprayBrush(x, y, colorVal, size, opacity) {
  let c = color(colorVal);
  noStroke();
  for (let i = 0; i < 60; i++) {
    let angle = random(TWO_PI);
    let r = random(size / 2);
    let px = x + cos(angle) * r;
    let py = y + sin(angle) * r;
    c.setAlpha(random(0.02, 0.06) * opacity * 255);
    fill(c);
    ellipse(px, py, 1.5, 1.5);
  }
}



