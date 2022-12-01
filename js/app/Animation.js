/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import * as THREE from '/js/lib/three.js-master/build/three.module.js';

class Animation{
    constructor(object, property, endState, parameters={}){
        this.isAnimation = true;
        
        this._object = object;
        this._property = property;

        this._startState = object[property].clone();
        this._endState = endState.clone();
        
        this.parameters = parameters;

        this.init();
    }

    init(){
        this.object = this._object;
        this.property = this._property;

        this.startState = this._startState;
        this.endState = this._endState; 

        this.speed = this.parameters.speed !== undefined ? this.parameters.speed : 0.01;
        
        this.count = this.parameters.count !== undefined ? this.parameters.count : 1;
        this.delay = this.parameters.delay !== undefined ? this.parameters.delay : 0;
        this.forwards = this.parameters.forwards !== undefined ? this.parameters.forwards : true;
        this.callback = this.parameters.callback !== undefined ? this.parameters.callback : null;
        this.callbackEveryIteration = this.parameters.callbackEveryIteration !== undefined ? this.parameters.callbackEveryIteration : null;
        this.callbackEveryUpdate = this.parameters.callbackEveryUpdate !== undefined ? this.parameters.callbackEveryUpdate : null;

        this.counter = 0; 
        this.progress = 0;
        this.paused = false;
        this.ended = false;

        this.clock = new THREE.Clock();

        this.setStartTime();

        return this;
    }

    setStartTime(){
        this.startTime = this.clock.getElapsedTime() + this.delay;
    }

    moveToStartState(){
        this.setStartTime();
        if(!isNaN(this.object[this.property])){
            this.object[this.property] = this.startState;
        }
        else{
            this.object[this.property].copy(this.startState);
        }
        return this;
    }

    clone(){
        const clone = new Animation(this._object, this._property, this._endState, this.parameters);
        clone.progress = this.progress;
        clone.counter = this.counter;
        clone.paused = this.paused;
        clone.ended = this.ended;
        clone._startState = this._startState; 
        clone.startState = this._startState;
        return clone;
    }

    reset(){
        // this.startState = this.clock.getElapsedTime() + this.delay;
        this.progress = 0;
        this.counter = 0;
        this.ended = false;
        this.startState = this.object[this.property].clone();
        
        return this;
    }
    
    skip(){
        this.progress = 1;
        if(!isNaN(this.object[this.property])){
            this.object[this.property] = this.endState;
        }
        else{
            this.object[this.property].copy(this.endState);
        }
        this.counter = this.count;
    }
    
    kill(){
        this.progress = 1;
        this.counter = this.count;
        this.ended = true;
    }

    start(){
        this.paused = false;
    }

    pause(){
        this.paused = true;
    }

    toggle(){
        this.paused = !this.paused;
    }

    update(){
        if(this.clock.getElapsedTime() < this.startTime) return;
        if(this.paused) return;


        const timeDelta = this.clock.getElapsedTime() - this.lastUpdate;
        const timeMultiplier = 165 * timeDelta;
        const speed = this.speed * (this.lastUpdate ? timeMultiplier : 1);

        if(this.progress >= 1 && !this.ended){
            if(++this.counter < this.count){
                if(!isNaN(this.object[this.property])){
                    this.object[this.property] = this.startState;
                }
                else{
                    this.object[this.property].copy(this.startState);
                }
                this.progress = 0;
            }
            else{
                this.ended = true;
                if(!this.forwards){
                    if(!isNaN(this.object[this.property])){
                        this.object[this.property] = this.startState;
                    }
                    else{
                        this.object[this.property].copy(this.startState);
                    }
                }
            }
            if(this.callbackEveryIteration) this.callbackEveryIteration(this);
            if(this.ended && this.callback) this.callback(this);
        }

        if(this.progress >= 1) return;

        const object = this.object;
        if(object[this.property].isVector3){
            this.progress += speed;
            object[this.property].copy(this.startState.moveTo(this.endState, this.progress));
            if(this.progress >= 1){
                object[this.property].clone(this.endState);
            }
        }
        else if(object[this.property].isVector2){
            this.progress += speed;
            object[this.property].copy(this.startState.moveTo(this.endState, this.progress));
            if(this.progress >= 1){
                object[this.property].clone(this.endState);
            }
        }
        else if(object[this.property].isEuler){
            this.progress += speed;
            const newEuler = this.startState.moveTo(this.endState, this.progress);
            object[this.property].copy(newEuler);
            if(this.progress >= 1){
                object[this.property].clone(this.endState);
            }
        }
        else if(object[this.property].isColor){
            this.progress += speed;
            const r = this.startState.r.moveTo(this.endState.r, this.progress);
            const g = this.startState.g.moveTo(this.endState.g, this.progress);
            const b = this.startState.b.moveTo(this.endState.b, this.progress);
            object[this.property].copy(new THREE.Color(r, g, b));
            if(this.progress >= 1){
                object[this.property].clone(this.endState);
            }
        }
        else if(!isNaN(object[this.property])){
            this.progress += speed
            object[this.property] = this.startState.moveTo(this.endState, this.progress);
            if(this.progress >= 1){
                object[this.property] = this.endState;
            }
        }
        else{
           this.progress = 1;
           this.counter = this.count;
        }

        if(this.callbackEveryUpdate) this.callbackEveryUpdate(this);

        this.lastUpdate = this.clock.getElapsedTime();
    }
}

export default Animation;