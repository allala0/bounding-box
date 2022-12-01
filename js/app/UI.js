/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import HoverableElement from './HoverableElement.js'

let keyCounter = 0;
const c = (element, props, ...content) => React.createElement(element, {key: props.key === undefined ? keyCounter++ : props.key, ...props}, ...content);
// const c = React.createElement;

class UI extends React.Component{
    constructor(props){
        super(props);
        this.state = this.generateInitialState();
    }

    generateInitialState(){
        return {};
    }

    reset(){
        this.setState(this.generateInitialState());
    }

    render(){
        return [];
    }
}

export default UI;
