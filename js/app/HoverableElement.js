/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

let keyCounter = 0;
const c = (element, props, ...content) => React.createElement(element, {key: keyCounter++, ...props}, ...content);

class HoverableElement extends React.Component{
    constructor(props){
        super(props);
        this.state = {
  
        };
        this.is_mouse_over = false;
        this.solid_elements = [];
    }
    
    render(){
        keyCounter = 0;
        const rv =  c(this.props.tag, {
            ...this.props, 
            onTouchStart: e => {this.is_mouse_over = true;},
            onMouseEnter: e => {this.is_mouse_over = true;},
            onMouseOver: e => {this.is_mouse_over = true;},
            onMouseLeave: e => {this.is_mouse_over = false;},
            style: {
                ...(this.props.style ? this.props.style : {}),
                pointerEvents: 'auto'
            }
        });  
        return rv;
    }
}

export default HoverableElement;
