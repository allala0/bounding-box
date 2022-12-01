/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import * as THREE from '/js/lib/three.js-master/build/three.module.js';

const VS = `
varying vec2 vUv;
void main(){
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const FS = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 tileSize;
uniform vec2 offset;
uniform vec4 colorMultiplier;
uniform vec4 colorAdd;

void main(){
    vec4 pixel = texture2D(uTexture, vec2(vUv.x / tileSize.x + offset.x, vUv.y / tileSize.y + offset.y));
    pixel.r = pixel.r * colorMultiplier.r + colorAdd.r;
    pixel.g = pixel.g * colorMultiplier.g + colorAdd.g;
    pixel.b = pixel.b * colorMultiplier.b + colorAdd.b;
    pixel.a = pixel.a * colorMultiplier.a + colorAdd.a;

    gl_FragColor = pixel;
}
`;

class AnimatedMaterial extends THREE.ShaderMaterial{
    constructor(spriteSheet, tilesSize=new THREE.Vector2, parameters={}){
        super();
        
        this.colorMultiplier = parameters.colorMultiplier !== undefined ? parameters.colorMultiplier : new THREE.Vector4(1, 1, 1, 1);
        this.colorAdd = parameters.colorAdd !== undefined ? parameters.colorAdd : new THREE.Vector4(0, 0, 0, 0);

        this.vertexShader = VS; 
        this.fragmentShader = FS;
        this.uniforms = {
            uTexture: {value: spriteSheet},
            tileSize: {value: tilesSize},
            offset: {value: new THREE.Vector2},
            colorMultiplier: {value: new THREE.Vector4(1, 1, 1, 1)},
            colorAdd: {value: new THREE.Vector4(0, 0, 0, 0)}
        };
        
        this.debug = parameters.debug !== undefined ? parameters.debug : false;

        this.isAnimatedMaterial = true;

        this.parameters = parameters;

        this.hidden = false;

        this.tilesSize = tilesSize;
        this.x = 0;
        this.y = 0;
        this.clock = new THREE.Clock();
        this.lastFrameChange = this.clock.getElapsedTime();
        this.paused = true;
        this.reverse = parameters.reverse !== undefined ? parameters.reverse : false;
        this.loop = parameters.loop !== undefined ? parameters.loop : false;
        this.bounce = parameters.bounce !== undefined ? parameters.bounce : false;
        this.hideAfterPause = parameters.hideAfterPause !== undefined ? parameters.hideAfterPause : true;
        this.autoplay = parameters.autoplay !== undefined ? parameters.autoplay : false;
        this.fps = parameters.fps !== undefined ? parameters.fps : 30;
        this.numOfBlankTiles =  parameters.numOfBlankTiles !== undefined ? parameters.numOfBlankTiles : 0;
        this.hasAlpha = spriteSheet.userData.hasAlpha !== undefined ? spriteSheet.userData.hasAlpha : true;
        this.repeat = spriteSheet.userData.repeat !== undefined ? spriteSheet.userData.repeat : 0;
        this.side = spriteSheet.userData.doubleSide !== undefined ? THREE.DoubleSide : THREE.FrontSide;
        this.spriteSheet = spriteSheet;
        this.needsUpdate = true;
        this.spriteSheet.minFilter = THREE.LinearFilter;

        this.transparent = true;
        this.depthWrite = false;
        // this.polygonOffset = true; 
        // this.polygonOffsetFactor = 100;
        if(!this.hasAlpha) this.blending = THREE.AdditiveBlending;

        this.startedReverse = this.reverse;

        if(this.autoplay) this.play();
        else this.hidden = true;
    }

    get frameIndex(){
        return this.y * this.tilesSize.x + this.x;
    }

    set frameIndex(index){
        this.x = index % this.tilesSize.x;
        this.y = Math.floor(index / this.tilesSize.x);
    }

    nextFrame(){
        if(this.frameIndex + 1 >= this.tilesSize.x * this.tilesSize.y - this.numOfBlankTiles){
            if(this.bounce) this.reverse = true;
            else{
                if(!this.loop && this.repeat <= 0) this.pause();
                else this.frameIndex = 0;
                if(this.startedReverse) this.repeat--;
            } 
        }
        else this.frameIndex += 1;
    }

    previousFrame(){
        if(this.frameIndex - 1 < 0){
            if(this.bounce) this.reverse = false;
            else if (this.loop || this.repeat > 0) this.frameIndex = this.tilesSize.x * this.tilesSize.y - this.numOfBlankTiles - 1;
            if(!this.loop && this.repeat <= 0) this.pause();
            if(!this.startedReverse) this.repeat--;
        }
        else this.frameIndex -= 1;
    }

    play(){
        if(!this.reverse) this.frameIndex = 0;
        else this.frameIndex = this.tilesSize.x * this.tilesSize.y - this.numOfBlankTiles - 1;
        this.paused = false;
        this.hidden = false;
        this.startedReverse = this.reverse;
    }

    pause(){
        this.paused = true;
    }

    update(){
        if(this.hideAfterPause && this.paused) this.hidden = true;
        
        this.uniforms.colorMultiplier.value = this.colorMultiplier;
        this.uniforms.colorAdd.value = this.colorAdd;

        this.uniforms.offset.value.x = this.x / this.tilesSize.x;
        this.uniforms.offset.value.y = 1 - (this.y + 1) / this.tilesSize.y;
        
        if(this.paused) return;
        const currTime = this.clock.getElapsedTime();
        if(currTime >= this.lastFrameChange + 1 / this.fps){
            this.lastFrameChange = currTime;
            if(this.reverse) this.previousFrame();
            else this.nextFrame();
        }
    }

    clone(){
        return new AnimatedMaterial(this.spriteSheet, this.tilesSize.clone(), {...this.parameters})
    }
}

export default AnimatedMaterial;