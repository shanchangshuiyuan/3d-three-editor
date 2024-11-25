/**
 * @describe 材质模块方法
 * @function getModelMaterialList 获取当前模型材质
 * @function setModelPositionSize 设置模型定位缩放大小
 * @function getModelMaps 获取模型自带贴图
 * @function onSetModelMaterial 设置材质属性（网格,透明度，颜色，深度写入）
 * @function onSetModelMap 设置模型贴图（模型自带）
 * @function onSetSystemModelMap 设置模型贴图（系统贴图）
 * @function onChangeModelMaterial 选择材质
 * @function onGetEditMeshList 获取最新材质信息列表
 * @function onChangeModelMeshType 切换材质类型
 * @function onSetGeometryMeshList 设置几何体模型材质
 * @function initModelMaterial 重置模型材质数据
 * @function onSetMeshVisible 设置材质显隐
 */

import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

import { useMeshEditStore } from "@/store/meshEditStore";
const store = useMeshEditStore();

// 获取当前模型材质
function getModelMaterialList() {
  this.modelMaterialList = [];
  let i = 0;
  this.model.traverse(v => {
    if (v.isMesh && v.material) {
      v.castShadow = true;
      v.frustumCulled = false;
      if (Array.isArray(v.material)) {
        v.material = v.material[0];
        this.setMaterialMeshParams(v, i);
      } else {
        this.setMaterialMeshParams(v, i);
      }
    }
  });
}

// 材质参数二次处理
function setMaterialMeshParams(v, i) {
  const newMesh = v.clone();
  Object.assign(v.userData, {
    rotation: newMesh.rotation,
    scale: newMesh.scale,
    position: newMesh.position
  });

  const newMaterial = v.material.clone();
  v.mapId = v.name + "_" + i;
  v.material = newMaterial;
  const { mapId, uuid, userData, type, name, isMesh, visible } = v;
  const { color, wireframe, depthWrite, opacity } = v.material;
  const meshMaterial = { color, wireframe, depthWrite, opacity };
  const mesh = {
    mapId,
    uuid,
    userData,
    type,
    name,
    isMesh,
    visible,
    material: meshMaterial
  };
  this.modelMaterialList.push(mesh);
  const cloneMesh = v.material.clone();
  cloneMesh.userData.mapId = v.name + "_" + i;
  this.originalMaterials.set(v.uuid, cloneMesh);
}

// 设置模型定位缩放大小
function setModelPositionSize() {
  //设置模型位置
  this.model.updateMatrixWorld();
  const box = new THREE.Box3().setFromObject(this.model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  // 计算缩放比例
  const maxSize = Math.max(size.x, size.y, size.z);
  const targetSize = 2.5; // 目标大小
  const scale = targetSize / (maxSize > 1 ? maxSize : 0.5);
  this.model.scale.set(scale, scale, scale);
  // 设置模型位置
  this.model.position.sub(center.multiplyScalar(scale));
  // 设置控制器最小缩放值
  this.controls.maxDistance = size.length() * 10;
  // 设置相机位置
  this.camera.position.set(0, 2, 6);
  // 设置相机坐标系
  this.camera.updateProjectionMatrix();
}
// 获取模型自带贴图
function getModelMaps(materials) {
  let textureMap = {};
  materials.forEach(texture => {
    if (texture.map && texture.map.image) {
      const canvas = document.createElement("canvas");
      canvas.width = 75;
      canvas.height = 75;
      const context = canvas.getContext("2d");
      context.drawImage(texture.map.image, 0, 0);
      textureMap = {
        url: canvas.toDataURL("image/png", 0.5)
      };
      canvas.remove();
    }
  });
  return textureMap;
}
// 设置材质属性
function onSetModelMaterial(config) {
  const { color, wireframe, depthWrite, opacity } = JSON.parse(JSON.stringify(config));
  const uuid = store.selectMesh.uuid;
  const mesh = this.scene.getObjectByProperty("uuid", uuid);
  if (mesh && mesh.material) {
    const { name, map } = mesh.material;
    Object.assign(mesh.material, {
      map,
      name,
      transparent: true,
      color: new THREE.Color(color),
      wireframe,
      depthWrite,
      opacity
    });
  }
  // 修改当前材质列表的参数
  const listMesh = this.modelMaterialList.find(v => v.uuid == uuid) || {};
  Object.assign(listMesh.material, {
    color: new THREE.Color(color),
    wireframe,
    depthWrite,
    opacity
  });
}

// 修改材质显隐
function onSetMeshVisible(config) {
  const mesh = this.scene.getObjectByProperty("uuid", config.uuid);
  mesh.visible = config.visible;
}

// 设置模型贴图（模型自带）
function onSetModelMap({ mapId, meshName }) {
  const uuid = store.selectMesh.uuid;
  const mesh = this.scene.getObjectByProperty("uuid", uuid);
  const originMaterial = this.originalMaterials.get(uuid);
  mesh.material = originMaterial.clone();
  mesh.mapId = mapId;
  // 设置当前材质来源唯一标记值key 用于预览处数据回填需要
  mesh.meshFrom = meshName;
}

// 设置模型贴图（系统贴图）
function onSetSystemModelMap({ id, url }) {
  return new Promise(resolve => {
    const uuid = store.selectMesh.uuid;
    const mesh = this.scene.getObjectByProperty("uuid", uuid);
    const texture = new THREE.TextureLoader().load(url);
    const newMaterial = mesh.material.clone();
    newMaterial.map = texture;
    newMaterial.map.wrapS = THREE.MirroredRepeatWrapping;
    newMaterial.map.wrapT = THREE.MirroredRepeatWrapping;
    newMaterial.map.flipY = false;
    newMaterial.map.colorSpace = THREE.SRGBColorSpace;
    newMaterial.map.minFilter = THREE.LinearFilter;
    newMaterial.map.magFilter = THREE.LinearFilter;
    mesh.material = newMaterial;
    mesh.mapId = id;
    // 设置当前材质来源唯一标记值key 用于预览处数据回填需要
    mesh.meshFrom = id;
    texture.dispose();
    resolve();
  });
}

// 设置模型贴图 (外部)
function onSetStorageModelMap(url, type) {
  return new Promise(async resolve => {
    const uuid = store.selectMesh.uuid;
    const mesh = this.scene.getObjectByProperty("uuid", uuid);
    // 根据 图片类型选择不同的加载器
    let loader;
    let texture;
    if (type == "hdr") {
      loader = new RGBELoader();
    } else {
      loader = new THREE.TextureLoader();
    }

    texture = await loader.loadAsync(url);
    const newMaterial = mesh.material.clone();
    newMaterial.map = texture;
    newMaterial.map.wrapS = THREE.MirroredRepeatWrapping;
    newMaterial.map.wrapT = THREE.MirroredRepeatWrapping;
    newMaterial.map.flipY = false;
    newMaterial.map.colorSpace = THREE.SRGBColorSpace;
    newMaterial.map.minFilter = THREE.LinearFilter;
    newMaterial.map.magFilter = THREE.LinearFilter;
    mesh.material = newMaterial;
    texture.dispose();
    resolve();
  });
}
// 选择材质
function onChangeModelMaterial(name) {
  const mesh = this.model.getObjectByName(name);
  this.outlinePass.selectedObjects = [mesh];
  store.selectMeshAction(mesh);
  return mesh;
}
// 模型点击事件
function onMouseClickModel(event) {
  const { clientHeight, clientWidth, offsetLeft, offsetTop } = this.container;
  this.mouse.x = ((event.clientX - offsetLeft) / clientWidth) * 2 - 1;
  this.mouse.y = -((event.clientY - offsetTop) / clientHeight) * 2 + 1;
  this.raycaster.setFromCamera(this.mouse, this.camera);
  let model;
  if (this.model) model = this.model;
  if (this.geometryGroup.children.length) model = this.geometryGroup;
  if (!model) return false;

  const intersectsChildren = this.raycaster.intersectObjects(model.children, true);
  const intersects = intersectsChildren.filter(item => item.object.isMesh && item.object.material);

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    this.outlinePass.visibleEdgeColor = new THREE.Color("#FF8C00"); // 可见边缘的颜色
    this.outlinePass.hiddenEdgeColor = new THREE.Color("#8a90f3"); // 不可见边缘的颜色
    this.outlinePass.selectedObjects = [intersectedObject];
    store.selectMeshAction(intersectedObject);
    if (this.transformControls) {
      const boundingBox = new THREE.Box3().setFromObject(intersectedObject);
      const { dragPosition } = intersectedObject.userData;

      //检测当前模型位置是否有初始值
      if (dragPosition) {
        this.transformControls.position.copy(dragPosition);
      } else {
        const center = boundingBox.getCenter(new THREE.Vector3());
        intersectedObject.userData.dragPosition = center;
        this.transformControls.position.copy(center);
      }
      this.transformControls.attach(intersectedObject);
    }
  } else {
    if (!this.transformControls) {
      this.outlinePass.selectedObjects = [];
      store.selectMeshAction({});
    }
  }
}
// 获取最新材质信息列表
function onGetEditMeshList() {
  const meshList = [];
  this.model.traverse(v => {
    if (v.isMesh && v.material) {
      const { color, opacity, depthWrite, wireframe } = v.material;
      const obj = {
        meshName: v.name,
        meshFrom: v.meshFrom,
        color: color.getStyle(),
        opacity,
        depthWrite,
        wireframe,
        visible: v.visible,
        type: v.material.type
      };
      meshList.push(obj);
    }
  });
  return meshList;
}

// 设置材质类型
function onChangeModelMeshType(activeMesh) {
  this.model.traverse(v => {
    if (v.isMesh && v.material) {
      const { name, color, map, wireframe, depthWrite, opacity } = v.material;
      if (activeMesh.type) {
        v.material = new THREE[activeMesh.type]({
          map,
          transparent: true,
          color,
          name
        });
      } else {
        const originalMaterial = this.originalMaterials.get(v.uuid);
        v.material = originalMaterial;
      }
      depthWrite ? (v.material.depthWrite = depthWrite) : "";
      opacity ? (v.material.opacity = opacity) : "";
      wireframe ? (v.material.wireframe = wireframe) : "";
      v.material.side = THREE.DoubleSide;
    }
  });
}
// 设置几何体材质
function onSetGeometryMeshList(v) {
  this.modelMaterialList = [];
  this.model.traverse(v => {
    const { name } = v;
    v.castShadow = true;
    v.frustumCulled = false;
    if (v.isMesh && v.material) {
      this.modelMaterialList.push(v);
      this.originalMaterials.set(v.uuid, v.material);
      v.mapId = name;
    }
  });
}

// 重置模型材质数据
function initModelMaterial() {
  this.model.traverse(v => {
    if (v.isMesh && v.material) {
      // 获取原始材质类型
      const originalMaterial = this.originalMaterials.get(v.uuid);
      v.material = originalMaterial.clone();
      v.mapId = originalMaterial.userData.mapId;
      v.visible = true;
      v.meshFrom = null;
    }
  });
  this.modelMaterialList.forEach(v => {
    v.visible = true;
    const originalMaterial = this.originalMaterials.get(v.uuid);
    v.mapId = originalMaterial.userData.mapId;
    const { color, wireframe, depthWrite, opacity } = originalMaterial;
    Object.assign(v.material, {
      color,
      wireframe,
      depthWrite,
      opacity
    });
  });
  store.selectMeshAction({});
}

export default {
  getModelMaterialList,
  setModelPositionSize,
  getModelMaps,
  onSetModelMaterial,
  onSetModelMap,
  onSetSystemModelMap,
  onSetStorageModelMap,
  onChangeModelMaterial,
  onMouseClickModel,
  onGetEditMeshList,
  onChangeModelMeshType,
  onSetGeometryMeshList,
  onSetMeshVisible,
  initModelMaterial,
  setMaterialMeshParams
};
