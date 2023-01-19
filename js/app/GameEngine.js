/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import * as THREE from '../lib/three.js-master/build/three.module.js';

import {EffectComposer} from '../lib/three.js-master/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from '../lib/three.js-master/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from '../lib/three.js-master/examples/jsm/postprocessing/ShaderPass.js';
import {FXAAShader} from '../lib/three.js-master/examples/jsm/shaders/FXAAShader.js';
import {SMAAPass} from '../lib/three.js-master/examples/jsm/postprocessing/SMAAPass.js';

import {OrbitControls} from '../lib/three.js-master/examples/jsm/controls/OrbitControls.js'
import {TrackballControls} from '../lib/three.js-master/examples/jsm/controls/TrackballControls.js'

import Stats from '../lib/three.js-master/examples/jsm/libs/stats.module.js'
import {GUI} from '../lib/three.js-master/examples/jsm/libs/lil-gui.module.min.js'

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

void main(){
    vec4 pixel = texture2D(uTexture, vUv);
    gl_FragColor = pixel;
}
`;

window.cursorPointer = () => document.body.style.cursor = 'pointer';
window.cursorArrow = () => document.body.style.cursor = 'default';

window.mobileCheck = function(){
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };
window.isIOS = typeof navigator.standalone === 'boolean';

class GameEngine extends React.Component{
    constructor(props){
        super(props);

        for(const [name, prop] of Object.entries(props.sceneProps || {})){
            GameEngine.prototype[name] = prop;
        }

        this.loaded = false;
        this.inited = false;
        this.initedLoaded = false;

        this.useComposer = true;

        this.useControls = this.props.DEV_MODE;
        this.useGui = this.props.DEV_MODE;
        this.useStats = this.props.DEV_MODE;
    }

    addLoadingCircle(){
        this.loadingCircle = document.createElement('div');
        this.loadingCircle.classList.add('loadingCircle');
        document.body.appendChild(this.loadingCircle);
    }

    setLoadingCircleVisibility(value){
        if(value) this.loadingCircle.classList.remove('hidden');
        else this.loadingCircle.classList.add('hidden');
    }

    componentDidMount(){
        this.addLoadingCircle();
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2(1, 1);
        this.raycaster = new THREE.Raycaster();
        this.scene = new THREE.Scene();
        
        this.addRenderer();
        this.addCamera();
        this.addEventListeners();    
        
        if(this.useControls)this.addControls();
        if(this.useStats) this.addStats();
        if(this.useGui) this.addGui();
        
        if(this.useComposer) this.addPostProcessing();

        this.addLights();

        this.resize();

        if(this.init) this.init(this);

        this.GameLoop();
    }
    
    addPostProcessing(){
        this.useFXAA = false;
        this.useSMAA = true;

        this.composer = new EffectComposer(this.renderer);

        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        if(this.useFXAA){
            this.fxaaPass = new ShaderPass(FXAAShader);
            this.composer.addPass(this.fxaaPass);
        }
        if(this.useSMAA){
            this.smaaPass = new SMAAPass(window.innerWidth * this.renderer.getPixelRatio(), window.innerHeight * this.renderer.getPixelRatio());
            this.composer.addPass(this.smaaPass);
        }
    }

    updateFxaaPass(){
        const pixelRatio = this.renderer.getPixelRatio();
        const uniforms = this.fxaaPass.material.uniforms;

        uniforms[ 'resolution' ].value.x = 1 / ( Math.ceil(window.innerWidth * pixelRatio) );
        uniforms[ 'resolution' ].value.y = 1 / ( Math.ceil(window.innerHeight * pixelRatio) );
    }

    render(){
        return React.createElement('div', {ref: ref => {this.mount=ref}, className: 'scene'});
    }
    
    addRenderer(color=null){
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.enabled = false;
        this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
        if(color) this.renderer.setClearColor(color);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.mount.appendChild(this.renderer.domElement);
    }

    addCamera(type=0, params=[]){
        if(type === 0){
            this.addPerspectiveCamera(...params);
        }
        else if(type === 1){
            this.addOrtographicCamera(...params);
        }
    }

    addPerspectiveCamera(x=0, y=0, z=1.5, fov=20){
        this.camera = new THREE.PerspectiveCamera(fov, this.mount.clientWidth / this.mount.clientHeight, 0.001, 100);
        this.camera.position.copy(new THREE.Vector3(x, y, z));
        this.camera.lookAt(0, 0, 0);
    }
    
    addOrtographicCamera(x=1, y=1, z=1, cameraWidth=1.5, maxCameraRatio=1.5){
        this.baseCameraWidth = cameraWidth;
        this.cameraWidth = cameraWidth;
        this.cameraHeight = cameraWidth;
        
        this.maxCameraRatio = maxCameraRatio;
        
        this.cameraRatio = ((this.mount.clientWidth) / (this.mount.clientHeight));
        
        if(this.cameraRatio < this.maxCameraRatio){this.cameraHeight /= this.cameraRatio}
        else{this.cameraWidth *= this.cameraRatio / this.cameraRatio; this.cameraHeight /= this.cameraRatio;}
        
        this.camera = new THREE.OrthographicCamera(this.cameraWidth / - 2, this.cameraWidth / 2, this.cameraHeight / 2, this.cameraHeight / - 2, -1000, 1000);
        
        this.camera.position.copy(new THREE.Vector3(x, y, z));
        this.camera.lookAt(0, 0, 0);
    }
    
    addControls(type=0, params=[]){
        if(type === 0){
            this.addOrbitControls(...params);
        }
        else if(type === 1){
            this.addTrackballControls(...params);
        }
    }

    addTrackballControls(){
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 3.5;
        this.controls.panSpeed = 0.2;
        this.controls.dynamicDampingFactor = 0.1;
    }
    
    addOrbitControls(){
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.enableRotate = true;
        this.controls.enableZoom = true;
    }
    
    addStats(){
        this.stats = new Stats();
        this.stats.showPanel(0);
        this.mount.appendChild(this.stats.dom);
    }
    
    addGui(){ 
        this.gui = new GUI();
        this.gui.domElement.style.zIndex = 9999999;
        this.gui.add(this.controls, 'enabled');

        this.gui.close();
    }

    GameLoop(){
        if(this.stats){this.stats.begin()}
        requestAnimationFrame(() => this.GameLoop());
        this.renderScene();
        this._update();
        if(this.stats){this.stats.end()}
    }
    
    _update(){
        this.setLoadingCircleVisibility(!this.initedLoaded);

        if(this.update) this.update(this);
        if(this.inited && this.loaded && !this.initedLoaded && this.initLoaded) this.initLoaded(this);
        if(this.inited && this.initedLoaded && this.updateLoaded) this.updateLoaded(this);
        if(this.hover) this.hover(this);
        if(this.controls) this.controls.update();
        if(this.useComposer && this.useFXAA) this.updateFxaaPass();
    }

    renderScene(){
        if(this.useComposer) this.composer.render();
        else this.renderer.render(this.scene, this.camera);
    }
    
    addLights(){
        this.lightsGroup = new THREE.Group();
        let power = 0.4;
        let power2 = 0.6;
        let power3 = 0.8;
        let color = 0xffffff;
        let distance = 100;
        
        let lightsProperties = [[0, 0, distance, power, true], [0, 0, -distance, power, true], [0, distance, 0, power2, true], [0, -distance, 0, power2, true], [distance, 0, 0, power3, true], [-distance, 0, 0, power3, true]];

        for(let i=0; i < lightsProperties.length; i++){
            let light = new THREE.DirectionalLight(color, lightsProperties[i][3], 500);
            
            let lightSize = 100;
            
            light.shadow.camera.left = -lightSize;
            light.shadow.camera.right = lightSize;
            light.shadow.camera.top = lightSize;
            light.shadow.camera.bottom = -lightSize;
            light.shadow.mapSize.width = 1500;
            light.shadow.mapSize.height = 1500;

            light.position.set(lightsProperties[i][0], lightsProperties[i][1], lightsProperties[i][2]);
            if(lightsProperties[i][4]){light.castShadow = true;}
         
            this.lightsGroup.add(light);
        }
     
        this.scene.add(this.lightsGroup);
        
        return this.lightsGroup;
    }
    
    addEventListeners(){

        document.body.addEventListener('mousedown', event => {
            if(window.mobileCheck() && !window.isIOS){
                try{
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                    }
                }
                catch(e){

                }
            }
        });

        window.addEventListener('resize', () => {
            this.resize();
        });
        
        this.mount.addEventListener('mousemove', event => {
            this.mouseMove(event, this);
        });

        this.mount.addEventListener('mousedown', event => {
            if(this.mouseDown) this.mouseDown(event, this);
        });
        
        this.mount.addEventListener('mouseup', event => {
            if(this.mouseUp) this.mouseUp(event, this);
        });

        this.mount.addEventListener('touchstart', event => {
            if(event.touches && event.touches.length > 0) this.mouseMove({clientX: event.touches[0].clientX, clientY: event.touches[0].clientY});
            if(this.touchStart) this.touchStart(event, this);
        });

        this.mount.addEventListener('touchend', event => {
            if(this.touchEnd) this.touchEnd(event, this);
        });
        
        this.mount.addEventListener("contextmenu", e => e.preventDefault());
    }

    resize(){
        this.renderer.setPixelRatio(window.devicePixelRatio);
        if(this.useComposer) this.composer.setPixelRatio(window.devicePixelRatio);
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.renderer.setSize(width, height);
        if(this.useComposer) this.composer.setSize(width, height);
        this.camera.aspect = width/height;
        this.camera.updateProjectionMatrix();

        if(this.camera.isOrtographicCamera){
            this.camera.updateProjectionMatrix();
            
            this.cameraWidth = this.baseCameraWidth;
            this.cameraHeight = this.baseCameraWidth;
            
            this.cameraRatio = (this.mount.clientWidth / this.mount.clientHeight);
        
            if(this.cameraRatio < this.maxCameraRatio){this.cameraHeight /= this.cameraRatio;}
            else{this.cameraWidth *= this.cameraRatio;}

            this.camera.left = -this.cameraWidth / 2;
            this.camera.right = this.cameraWidth / 2;
            this.camera.top = this.cameraHeight / 2;
            this.camera.bottom = -this.cameraHeight / 2;
        }
    }

    mouseMove(event){
        this.mouseLast = {...this.mouse}

        this.mouse.x = ((event.clientX - this.mount.parentNode.offsetLeft) / this.mount.clientWidth) * 2 - 1;
        this.mouse.y = - ((event.clientY- this.mount.parentNode.offsetTop) / this.mount.clientHeight) * 2 + 1;
    }

    isObjectHovered(object){
        return object.hoverCheck(this.mouse, this.camera);
    }

    areObjectsHovered(objects){
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.mouse, this.camera);
        return raycaster.intersectObjects(objects, false);

    }
}

export default GameEngine;