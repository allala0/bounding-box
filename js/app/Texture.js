/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import Asset from './Asset.js';

import * as THREE from '/js/lib/three.js-master/build/three.module.js';

class Texture extends Asset{
    constructor(assetPath, parameters={}){
        const loadCallback = texture => {
            for(const name in parameters){
                texture.userData[name] = parameters[name];
            }
        }
        super(assetPath, new THREE.TextureLoader, parameters, loadCallback);

        this.isTexture = true;
    }
}

export default Texture;
