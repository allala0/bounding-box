/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

class Asset{
    constructor(assetPath, loader, parameters={}, loadCallback=null){
        this.isAsset = true;
        
        this.parameters = parameters;

        this.asset = null;
        this.failedToLoad = false;

        loader.load(
            assetPath, 
            asset => {this.asset = asset; if(loadCallback){const newAsset = loadCallback(asset); if(newAsset !== undefined) this.asset = newAsset}},
            undefined, 
            err => this.failedToLoad = true
        );
    }

    get loaded(){
        return this.asset !== null;
    }
}

export default Asset;
