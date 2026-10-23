'use strict';
const frame = document.querySelector('#vista'), direction = document.querySelector('#direccion'), width = document.querySelector('#ancho'), button = document.querySelector('#tema');
let theme = 'claro';
function refresh() {
  frame.style.width = width.value + 'px';
  const src = direction.value + '.html?tema=' + theme;
  document.querySelector('#abrir').href = src;
  if (frame.dataset.direction !== direction.value) {frame.src = src;frame.dataset.direction = direction.value;}
  else frame.contentWindow.postMessage({tema:theme}, '*');
  document.documentElement.dataset.tema = theme;
  button.textContent = theme === 'claro' ? 'Tema oscuro' : 'Tema claro';
  button.setAttribute('aria-pressed', String(theme === 'oscuro'));
}
direction.addEventListener('change',refresh);
width.addEventListener('change',refresh);
button.addEventListener('click',() => {theme = theme === 'claro' ? 'oscuro' : 'claro';refresh();});
frame.addEventListener('load',() => frame.contentWindow.postMessage({tema:theme}, '*'));
refresh();
