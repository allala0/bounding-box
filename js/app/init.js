/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import Game from './Game.js'
//CREATING CONTAINER FOR REACT ELEMENT
const container = document.createElement('div');
container.classList.add('mount');
document.body.appendChild(container);
// CREATING AND RENDERING REACT ELEMENT INSIDE CONTAINER
ReactDOM.render(React.createElement(Game), container);