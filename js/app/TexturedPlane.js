/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import * as THREE from '/js/lib/three.js-master/build/three.module.js';

class TexturedPlane extends THREE.Mesh{
    constructor(material, size=1, sizeAxis=null, parameters={}){
        const aspectRatio = material.spriteSheet.source.data.width / material.spriteSheet.source.data.height * (material.tilesSize ? (material.tilesSize.y / material.tilesSize.x) : 1);
        if(sizeAxis === null) sizeAxis = aspectRatio < 1 ? 'x' : 'y';
        const geometry = new THREE.PlaneGeometry(1 * aspectRatio, 1);
        super(geometry, material);

        this.isTexturedPlane = true;

        this.setSize(size, sizeAxis);

        this.position.x += parameters.x !== undefined ? parameters.x : 0;
        this.position.y += parameters.y !== undefined ? parameters.y : 0;
        this.position.z += parameters.z !== undefined ? parameters.z : 0;
        
        if(parameters.scaleMultiplierX !== undefined) this.scale.x *= parameters.scaleMultiplierX;
        if(parameters.scaleMultiplierY !== undefined) this.scale.y *= parameters.scaleMultiplierY;

        this.renderOrder = parameters.renderOrder !== undefined ? parameters.renderOrder : 0;

        this.size = size;
        this.sizeAxis = sizeAxis;
        this.parameters = parameters;
    }
}

export default TexturedPlane;
