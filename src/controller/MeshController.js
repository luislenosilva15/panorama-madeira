import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import '@babylonjs/loaders/glTF';

import { scene } from "../main";

SceneLoader.ShowLoadingScreen = false;

export function SpawnNode(isTransformOnly, domeName, parent, texturePath, alphaIndex) {
    scene.textures.forEach(function f(t) {
        if (t.name == '') {
        t.dispose();
        }
    })
    let tempMesh = null;
    let tempTransform = null;
    if (isTransformOnly) {
        tempTransform = new TransformNode(domeName, scene)
        tempTransform.setParent(scene.getTransformNodeByName('domeMasterParent'));
    } else {
        if (!scene.getTransformNodeByName(parent).getChildMeshes().length > 0) {
            tempMesh = SpawnDome(texturePath, domeName, tempMesh, parent, alphaIndex);
        } else {
            scene.getTransformNodeByName(parent).getChildMeshes().forEach(function (m) {
                m.dispose(true, false);
                m.material.dispose(true, false, true);
                tempMesh = SpawnDome(texturePath, domeName, tempMesh, parent, alphaIndex);
            });
        }
    }
};

export function SpawnDome(texturePath, domeName, tempMesh, parent, alphaIndex) {
    let tempMaterial = scene.getMaterialByName('photoDome_material').clone()
    tempMaterial.diffuseTexture.dispose();
    if (FindTexture(texturePath)) {
        tempMaterial.diffuseTexture = scene.textures[FindTexture(texturePath)];
    } else {
        tempMaterial.diffuseTexture = new Texture(texturePath, scene, true, false);
    }
    tempMaterial.name = domeName
    tempMesh = scene.getMeshByName('domeMaster').clone(domeName, scene.getTransformNodeByName(parent));
    tempMesh.alphaIndex = alphaIndex;
    tempMesh.isVisible = true;
    tempMaterial.diffuseTexture.uScale = -1;
    tempMaterial.diffuseTexture.hasAlpha = true;
    tempMaterial.hasAlpha = true;
    tempMesh.material = tempMaterial;
    tempMesh.rotation = new Vector3(0, 0, 0);
    return tempMesh;
}

function FindTexture(texturePath) {
    let index = null;
    for (let i = 0; i < scene.textures.length; i++) {
        const element = scene.textures[i];
        if (element.name == texturePath) {
            index = i;
            return index;
        }
    }
}

export function UpdateDeleteEvent(index, data) {
    let removeButton = document.getElementById("function-clear-furniture");
    let obj = data[index].name;
    let model = scene.getTransformNodeByName(obj);

    removeButton.style.display = index == 0 || model == null & index != 0 ? 'none' : 'block';

    removeButton.onclick = () => {
        if (model != null && obj != "ambientes") model.dispose();
        removeButton.style.display = 'none';
    }
};