/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import {FontLoader} from '/js/lib/three.js-master/examples/jsm/loaders/FontLoader.js';

import Asset from "./Asset.js";

class Font extends Asset{
    constructor(assetPath, parameters={}){
        super(assetPath, new FontLoader, parameters);

    }
}

export default Font;