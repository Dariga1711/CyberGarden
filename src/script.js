import * as THREE from 'three'
import {MapControls} from 'three/addons/controls/MapControls.js';
// import {Sky} from 'three/addons/objects/Sky.js'
import {Timer} from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'
import { serverTimestamp } from "firebase/firestore";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { fogParsVert, fogVert, fogParsFrag, fogFrag } from './FogReplace.js';
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise";
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';




// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";
import { mx_bilerp_0 } from 'three/src/nodes/materialx/lib/mx_noise.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXBuE35sd2TO2dB8bkrs_xzcGeB-FkJr4",
  authDomain: "cyber-app-ed3f9.firebaseapp.com",
  projectId: "cyber-app-ed3f9",
  storageBucket: "cyber-app-ed3f9.firebasestorage.app",
  messagingSenderId: "738482538225",
  appId: "1:738482538225:web:833cb74d79844348bd0b50",
  measurementId: "G-K87RSJX1YX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


//About button
const aboutButton = document.getElementById("aboutButton");
const aboutPopup = document.getElementById("aboutPopup");

aboutButton.addEventListener('click', () => {
  aboutPopup.style.display = "flex";
});

aboutPopup.addEventListener('click', (event) => {
  const popupContent = document.querySelector('.popup-content');
  if (!popupContent.contains(event.target)) {
    aboutPopup.style.display = "none";
  }
});


//Welcome popup
const welcomePopup = document.getElementById("welcomePopup")
const welcomeContent = document.getElementById("welcomeContent")

instructionButton.addEventListener('click', () =>{
  welcomePopup.style.display = "flex"
})

window.addEventListener ('laod', () => {
  welcomePopup.style.display = "flex"
})

welcomePopup.addEventListener('click', () => {
  welcomePopup.style.display = 'none';
})


//Feedback

const sendButton = document.getElementById("sendButton");

sendButton.addEventListener("click", async () => {
  const input = document.getElementById("visitorSuggestions");
  const suggestion = input.value.trim();

  if (suggestion === "") {
    alert("Please write something before sending!");
    input.focus();
    return;
  }

  try {
    await addDoc(collection(db, "feedback"), {
      suggestion: suggestion
    });
    alert("Thanks for your suggestion!");
    input.value = ""; // Clear the input after successful submission
  } catch (err) {
    console.error("Error adding suggestion:", err);
    alert("Something went wrong. Please try again.");
  }
});



/**
 * Flower firebase
 */

//Add info

//  adding data:
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const form = document.getElementById("modalForm");

closeModal.addEventListener("click", () => {
  modal.style.display = "none";

  if (temporaryFlower) {
    scene.remove(temporaryFlower);
    temporaryFlower = null;}
});

function computeFlowerPosition (distance = 3, offsetLeft = 3) {
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  const left = new THREE.Vector3();
  left.crossVectors(camera.up, direction).normalize();

  const position = new THREE.Vector3();
  position.copy(camera.position)
    .add(direction.multiplyScalar(distance))
    .add(left.multiplyScalar(offsetLeft + 1));

  position.y = 0;
  
  return position;
}

// Form submission handler
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent actual form submission

  // Get form values
  const inputName = document.getElementById("flowerInputName").value;
  const projectInputName = document.getElementById("flowerProjectInputName").value
  const inputImage = document.getElementById("flowerInputImage").files[0];
  const imageDataUrl = await resizeAndConvertToDataUrl(inputImage, 800);
  const inputDescription = document.getElementById("flowerInputDescription").value;
  const inputKeyWord = document.getElementById("flowerInputKeyword").value;
  const inputLink = document.getElementById("flowerInputLink").value;
  const inputType = document.getElementById("flowerType").value;
  const inputColor = document.getElementById("flowerColor").value;
  const flowerPosition = computeFlowerPosition(3, 1.5);

  try {
    // Store visitor data along with flower data
    await addDoc(collection(db, "visitors"), {
      projectName: projectInputName,
      name: inputName,
      description: inputDescription,
      image: imageDataUrl,
      keyWord: inputKeyWord,
      link: inputLink,
      type: inputType,
      color: inputColor,
      createdAt: serverTimestamp(),
      flower: {
        position: {
          x: flowerPosition.x,
          y: flowerPosition.y,
          z: flowerPosition.z,
        },
        type: inputType,
        color: inputColor,
      }
    });

    // // Place the flower with selected type & color
    // addFlowerInFrontOfCamera(6, 1.5, inputType, inputColor);
    scene.remove(temporaryFlower);
    

    placeFlower(flowerPosition, false, inputType, inputColor, {
      projectName: projectInputName,
      name: inputName,
      description: inputDescription,
      keyWord: inputKeyWord,
      link: inputLink,
      image: imageDataUrl,
    });


    // Notify and close modal
    alert("Information submitted successfully!");
    modal.style.display = "none";
    form.reset();
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Submission failed, please try again.");
  }
});



var addFlowerButton = document.getElementById("addFlowerButton");
addFlowerButton.addEventListener("click", function () {
  modal.style.display = "flex";
  updateTemporaryFlower();
});

//Retriving data from firebase 
var name = document.getElementById("name"); 
// var projectName = document.getElementById("projectName");
var descriptionText = document.getElementById("descriptionText");
var buttonLink = document.getElementById("buttonLink");
var keyWord = document.getElementById("keyWord");
// console.log("the name is: ", name);
// console.log(keyWord);
// name.innerText = "Dariga";
// name.innerHTML = "<img src='https://cdn.glitch.global/836a0c25-8e0a-479c-8ed2-3b72bdbd56b0/raspberry-pi-zero-5.png?v=1741705068745' style='width:2vw'>"

// const querySnapshot = getDocs(collection(db, "visitors"))
//   .then(querySnapshot => {
//     querySnapshot.forEach((doc) => {
//       // doc.data() is never undefined for query doc snapshots
//       // console.log(doc.id, " => ", doc.data());
//       var docData = doc.data();
//       // console.log("the date added is: ", docData["createdAt"]);
//       // console.log("the description is: ", docData["description"]);
//       // console.log("the key word is: ", docData["keyWord"]);
//       projectName.innerText = docData["projectName"];
//       name.innerText = docData["name"];
//       descriptionText.innerText = docData["description"];
//       buttonLink.href = docData["link"];
//       keyWord.innerText = docData["keyWord"];
//     });
//   });

/**
 * Base
 */
// Debug
const gui = new GUI()
gui.hide()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Fog shader
 */
var mesh, texture, terrainShader;
var params = {
  fogNearColor: 0xfc4848,
  fogHorizonColor: 0xe4dcff,
  fogDensity: 0.1,
  fogNoiseSpeed: 100,
  fogNoiseFreq: .0012,
  fogNoiseImpact: .5
};


/**
 * Environment 
 */

const rgbeLoader = new RGBELoader();
rgbeLoader.load('resources/environmentMaps/rosendal_park_sunset_puresky_1k.hdr', (hdrEquirect) => {
  hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdrEquirect;

});
scene.environmentIntensity = 0.5
scene.environmentRotation.z = 12

scene.background = new THREE.Color(params.fogHorizonColor);

// /**
//  * Fog
//  */
scene.fog = new THREE.FogExp2(params.fogHorizonColor, params.fogDensity);

var worldWidth = 256,
  worldDepth = 256;


  var geometry = new THREE.PlaneGeometry(200, 200, worldWidth - 1, worldDepth - 1); 

mesh = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({ color: new THREE.Color(0xefd1b5) })
);

mesh.material.onBeforeCompile = shader => {
  shader.vertexShader = shader.vertexShader.replace(
    `#include <fog_pars_vertex>`,
    fogParsVert
  );
  shader.vertexShader = shader.vertexShader.replace(
    `#include <fog_vertex>`,
    fogVert
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <fog_pars_fragment>`,
    fogParsFrag
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <fog_fragment>`,
    fogFrag
  );

  const uniforms = ({
    fogNearColor: { value: new THREE.Color(params.fogNearColor) },
    fogNoiseFreq: { value: params.fogNoiseFreq },
    fogNoiseSpeed: { value: params.fogNoiseSpeed },
    fogNoiseImpact: { value: params.fogNoiseImpact },
    time: { value: 0 }
  });

  shader.uniforms = THREE.UniformsUtils.merge([shader.uniforms, uniforms]);
  terrainShader = shader;
};
scene.add(mesh);

gui.add(params, "fogDensity", 0, 0.5).onChange(function() {
  scene.fog.density = params.fogDensity;
});
gui.addColor(params, "fogHorizonColor").onChange(function() {
  scene.fog.color.set(params.fogHorizonColor);
  scene.background = new THREE.Color(params.fogHorizonColor);
});
gui.addColor(params, "fogNearColor").onChange(function() {
  terrainShader.uniforms.fogNearColor = {
    value: new THREE.Color(params.fogNearColor)
  };
});
gui.add(params, "fogNoiseFreq", 0, 0.01, 0.0012).onChange(function() {
  terrainShader.uniforms.fogNoiseFreq.value = params.fogNoiseFreq;
});
gui.add(params, "fogNoiseSpeed", 0, 1000, 100).onChange(function() {
  terrainShader.uniforms.fogNoiseSpeed.value = params.fogNoiseSpeed;
});
gui.add(params, "fogNoiseImpact", 0, 1).onChange(function() {
  terrainShader.uniforms.fogNoiseImpact.value = params.fogNoiseImpact;
});
gui.open();


/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader()


const TILE_SIZE = 20;
const RENDER_RADIUS = 0.5;

//Floor
const floorAlphaTexture = textureLoader.load('./floor/alpha2.jpg')
const floorColorTexture = textureLoader.load('./resources/floor/floorColor.jpg')
const floorARMTexture = textureLoader.load('./resources/floor/floorAO.jpg')
const floorNormalTexture = textureLoader.load('./resources/floor/aerial_grass_rock_1k/aerial_grass_rock_nor_gl_1k.jpg')
const floorDisplacementTexture = textureLoader.load('./resources/floor/aerial_grass_rock_1k/aerial_grass_rock_disp_1k.jpg')

floorColorTexture.colorSpace = THREE.SRGBColorSpace
floorAlphaTexture.wrapS = THREE.ClampToEdgeWrapping;
floorAlphaTexture.wrapT = THREE.ClampToEdgeWrapping;

/**
 * Terrain tiles
 */
const tiles = [];
const tileSize = 5;
const gridSize = 10;


const tileGeo = new THREE.PlaneGeometry(tileSize, tileSize, 100, 100);
const tileMat = new THREE.MeshStandardMaterial({
  color: '#e5dcff',
  // alphaMap: floorAlphaTexture,
  // transparent: true,
  map: floorColorTexture,
  aoMap: floorARMTexture,
  // roughnessMap: floorARMTexture,
  // metalnessMap: floorARMTexture,
  // normalMap: floorNormalTexture,
  displacementMap: floorDisplacementTexture,
  displacementScale: 0.3,
  displacementBias: -0.2
});

gui.add(tileMat, 'displacementScale').min(0).max(1).step(0.001).name('Displacement Scale');
gui.add(tileMat, 'displacementBias').min(-1).max(1).step(0.001).name('Displacement Bias');
gui.addColor(tileMat, 'color').name('Grass color')

for (let x = 0; x < gridSize; x++) {
  for (let z = 0; z < gridSize; z++) {
    const tile = new THREE.Mesh(tileGeo, tileMat);
    tile.rotation.x = -Math.PI * 0.5;
    tile.receiveShadow = true;
    tile.userData.index = {
      x,
      z
    };
    tile.userData.flowers = [];
    scene.add(tile);
    tiles.push(tile);
  }
}

const objects = [];
objects.push(tileGeo);
scene.add(tileGeo);
objects.push(tileGeo);

function updateTiles() {
  const camTileX = Math.floor(camera.position.x / tileSize);
  const camTileZ = Math.floor(camera.position.z / tileSize);

  tiles.forEach(tile => {
    const oldX = tile.position.x;
    const oldZ = tile.position.z;
    const offsetX = (tile.userData.index.x);
    const offsetZ = (tile.userData.index.z);
    const newX = (camTileX + offsetX) * tileSize - (gridSize / 2 * tileSize) + tileSize * 0.5;
    const newZ = (camTileZ + offsetZ) * tileSize + tileSize * 0.5;
    // const newZ = (camTileZ + offsetZ) * tileSize - (gridSize / 2 * tileSize) + tileSize * 0.5;
    tile.position.set(newX, 0, newZ);

    const dx = newX - oldX;
    const dz = newZ - oldZ;
    tile.userData.flowers.forEach(flower => {
      flower.position.x += dx;
      flower.position.z += dz;
    });
  });
}


/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


})

/**
 * Flower
 */

const flowerInstances = [];
let temporaryFlower;
const originalFlowerPositions = [];

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null

function placeFlower(position, shouldSave, type = 'apple', color = '#E8D9EF', info = {}) {
  gltfLoader.load(`/resources/${type}.glb`, (gltf) => {
    const flower = gltf.scene.clone();
    flower.scale.set(0.1, 0.1, 0.1);
    flower.position.copy(position);
    flower.rotation.y = Math.PI + Math.random() * Math.PI;

    
    flower.info = info;

    // apply color tint
    flower.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.material = child.material.clone();
        child.material.color.set(color);
        child.material.emissive = new THREE.Color(0x000000);
        child.material.emissiveIntensity = 0.3;

      }
    });

    scene.add(flower);
    flowerInstances.push(flower);
    originalFlowerPositions.push(position);

  });
}

document.getElementById('aboutPopup').onclick = (e) => {
  e.stopPropagation();
  console.log('test');
}

async function loadStoredFlowersFirebase() {
  const querySnapshot = await getDocs(collection(db, "visitors"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const pos = data.flower?.position;
    if (!pos) return; // skip if no position data

    const position = new THREE.Vector3(pos.x, pos.y, pos.z);
    const type = data.flower?.type || 'apple';
    const color = data.flower?.color || '#E8D9EF';

    const info = {
      projectName: data.projectName,
      name: data.name,
      description: data.description,
      keyWord: data.keyWord,
      link: data.link,
      image: data.image,
    };

    placeFlower(position, false, type, color, info);
  });
}


loadStoredFlowersFirebase();


function addTemporaryFlower(distance = 3, offsetLeft = 3, type = 'apple', color = '#E8D9EF') {
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  const left = new THREE.Vector3();
  left.crossVectors(camera.up, direction).normalize();

  const position = new THREE.Vector3();
  position.copy(camera.position)
    .add(direction.multiplyScalar(distance))
    .add(left.multiplyScalar(offsetLeft + 1));

  position.y =0;

  gltfLoader.load(`/resources/${type}.glb`, (gltf) => {

    if (temporaryFlower) {
      scene.remove(temporaryFlower);
    }

    const flower = gltf.scene.clone();
    flower.scale.set(0.1, 0.1, 0.1);
    flower.position.copy(position);
   
    flower.rotation.y = Math.PI * (-0.5)

    // apply color tint
    flower.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.set(color);
      }
    });

    scene.add(flower);

    temporaryFlower = flower;
  });

}

function updateTemporaryFlower() {
  const type = document.getElementById('flowerType').value;
  const color = document.getElementById('flowerColor').value;
  addTemporaryFlower(3, 1.5, type, color);
}


document.getElementById('flowerType').addEventListener('change', updateTemporaryFlower);
document.getElementById('flowerColor').addEventListener('input', updateTemporaryFlower);



const button = document.getElementById('addFlowerButton')
button.addEventListener('click', () => {
  // addFlowerInFrontOfCamera(2)
  updateTemporaryFlower();
})


// let stats

// const api = {

//   count: 20000,
//   distribution: 'random',
//   resample: resample,
//   surfaceColor: 0xFFF784,
//   backgroundColor: 0xE39469,

// };

// let stemMesh, blossomMesh;
// let stemGeometry, blossomGeometry;
// let stemMaterial, blossomMaterial;

// const count = api.count;
// const ages = new Float32Array( count );
// const scales = new Float32Array( count );
// const dummy = new THREE.Object3D();

// const _normal = new THREE.Vector3();
// const _scale = new THREE.Vector3();

// let surfaceGeometry = new THREE.BoxGeometry( 10, 10, 10 ).toNonIndexed();
// // const surfaceGeometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 ).toNonIndexed();
// const surfaceMaterial = new THREE.MeshLambertMaterial( { color: api.surfaceColor, wireframe: false, transparent:true, opacity: 0 } );
// const surface = new THREE.Mesh( surfaceGeometry, surfaceMaterial );

// 	// Source: https://gist.github.com/gre/1650294
//   const easeOutCubic = function ( t ) {

//     return ( -- t ) * t * t + 1;

//   };
  // count: 10000,
  // distribution: 'random',
  // resample: resample,
  // surfaceColor: 0xFFF784,
  // backgroundColor: 0xE39469,

//   // Scaling curve causes particles to grow quickly, ease gradually into full scale, then
//   // disappear quickly. More of the particle's lifetime is spent around full scale.
//   const scaleCurve = function ( t ) {

//     return Math.abs( easeOutCubic( ( t > 0.5 ? 1 - t : t ) * 2 ) );

//   };

  

//   gltfLoader.load('./resources/daisy.glb', function (gltf) {
//     gltf.scene.updateMatrixWorld(true);
  
//     const _stemMesh = gltf.scene.getObjectByName('Stem');
//     const _blossomMesh = gltf.scene.getObjectByName('Blossom');
  
//     if (!_stemMesh || !_blossomMesh) {
//       console.error('Stem or Blossom not found in GLB');
//       return;
//     }
  
//     // Clone and bake world transforms
//     stemGeometry = _stemMesh.geometry.clone();
//     stemGeometry.applyMatrix4(_stemMesh.matrixWorld);
  
//     blossomGeometry = _blossomMesh.geometry.clone();
//     blossomGeometry.applyMatrix4(_blossomMesh.matrixWorld);
  
//     // Apply uniform scale and rotation (flip Z-up from Blender to Y-up in Three.js)
//     const DEFAULT_SCALE = 0.1;
//     const transform = new THREE.Matrix4()
//       .makeRotationX(Math.PI *2)  // 
//       .multiply(new THREE.Matrix4().makeScale(DEFAULT_SCALE, DEFAULT_SCALE, DEFAULT_SCALE));
  
//     stemGeometry.applyMatrix4(transform);
//     blossomGeometry.applyMatrix4(transform);
  
//     stemMaterial = _stemMesh.material;
//     blossomMaterial = _blossomMesh.material;

// blossomMaterial = blossomMaterial.clone();
// blossomMaterial.metalness = 0.7;
// blossomMaterial.roughness = 0.1;
// blossomMaterial.envMapIntensity = 0.9;

    
  
//     stemMesh = new THREE.InstancedMesh(stemGeometry, stemMaterial, count);
//     blossomMesh = new THREE.InstancedMesh(blossomGeometry, blossomMaterial, count);
  
//     const color = new THREE.Color();
//     const blossomPalette = [0xf9d3e0, 0xd4e3fe, 0xf8fadb, 0xffe4a8, 0xffc4ab];
  
//     for (let i = 0; i < count; i++) {
//       color.setHex(blossomPalette[Math.floor(Math.random() * blossomPalette.length)]);
//       blossomMesh.setColorAt(i, color);
//     }
  
//     stemMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
//     blossomMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  
//     resample();
//     init();
//   });
  
  

//   function init() {
//     //

//     scene.add( stemMesh );
//     scene.add( blossomMesh );

//     scene.add( surface );

//     //


//     gui.add( api, 'count', 0, count ).onChange( function () {

//       stemMesh.count = api.count;
//       blossomMesh.count = api.count;

//     } );
//     gui.add( api, 'distribution' ).options( [ 'random', 'weighted' ] ).onChange( resample );
//     gui.add( api, 'resample' );



//     //

//     stats = new Stats();
//     document.body.appendChild( stats.dom );

//     //

   

//   }

//   function resample() {

//     for ( let i = 0; i < count; i ++ ) {

//       ages[ i ] = Math.random();
//       scales[ i ] = scaleCurve( ages[ i ] );

//       resampleParticle( i );
//     }

//     stemMesh.instanceMatrix.needsUpdate = true;
//     blossomMesh.instanceMatrix.needsUpdate = true;

//   }

//   function resampleParticle( i ) {

    
//     var x = (Math.random() * 2 - 1) * 100;
//     var z = (Math.random() * 2 - 1) * 100;
//     var position = new THREE.Vector3(x, 0, z);

//     var normal = position.clone();
    
//     normal.add( new THREE.Vector3((Math.random() * 2) - 1, 1, (Math.random() * 2) - 1));

//     dummy.position.copy( position );
    
//     dummy.rotation.set(0, 0, 0);
//     dummy.updateMatrix();

//     stemMesh.setMatrixAt( i, dummy.matrix );
//     blossomMesh.setMatrixAt( i, dummy.matrix );

//   }

//   function updateParticle( i ) {

//     // Update lifecycle.

//     ages[ i ] += 0.005;

//     if ( ages[ i ] >= 1 ) {

//       ages[ i ] = 0.001;
//       scales[ i ] = scaleCurve( ages[ i ] );

//       resampleParticle( i );

//       return;

//     }

//     // Update scale.

//     const prevScale = scales[ i ];
//     scales[ i ] = scaleCurve( ages[ i ] );
//     _scale.set( scales[ i ] / prevScale, scales[ i ] / prevScale, scales[ i ] / prevScale );

//     // Update transform.

//     stemMesh.getMatrixAt( i, dummy.matrix );
//     dummy.matrix.scale( _scale );
//     stemMesh.setMatrixAt( i, dummy.matrix );
//     blossomMesh.setMatrixAt( i, dummy.matrix );

//   }




			


/**
 * Raycaster and mouse
 */


const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 50);

const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) =>
{
  mouse.x= event.clientX / sizes.width * 2 -1
  mouse.y= - (event.clientY / sizes.height) * 2 + 1
})

const container = document.querySelector(".container");
// console.log(container)

window.addEventListener('click', () => {
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(flowerInstances, true);
  if (hits.length > 0) {
    const picked = hits[0].object;

    let parent = picked;
    while (parent && !parent.info && parent.parent) {
      parent = parent.parent;
    }

    // console.log("Clicked parent:", parent);

    if (parent && parent.info) {
      const info = parent.info;
      console.log(info);
      // console.log("INFO FOUND:", info);

      document.getElementById("projectName").innerText = info.projectName;
      document.getElementById("name").innerText = info.name || "Unnamed";
      document.getElementById("descriptionText").innerText = info.description || "";
      document.getElementById("projectLink").href = info.link || "#";
      document.getElementById("currentImage").src = info.image || "";
      const keywordsContainer = document.getElementById("keywordsContainer");
keywordsContainer.innerHTML = ""; // clear previous content

const keywords = (info.keyWord || "").split(",").map(k => k.trim()).filter(k => k !== "");

keywords.forEach(keyword => {
  const span = document.createElement("span");
  span.className = "keyword-box";
  span.innerText = keyword;
  keywordsContainer.appendChild(span);
});


      container.style.display = "block";

    } else {
      // console.warn("No info found on clicked object.");
    }
  } else {
    // console.log("No flower picked.");
  }
});



document.getElementById("closeInfo").addEventListener("click", () => {
  document.querySelector(".container").style.display = "none";
});




/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#dfd2c3', 4)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

gui.addColor(directionalLight, 'color').name('Light')
gui.addColor(ambientLight, 'color').name('Ambient Light')



/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 1.5
camera.position.z = 5
scene.add(camera)

//Audio

// Create an AudioListener and attach it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

// Create a global audio source
const sound = new THREE.Audio(listener);

// Load audio file
const audioLoader = new THREE.AudioLoader();
audioLoader.load('resources/music.mp3', (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
});

// Add button functionality
const audioBtn = document.getElementById('audioButton');
let isPlaying = false;

audioBtn.addEventListener('click', () => {
    if (!isPlaying) {
        sound.play();
        
    } else {
        sound.pause();
        
    }
    isPlaying = !isPlaying;
});

const aduioButton = document.getElementById('audioButton');

audioButton.addEventListener('click', () => {
  audioButton.classList.toggle('clicked');
});


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Controls
 */

// const controls = new PointerLockControls(camera, document.body)
const controls = new MapControls(camera, renderer.domElement);
// console.log('max azimuth:' + controls.maxAzimuthAngle);
// console.log('min azimuth:' + controls.minAzimuthAngle);

controls.minAzimuthAngle = Math.PI;
controls.maxAzimuthAngle = Math.PI;

//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.1;

controls.screenSpacePanning = false;

controls.minDistance = 5;
controls.maxDistance = 25;

controls.maxPolarAngle = Math.PI / 2;


gui.add(controls, 'zoomToCursor');
gui.add(controls, 'screenSpacePanning');

/**
 * Shadows
 */

// Renderer
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

// Mapping
directionalLight.castShadow = true; 
directionalLight.shadow.mapSize.width = 256
directionalLight.shadow.mapSize.height = 256
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.left = -8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 20


/**
 * Animate
 */
const timer = new Timer()

const tick = () => {

  //Light
  // Update directional light to follow camera
const lightOffset = new THREE.Vector3(3, 5, -3); // Adjust this to control angle of shadows
const lightPosition = camera.position.clone().add(lightOffset);
directionalLight.position.copy(lightPosition);

// Make the light look where the camera looks
const target = new THREE.Vector3();
camera.getWorldDirection(target);
target.add(camera.position);
directionalLight.target.position.copy(target);
directionalLight.target.updateMatrixWorld(); 


  // Raycaster
  raycaster.setFromCamera(mouse, camera)

  if(flowerInstances){
    const hits = raycaster.intersectObjects(flowerInstances, true);
   
  }

  const hits = raycaster.intersectObjects(flowerInstances, true);

let hoveredFlower = null;

if (hits.length > 0) {
  let obj = hits[0].object;

  // Traverse up to find the top-level flower
  while (obj.parent && !obj.info) {
    obj = obj.parent;
  }

  if (obj.info) {
    hoveredFlower = obj;
  }
}

// Reset all flowers to no glow
flowerInstances.forEach(flower => {
  flower.traverse(child => {
    if (child.isMesh && child.material?.emissive) {
      child.material.emissive.set(0x000000);
    }
  });
});

// Apply glow to hovered flower
if (hoveredFlower) {
  hoveredFlower.traverse(child => {
    if (child.isMesh && child.material?.emissive) {
      child.material.emissive.set(0xffe4a8); // glow color
    }
  });
}

//flower rotation
if (temporaryFlower) {
  temporaryFlower.rotation.y += 0.01; // You can adjust speed
}


  updateTiles();

  updateFlowers(camera.position);


 
  // Timer

  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  controls.update(camera.position);

   // Fog
   if(terrainShader) {
    terrainShader.uniforms.time.value += deltaTime;
  }

 
  
  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)

  

}


tick()



function updateFlowers(cameraPosition) {
  for (let i = 0; i < flowerInstances.length; i++) {
    const originalPos = originalFlowerPositions[i];
    const flower = flowerInstances[i];

    const dx = cameraPosition.x - originalPos.x;
    const dz = cameraPosition.z - originalPos.z;

    // Calculate tile offset in grid coordinates
    const tileOffsetX = Math.round(dx / TILE_SIZE);
    const tileOffsetZ = Math.round(dz / TILE_SIZE);

    // Wrap position within visible area
    const wrappedX = originalPos.x + tileOffsetX * TILE_SIZE;
    const wrappedZ = originalPos.z + tileOffsetZ * TILE_SIZE;

    // Distance culling (only show if within visible radius)
    const distX = wrappedX - cameraPosition.x;
    const distZ = wrappedZ - cameraPosition.z;

    if (Math.abs(distX) <= RENDER_RADIUS * TILE_SIZE &&
      Math.abs(distZ) <= RENDER_RADIUS * TILE_SIZE) {
      flower.visible = true;
      flower.position.set(wrappedX, originalPos.y, wrappedZ);
    } else {
      flower.visible = false;
    }
  }
}

// Adding image
/**
 * Resizes an image and converts it to a data URL
 * @param {File} imageFile - The original image file
 * @param {number} maxWidth - Maximum width for the resized image
 * @returns {Promise<string>} A promise that resolves with the data URL
 */
function resizeAndConvertToDataUrl(imageFile, maxWidth) {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the image file
    const reader = new FileReader();

    reader.onload = function (event) {
      // Create an image object
      const img = new Image();

      img.onload = function () {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        // Create canvas for resizing
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // Draw resized image on canvas
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to data URL (JPEG format with 90% quality to reduce size)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

        // Check if data URL is too large for Firestore (limit is 1,048,487 bytes)
        if (dataUrl.length > 1000000) {
          // If still too large, reduce quality further
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        } else {
          resolve(dataUrl);
        }
      };

      img.onerror = function () {
        reject(new Error("Failed to load image"));
      };

      // Set the source of the image
      img.src = event.target.result;
    };

    reader.onerror = function () {
      reject(new Error("Failed to read file"));
    };

    // Read the image file as a data URL
    reader.readAsDataURL(imageFile);
  });
}

const fileInput  = document.getElementById('flowerInputImage');
const previewImg = document.getElementById('imagePreview');

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) {
    previewImg.style.display = 'none';
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    previewImg.src           = e.target.result;
    previewImg.style.display = 'block';
  };
  reader.readAsDataURL(file);
});


/**
 * Search function
 */

function addKeywordToFilter(keyword) {
  const tagContainer = document.getElementById("activeKeywords");

  // prevent duplicates
  const exists = [...tagContainer.children].some(el => el.dataset.keyword === keyword);
  if (exists) return;

  const tag = document.createElement("div");
  tag.className = "keyword-pill";
  tag.dataset.keyword = keyword;
  tag.innerHTML = `${keyword} <button>&times;</button>`;

  tag.querySelector("button").addEventListener("click", () => {
    tag.remove();
    runKeywordFilter();
  });

  tagContainer.appendChild(tag);
  runKeywordFilter();
}


document.getElementById("searchButton").addEventListener("click", async () => {
  const input = document.getElementById("keywordSearch");
  const query = input.value.trim().toLowerCase();
  const message = document.getElementById("searchMessage");
  const tagContainer = document.getElementById("activeKeywords");

  input.value = ""; // clear input after adding
  message.style.display = "none";

  if (!query) return;

  // Add tag if it doesn't already exist
  const existing = [...tagContainer.children].some(el => el.dataset.keyword === query);
  if (existing) return;

  const tag = document.createElement("div");
  tag.className = "keyword-pill";
  tag.dataset.keyword = query;
  tag.innerHTML = `${query} <button>&times;</button>`;

  tag.querySelector("button").addEventListener("click", () => {
    tag.remove();
    runKeywordFilter(); // re-run search without this tag
  });

  tagContainer.appendChild(tag);

  runKeywordFilter(); // search with updated tags
});

async function runKeywordFilter() {
  const tags = [...document.querySelectorAll("#activeKeywords .keyword-pill")];
  const queries = tags.map(tag => tag.dataset.keyword);
  const message = document.getElementById("searchMessage");

  // Reset flowers
  flowerInstances.forEach(f => scene.remove(f));
  flowerInstances.length = 0;
  originalFlowerPositions.length = 0;

  if (queries.length === 0) {
    message.style.display = "none";
    await loadStoredFlowersFirebase(); // show all
    return;
  }

  const snapshot = await getDocs(collection(db, "visitors"));
  let matchCount = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const keywords = (data.keyWord || "").toLowerCase().split(",").map(k => k.trim());

    // Match if any keyword is included in current filter
    const isMatch = queries.some(q => keywords.includes(q));
    if (!isMatch) return;

    const pos = data.flower?.position;
    if (!pos) return;

    const position = new THREE.Vector3(pos.x, pos.y, pos.z);
    const type = data.flower?.type || 'apple';
    const color = data.flower?.color || '#E8D9EF';

    const info = {
      projectName: data.projectName,
      name: data.name,
      description: data.description,
      keyWord: data.keyWord,
      link: data.link,
      image: data.image,
    };

    placeFlower(position, false, type, color, info);
    matchCount++;
  });

  message.style.display = matchCount === 0 ? "block" : "none";
}

async function showTopTags() {
  const tagCounts = {};
  const snapshot = await getDocs(collection(db, "visitors"));

  snapshot.forEach((doc) => {
    const data = doc.data();
    const keywords = (data.keyWord || "")
      .toLowerCase()
      .split(",")
      .map(k => k.trim())
      .filter(k => k !== "");

    keywords.forEach((kw) => {
      if (tagCounts[kw]) tagCounts[kw]++;
      else tagCounts[kw] = 1;
    });
  });

  // Get top 10 tags
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1]) // sort descending
    .slice(0, 20);

  const tagContainer = document.getElementById("topTagsList");
  tagContainer.innerHTML = ""; // clear previous tags

  topTags.forEach(([tag, count]) => {
    const pill = document.createElement("div");
    pill.className = "top-tag-pill";
    pill.textContent = `${tag} (${count})`;
    pill.dataset.keyword = tag;

    pill.addEventListener("click", () => {
      addKeywordToFilter(tag);
    });

    tagContainer.appendChild(pill);
  });
}

showTopTags(); // load and display most used tags
