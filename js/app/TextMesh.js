/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import * as THREE from '/js/lib/three.js-master/build/three.module.js';
import {TextGeometry} from '/js/lib/three.js/examples/jsm/geometries/TextGeometry.js';


class TextMesh extends THREE.Mesh{
    constructor(text, font, height=0.0001, size=0.5, material=new THREE.MeshBasicMaterial, materialParameters={}){
        super(new TextGeometry(text, {font: font, height: height, size: size}), material);
        
        this.isTextMesh = true;

        this.font = font;
        this.height = height;
        this.size = size;
        
        this._text = text;
        this.text = text;
        
        this._position = this.position.clone();
        this.center(this.getWorldPosition(new THREE.Vector3));

        for(const [name, value] of Object.entries(materialParameters)){
            this.material[name] = value
        }
    }

    update(){
        if(this.text !== this._text){
            this._text = this.text;
            this.geometry.dispose();
            this.geometry = new TextGeometry(this.text, {font: this.font, height: this.height, size: this.size});
            this.position.copy(this._position);
            this.center(this._position);
        }
    }

}

export default TextMesh;
