/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import Texture from './Texture.js';

import * as THREE from '/js/lib/three.js-master/build/three.module.js';

class SpriteSheet extends Texture{
    constructor(assetPath, tileSize=new THREE.Vector2(1, 1), parameters={}){
        super(assetPath, parameters);
        this.isSpriteSheet = true;

        this.tileSize = tileSize;
    }
}

export default SpriteSheet;
