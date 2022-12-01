/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import TexturedPlane from './TexturedPlane.js';

class AnimatedPlane extends TexturedPlane{
    constructor(material, size=1, sizeAxis=null, parameters={}){
        super(material, size, sizeAxis, parameters);
        this.isAnimatedPlane = true;
        this.forceHidden = false;
    }

    update(){
        if(this.material.update) this.material.update();
        if(this.material.hidden === true || this.material.hidden === false) this.visible = !this.material.hidden;
        if(this.forceHidden) this.visible = false;
    }

    clone(){
        return new AnimatedPlane(this.material.clone(), this.size, this.sizeAxis, {...this.parameters});
    }
}

export default AnimatedPlane;
