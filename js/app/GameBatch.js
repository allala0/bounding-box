/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import * as THREE from '../lib/three.js-master/build/three.module.js';

import {CSG} from "../lib/THREE-CSGMesh/dist/client/CSGMesh.js";

const doCSG = function(a,b,op,mat){
    let bspA = CSG.fromMesh( a );
    let bspB = CSG.fromMesh( b );
    let bspC = bspA[op]( bspB );
    let result = CSG.toMesh( bspC, a.matrix );
    result.material = mat;
    result.castShadow = result.receiveShadow = true;
    return result;
}

class GameBatch extends THREE.Group{
    constructor(assets){
        super();

        this.isGameBatch = true;

        this.assets = assets;

        this.setup();
    }

    setup(){
        const size = 0.4;

        const model = this.assets.model.asset.scene;
        // model.rotation.x = Math.PI / 2;
        model.setSize(size).center();

        const bbox = new THREE.Mesh(new THREE.BoxGeometry(size / 2, size / 2 , size / 2), new THREE.MeshStandardMaterial({transparent: true, opacity: 0.2}));

        const clippedModel = this.clipModel(model, bbox);

        this.add(clippedModel);
        this.add(bbox);

        this.add(model);

        model.position.x = -size / 2;
        bbox.position.x = -size / 2;
        clippedModel.position.x = size / 2;
    }

    clipModel(model, bbox, operation='intersect'){        
        
        const modelClone = model.clone();
        const bboxClone = bbox.clone();
        
        modelClone.updateMatrix();
        bboxClone.updateMatrix();
        
        const clippedModel = new THREE.Group;

        modelClone.traverse(
            node => {
                if(node.isMesh && node.geometry && node.material){
                    const nodeClone = node.clone();
                    nodeClone.position.copy(node.getWorldPosition(new THREE.Vector3));
                    nodeClone.quaternion.copy(node.getWorldQuaternion(new THREE.Quaternion));
                    nodeClone.scale.copy(node.getWorldScale(new THREE.Vector3));
                    nodeClone.updateMatrix();

                    const intersection = doCSG(nodeClone, bboxClone, operation, nodeClone.material);
                    clippedModel.add(intersection);

                    nodeClone.dispose();
                }
            }
        );

        bboxClone.dispose();
        modelClone.dispose();

        return clippedModel;
    }

    update(){
        
    }
}

export default GameBatch;
