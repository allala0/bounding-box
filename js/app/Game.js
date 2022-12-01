/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import * as THREE from '/js/lib/three.js-master/build/three.module.js';

import * as threeTools from './ThreeTools.js';

threeTools.init(THREE);

import {GLTFLoader} from'/js/lib/three.js-master/examples/jsm/loaders/GLTFLoader.js';

import UI from './UI.js';
import GameEngine from './GameEngine.js';
import GameBatch from './GameBatch.js';

import Asset from './Asset.js';

import Animations from './Animations.js';

const c = React.createElement;

class Game extends React.Component{
    constructor(props){
        super(props);

        this.DEV_MODE = true;

        this.showUI = false;

        this.clock = new THREE.Clock();
        this.cameraPosition = new THREE.Vector3(0, 13.5, 13.5);
        this.cameraDistanceMultiplier = 1;

        this.textureQualitySizes = {
            // 'ultra': 14580,
            // 'high': 10240,
            'medium': 7290,
            'low': 4860,
            'very-low': 2048
        };

        this.animations = new Animations();

        this.objectsToUpdate = [{object: this.animations}]; 

        this.assets = {};

        this.gameBatch = null;
    }

    ComponentDidMount(){
        
    }
    
    setTextureQuality(renderer){
        this.maxTextureSize = renderer.capabilities.maxTextureSize;
        this.maxTextures = renderer.capabilities.maxTextures;

        this.textureQuality = 'very-low';
        for(const [textureQuality, textureSize] of Object.entries(this.textureQualitySizes)){
            if(textureSize > this.textureQualitySizes[this.textureQuality] && textureSize <= this.maxTextureSize){
                this.textureQuality = textureQuality;
            }
        }
        if(window.mobileCheck()) this.textureQuality = 'very-low';
        if(this.DEV_MODE) this.textureQuality = 'very-low';
    }

    generateAssets(){
        this.assets = {
            'model': new Asset('./assets/models/NeilArmstrong.glb', new GLTFLoader),
            // 'model1': new Asset('./assets/models/1.glb', new GLTFLoader),
            // 'model2': new Asset('./assets/models/2.glb', new GLTFLoader),
            // 'model3': new Asset('./assets/models/3.glb', new GLTFLoader),
        };
    }

    disposeGameBatch(){
        for(let i=0; i<this.objectsToUpdate.length; i++){
            if(this.objectsToUpdate[i].object.isGameBatch) this.objectsToUpdate.splice(i--, 1);
        }
        
        if(this.gameBatch) this.gameBatch.dispose();

        this.gameBatch = null;
    }

    resetGameBatch(scene){
        this.disposeGameBatch();
        this.ui.reset();
        this.addGameBatch(scene);
    }

    addGameBatch(scene){
        this.gameBatch = new GameBatch(this.assets);
        this.objectsToUpdate.push({object: this.gameBatch});
        scene.add(this.gameBatch);
    }
    
    promptTestingData(){
        console.log('three.js version: ' + THREE.REVISION);
        console.log('React.js version: ' + React.version);
        console.log('Max texture size: ' + this.maxTextureSize);
        console.log('Max textures: ' + this.maxTextures);
        console.log('Texture quality: ' + this.textureQuality);
    }

    addTestingGuiFields(gameEngine){
        gameEngine.gui.add({resetGameBatch: () => this.resetGameBatch(gameEngine.scene)}, 'resetGameBatch');
        this.promptRendererInfo = () => console.log(gameEngine.renderer.info);
        gameEngine.gui.add(this, 'promptRendererInfo');
    }

    addObjects(gameEngine){
        this.skybox = new THREE.Mesh(new THREE.SphereGeometry(1000), new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide}));
        gameEngine.scene.add(this.skybox);
    }

    assetsLoadedCheck(){
        let loaded = true;
        if(!this.assets) loaded = false;
        else{
            for(const [assetName, asset] of Object.entries(this.assets)){
                if(!asset.loaded) loaded = false;
            }
        }
        return loaded;
    }

    updateObjects(){
        for(const object of this.objectsToUpdate){
            const argumentsConverted = [];
            if(object.function){
                object.function();
            }
            else if(object.arguments){
                for(const argument of object.arguments){
                    argumentsConverted.push(argument.object[argument.property]);
                }
            }
            object.object.update(...argumentsConverted);
        }
    }

    updateClickableObjects(gameEngine){
        let isHovered = false;
        for(const object of this.clickableObjects){
            if(object.isClickDisabled){
                object.isHovered = false;
                object.isClicked = false;
                object.isClickCallbacked = true;
                continue;
            }
            const clickableObject = object.clickableObject !== undefined ? object.clickableObject : object;
            object.isHovered = gameEngine.isObjectHovered(clickableObject);
            if(object.isHovered) isHovered = true;
        }

        if(isHovered) window.cursorPointer();
        else window.cursorArrow();
    }

    updateUI(){

    }

    render(){
        return [
            c(GameEngine, {
                DEV_MODE: this.DEV_MODE,
                key: 'gameEngine', 
                ref: ref => this.gameEngine = ref, 
                sceneProps: {
                    update: gameEngine => {
                        gameEngine.loaded = this.assetsLoadedCheck();
                    },
                    init: gameEngine => {
                        this.setTextureQuality(gameEngine.renderer);
                        this.generateAssets();
                        if(this.DEV_MODE) this.promptTestingData();


                        gameEngine.inited = true;
                    },
                    initLoaded: gameEngine => {
                        if(gameEngine.useGui) this.addTestingGuiFields(gameEngine);
                        this.addObjects(gameEngine);

                        this.addGameBatch(gameEngine.scene);

                        document.body.addEventListener('mousedown', event => {
                            if(this.gameBatch && (this.gameBatch.won || this.gameBatch.lost)) this.resetGameBatch(gameEngine.scene);
                        });

                        gameEngine.initedLoaded = true;
                    },
                    mouseDown: (event, gameEngine) => {
                        let isClicked = false;
                        this.clickableObjects.map(object => {object.isClicked = object.isHovered; if(isClicked) object.isClicked = false; else if(object.isHovered) object.isClickCallbacked = false; isClicked = object.isHovered || isClicked;});
                    },
                    updateLoaded: gameEngine => {
                        this.updateUI();
                        this.updateObjects();
                        this.updateClickableObjects(gameEngine);

                        if(this.DEV_MODE && this.gameBatch) if(this.gameBatch.phase !== this.gameBatch.lastPhase || this.gameBatch.action !== this.gameBatch.lastAction){this.gameBatch.lastPhase = this.gameBatch.phase; this.gameBatch.lastAction = this.gameBatch.action; console.log('Phase: ' + this.gameBatch.phase + ' Action: ' + this.gameBatch.action);}
                    }
                }
            }), 
            c(UI, {
                key: 'ui',
                ref: ref => this.ui = ref
            })
        ];
    }
    get clickableObjects(){
        const clickableObjects = [];
        if(this.gameBatch){
            this.gameBatch.traverse(node => {
                if(node.isClickable){
                    clickableObjects.push(node);
                }
            });
        }
        return clickableObjects;
    }
}

export default Game;
