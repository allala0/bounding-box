/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

class AnimationEngine{
    constructor(){
        this.queue = [];
    }

    isAnimated(object, property=null){
        for(const [index, animation] of this.queue.entries()){
            if(animation.object == object && (property === null || property === animation.property)){
                return true;
            }
        }
        return false;
    }

    addToQueue(animationObject){
        animationObject.setStartTime();
        for(const [index, animation] of this.queue.entries()){
            if(animation.object == animationObject.object && animation.property === animationObject.property && !animation.ended){
                this.queue[index] = animationObject;
                return;
            }
        }
        this.queue.push(animationObject);
    }

    killQueue(){
        for(let i=0; i < this.queue.length; i++){
            this.queue.splice(i--, 1);
        }
    }

    clearQueue(){
        for(let i=0; i < this.queue.length; i++){
            this.queue[i].callback = null;
            this.queue[i].counter = this.queue[i].count;
            if(this.queue[i].progress >= 1){
                this.queue.splice(i--, 1);
            }
        }
    }

    skipQueue(){
        for(let i=0; i < this.queue.length; i++){
            this.queue[i].counter = this.queue[i].count;
        }
    }

    update(){
        for(const animation of [...this.queue].reverse()){
            animation.update();
        }

        for(let i=0; i<this.queue.length; i++){
            if(this.queue[i].ended) this.queue.splice(i--, 1);
        }
    }
}

export default AnimationEngine;