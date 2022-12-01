/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import * as THREE from '/js/lib/three.js-master/build/three.module.js';
import Asset from "./Asset.js";

class Json extends Asset{
    constructor(assetPath, parameters={}){
        const loadCallback = json => JSON.parse(json);
        super(assetPath, new THREE.FileLoader, parameters, loadCallback);

    }
}

export default Json;