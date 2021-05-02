import "./style.css"
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import * as dat from "dat.gui";
import gsap from "gsap";
import Stats from "stats.js";

import OverlayVertexShader from "./shaders/overlay/vertex.glsl";
import OverlayFragmentShader from "./shaders/overlay/fragment.glsl";

const components = {
    debugger: null,
    glScene: null,
    cssScene: null,
    glRenderer: null,
    cssRenderer: null,
    camera: {
        object: null,
        originalPosition: null
    },
    controls: null,
    cursor: new THREE.Vector2(),
    raycaster: null,
    composer: null,
    animationMixer: null,
    listener: null
};

const lights = {
    directionalLight: {
        source: null,
        color: 0xffffff
    },
    secondDirectionalLight: {
        source: null,
        color: 0xffffff
    },
    ambientLight: {
        source: null,
        color: 0xffffff
    },
    lampLight: {
        source: null,
        color: 0xf06b3e,
        enabled: false
    }
};

let lampFace = null;

const loaders = {
    manager: null,
    dracoLoader: null,
    gltfLoader: null,
};

const passes = {
    outlinePassSkinned: null,
    outlinePassNonSkinned: null,
    params: {
        edgeStrength: 8,
        edgeGlow: 0.1,
        edgeThickness: 1.5,
        pulsePeriod: 0,
        usePatternTexture: false,
        visibleEdgeColor: 0xffffff,
        hiddenEdgeColor: 0x190a05,
        focus: 1.0,
        aperture: 0.1,
        maxblur: 0.0001
    },
    alternativeBokehParams: {
        focus: 0.5,
        aperture: 0.001,
        maxblur: 0.005
    },
    FXAAPass: null,
    bloomPass: null,
    bokehPass: null
};

const sounds = {
    woodPush: null,
    woodPull: null,
    itemSelect: null,
    pageFlip: null
};

const buttons = {
    startButton: null
};

const parameters = {
    lastTime: performance.now()
};

let clickables = new Map();

let animables = new Map();

let selected = null;

let canReturnSelected = false;

let canReturnCamera = false;

let deskAnimations = [];

let intersected = null;

let drag = false;

let lastTap = 0;

let tapTimeout = null;

let shadowUpdateTimeout = null;

let mouseMoveTimeout = null;

let zoomRefFactor = 0;

let hasStarted = false;

let overlayMesh = null;

let loadingFinished = false;

let cssObjectDeezer = null;

let cssObjectWindows = null;

let folderSkinned = {
    object: null,
    currentPage: 1,
    canFlipPage: true
};

let stats = null;

const MAX_PAGE_COUNT = 2;

// Deezer Element
const deezerElement = document.createElement("iframe");
deezerElement.setAttribute("title", "deezer-widget");
deezerElement.setAttribute("src", "https://widget.deezer.com/widget/light/playlist/1787912442");
deezerElement.setAttribute("width", "760");
deezerElement.setAttribute("height", "400");
deezerElement.setAttribute("frameborder", "0");
deezerElement.setAttribute("allowtransparency", "true");
deezerElement.setAttribute("allow", "encrypted-media");

// Windows 10 Element
const windowsElement = document.createElement("div");
windowsElement.setAttribute("style", "overflow: hidden; border-radius: 9px;");
const winFrame = document.createElement("iframe");
winFrame.setAttribute("title", "windows-widget");
winFrame.setAttribute("src", "/win10-mockup/index.html");
winFrame.setAttribute("width", "1280");
winFrame.setAttribute("height", "720");
winFrame.setAttribute("frameborder", "0");
winFrame.setAttribute("allowtransparency", "true");
winFrame.setAttribute("allow", "encrypted-media");
windowsElement.appendChild(winFrame);

// Instructions
let instructionsHolder = null;

// Canvas
const canvas = document.querySelector("canvas.webgl");

const onWindowResize = () => {
    components.camera.object.aspect = window.innerWidth / window.innerHeight;
    components.camera.object.updateProjectionMatrix();

    components.glRenderer.setPixelRatio(window.devicePixelRatio);
    components.glRenderer.setSize(window.innerWidth, window.innerHeight);
    components.cssRenderer.setSize(window.innerWidth, window.innerHeight);

    components.composer.setSize(window.innerWidth, window.innerHeight);
    components.composer.setPixelRatio(window.devicePixelRatio);
    passes.FXAAPass.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);

    components.debugger.width = window.innerWidth * 0.25;

    if (overlayMesh !== null)
        overlayMesh.material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
};

// Add a mobile device check
window.mobileCheck = () => {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

const transformHelper = (object, camera, domElement) => {
    const control = new TransformControls(camera, domElement);
    control.addEventListener("dragging-changed", (event) => {
        components.controls.enabled = !event.value;
        console.log(object.position);
        console.log(object.rotation);
    });
    control.attach(object);xwxqx
    return control;
};

const updateMaterials = () => {
    components.glScene.traverse((child) => {
        // Check if the object is clickable. This property is coded in the model.
        if (child.userData.IsClickable === 1) {
            clickables.set(child.name, child);
            if (child instanceof THREE.SkinnedMesh) {
                animables.set(child.name, { reverseFactor: 1 });
            }
        }

        else if (child.name === "Folder_Skinned") {
            folderSkinned.object = child;
            animables.set(folderSkinned.object.name, { reverseFactor: 1 });
            folderSkinned.object.visible = false;
        }

        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.frustumCulled = false;
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.needsUpdate = true;

            if (child.material.userData.IsEmissible > 0)
                child.material.emissiveIntensity = Number(child.material.userData.IsEmissible);
        }
    });

    // console.log(clickables);
};

const start = () => {
    clearTimeout(mouseMoveTimeout);
    gsap.killTweensOf(overlayMesh.material.uniforms.u_mixAddFactor);
    gsap.to(overlayMesh.material.uniforms.u_mixAddFactor, { duration: 1.25, value: 0 });
    const tween = gsap.to(overlayMesh.material.uniforms.u_alpha, { duration: 1.25, value: 0, 
        onStart: () => {
            document.body.removeChild(buttons.startButton);
        },
        onUpdate: () => {
            const progress = tween.progress();
            if (progress > 0.1 && !hasStarted) {
                hasStarted = true;
                components.controls.enabled = true;
            }

            if (progress > 0.2 && instructionsHolder === null) {
                instructionsHolder = document.createElement("div");
                instructionsHolder.classList.add("instructions");
                setTimeout(() => instructionsHolder.classList.add("started"), 10);
                const textLMB = document.createElement("span");
                textLMB.setAttribute("class", "textLMB");
                textLMB.textContent = "Move around / Interact with objects";
                const textWheel = document.createElement("span");
                textWheel.setAttribute("class", "textWheel");
                textWheel.textContent = "Zoom in and out";
                const imgLMB = document.createElement("img");
                imgLMB.setAttribute("src", "/images/Mouse_LMB.png");
                imgLMB.setAttribute("class", "imgLMB");
                const imgWheel = document.createElement("img");
                imgWheel.setAttribute("src", "/images/Mouse_Wheel.png");
                imgWheel.setAttribute("class", "imgWheel");
                instructionsHolder.appendChild(textLMB);
                instructionsHolder.appendChild(textWheel);
                instructionsHolder.appendChild(imgLMB);
                instructionsHolder.appendChild(imgWheel);
                document.body.appendChild(instructionsHolder);
            }
        },
        onComplete: () => {
            overlayMesh.geometry.dispose();
            overlayMesh.material.dispose();
            components.glScene.remove(overlayMesh.object);
            components.glRenderer.renderLists.dispose();
            overlayMesh = null;
        }
    });
};

const initialize = async () => {
    // Stats
    // stats = new Stats();
    // stats.showPanel(0);
    // document.body.appendChild(stats.dom);

    // Scenes
    components.glScene = new THREE.Scene();
    components.glScene.background = new THREE.Color(0xcee1e4);
    
    components.cssScene = new THREE.Scene();

    // Loading Overlay
    const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
    const overlayMaterial = new THREE.ShaderMaterial({
        transparent: true,
        uniforms:
        {
            u_time: {
                type: "f",
                value: 0
            },
            u_bgColor: {
                type: "c",
                value: new THREE.Color(0xc2fffb)
            },
            u_mouseColor: {
                type: "c",
                value: new THREE.Color(0x050505)
            },
            u_mouse: {
                type: "v2",
                value: new THREE.Vector2(0, 0)
            },
            u_resolution: {
                type: "v2",
                value: new THREE.Vector2(window.innerWidth, window.innerHeight)
            },
            u_alpha: {
                type: "f",
                value: 1
            },
            u_loadingFactor: {
                type: "f",
                value: 1
            },
            u_mixAddFactor: {
                type: "f",
                value: 1
            },
        },
        vertexShader: OverlayVertexShader,
        fragmentShader: OverlayFragmentShader,
        defines: {
            devicePR: window.devicePixelRatio.toFixed(2)
        }
    });
    overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial);
    components.glScene.add(overlayMesh);

    // Lighting
    const d = 5;
    lights.directionalLight.source = new THREE.DirectionalLight(lights.directionalLight.color, 0.7);
    lights.directionalLight.source.shadow.mapSize.width = 2048;
    lights.directionalLight.source.shadow.mapSize.height = 2048;
    lights.directionalLight.source.shadow.radius = 4;
    lights.directionalLight.source.shadow.normalBias = 0.01;
    lights.directionalLight.source.position.set(0, 2, 1.5);
    lights.directionalLight.source.castShadow = true;
    lights.directionalLight.source.shadow.camera.left = -d;
    lights.directionalLight.source.shadow.camera.right = d;
    lights.directionalLight.source.shadow.camera.top = d;
    lights.directionalLight.source.shadow.camera.bottom = -d;
    lights.directionalLight.source.shadow.camera.far = d;
    components.glScene.add(lights.directionalLight.source);

    // components.glScene.add(new THREE.DirectionalLightHelper(lights.directionalLight.source, 2));
    // components.glScene.add(new THREE.CameraHelper(lights.directionalLight.source.shadow.camera));

    lights.secondDirectionalLight.source = new THREE.DirectionalLight(lights.secondDirectionalLight.color, 0.5);
    lights.secondDirectionalLight.source.position.set(0, -0.8, 2.4);
    lights.secondDirectionalLight.source.rotation.set(0.8, 0, 0);
    components.glScene.add(lights.secondDirectionalLight.source);

    // components.glScene.add(new THREE.DirectionalLightHelper(lights.secondDirectionalLight.source, 2, 0xff0000));

    const thirdDirectionalLight = new THREE.DirectionalLight(lights.secondDirectionalLight.color, 0.5);
    thirdDirectionalLight.position.set(0, -0.8, -2.4);
    thirdDirectionalLight.rotation.set(3.2, 0, 0);
    components.glScene.add(thirdDirectionalLight);

    // components.glScene.add(new THREE.DirectionalLightHelper(thirdDirectionalLight, 2, 0xff0000));

    lights.ambientLight.source = new THREE.AmbientLight(lights.ambientLight.color, 2.7);
    components.glScene.add(lights.ambientLight.source);

    lights.lampLight.source = new THREE.SpotLight(lights.lampLight.color, 0);
    lights.lampLight.source.position.set(-2, 2.3, -0.3);
    lights.lampLight.source.angle = 0.8;
    lights.lampLight.source.penumbra = 1.9;
    lights.lampLight.source.decay = 2;
    lights.lampLight.source.distance = 1.5;

    lights.lampLight.source.castShadow = true;
    lights.lampLight.source.shadow.mapSize.width = 512;
    lights.lampLight.source.shadow.mapSize.height = 512;
    lights.lampLight.source.shadow.camera.near = 10;
    lights.lampLight.source.shadow.camera.far = 20;
    lights.lampLight.source.shadow.focus = 1;
    components.glScene.add(lights.lampLight.source);

    // components.glScene.add(new THREE.SpotLightHelper(lights.lampLight.source));

    // Raycaster
    components.raycaster = new THREE.Raycaster();

    // Renderers
    components.glRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialiasing: true, alpha: true });
    components.glRenderer.physicallyCorrectLights = true;
    components.glRenderer.setPixelRatio(window.devicePixelRatio);
    components.glRenderer.setSize(window.innerWidth, window.innerHeight);
    components.glRenderer.shadowMap.enabled = true;
    components.glRenderer.outputEncoding = THREE.sRGBEncoding;
    components.glRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    components.glRenderer.toneMappingExposure = 1;
    components.glRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    components.glRenderer.setClearColor(0x000000, 0);
    components.glRenderer.domElement.style.position = "absolute";
    components.glRenderer.domElement.style.zIndex = 0;
    components.glRenderer.domElement.style.top = 0;

    components.cssRenderer = new CSS3DRenderer();
    components.glRenderer.setPixelRatio(window.devicePixelRatio);
    components.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    components.cssRenderer.domElement.style.position = "absolute";
    components.cssRenderer.domElement.style.top = 0;
    components.cssRenderer.domElement.appendChild(components.glRenderer.domElement);

    document.body.appendChild(components.cssRenderer.domElement);

    // Loading Manager
    loaders.manager = new THREE.LoadingManager(
        // Complete
        () => {
            loadingFinished = true;
            gsap.to(overlayMesh.material.uniforms.u_loadingFactor, { duration: 0.75, value: 0 })
            gsap.delayedCall(0.5, () => {
                components.glRenderer.shadowMap.autoUpdate = false;
                
                buttons.startButton = document.createElement("button");
                buttons.startButton.classList.add("start");
                buttons.startButton.onclick = start;
                const startText = document.createElement("span");
                startText.textContent = "Start";
                buttons.startButton.appendChild(startText);
                document.body.appendChild(buttons.startButton);

                setTimeout(() => {
                    buttons.startButton.style.transform = `scale(1)`;
                }, 500);
            });
        },
        // Progress
        (itemUrl, itemsLoaded, itemsTotal) => {}
    );

    // DRACO Loader
    loaders.dracoLoader = new DRACOLoader();
    loaders.dracoLoader.setDecoderPath("/draco/gltf/");

    // GLTF Loader
    loaders.gltfLoader = new GLTFLoader(loaders.manager);
    loaders.gltfLoader.setDRACOLoader(loaders.dracoLoader);
    loaders.gltfLoader.load("/models/stylized_desk.glb", (gltf) => {
        components.animationMixer = new THREE.AnimationMixer(gltf.scene);
        deskAnimations = [...gltf.animations];
        gltf.scene.scale.set(0.6, 0.6, 0.6);
        components.glScene.add(gltf.scene);
        updateMaterials();
        let material = new THREE.MeshPhongMaterial({ color: 0x757575, opacity: 0, side: THREE.DoubleSide, blending: THREE.NoBlending });
        let geometry = new THREE.PlaneBufferGeometry();
        
        let laptopScreenMesh = new THREE.Mesh(geometry, material);
        laptopScreenMesh.position.set(0.592, 2.14, -0.067);
        laptopScreenMesh.scale.set(1.23, 0.655, 1);
        laptopScreenMesh.rotation.set(-0.166, 0, 0);
        // components.glScene.add(laptopScreenMesh);
        // const transformControls = transformHelper(laptopScreenMesh, components.camera.object, components.glRenderer.domElement);
        // components.glScene.add(transformControls);

        cssObjectDeezer = new CSS3DObject(deezerElement);
        cssObjectDeezer.position.copy(laptopScreenMesh.position);
        cssObjectDeezer.rotation.x = laptopScreenMesh.rotation.x;
        cssObjectDeezer.rotation.y = laptopScreenMesh.rotation.y;
        cssObjectDeezer.rotation.z = laptopScreenMesh.rotation.z;
        cssObjectDeezer.scale.set(0.00162, 0.00165, 1);
        components.cssScene.add(cssObjectDeezer);

        let monitorScreenMesh = new THREE.Mesh(geometry, material);
        monitorScreenMesh.position.set(1.88520, 2.50442, -0.24123);
        monitorScreenMesh.scale.set(1.5, 0.845, 1);
        monitorScreenMesh.rotation.set(-0.148, -0.604, -0.0842);
        // components.glScene.add(monitorScreenMesh);
        // const transformControls = transformHelper(monitorScreenMesh, components.camera.object, components.glRenderer.domElement);
        // components.glScene.add(transformControls);

        cssObjectWindows = new CSS3DObject(windowsElement);
        cssObjectWindows.position.copy(monitorScreenMesh.position);
        cssObjectWindows.position.y -= 0.004;
        cssObjectWindows.rotation.x = monitorScreenMesh.rotation.x;
        cssObjectWindows.rotation.y = monitorScreenMesh.rotation.y;
        cssObjectWindows.rotation.z = monitorScreenMesh.rotation.z;
        cssObjectWindows.rotateX(-0.001);
        cssObjectWindows.scale.set(0.001148, 0.001126, 1);
        components.cssScene.add(cssObjectWindows);

        geometry = new THREE.CircleBufferGeometry(0.13, 12, 0, 2 * Math.PI);
        lampFace = new THREE.Mesh(geometry, material);
        lampFace.position.set(-2.02143, 2.24258, -0.48935);
        lampFace.rotation.set(0.68735, 0.83853, -0.56414);
        components.glScene.add(lampFace);
        // const transformControls = transformHelper(lampFace, components.camera.object, components.glRenderer.domElement);
        // components.glScene.add(transformControls);
    });

    // Camera
    components.camera.object = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    components.camera.originalPosition = new THREE.Vector3(0, 3, 4);
    components.camera.object.position.copy(components.camera.originalPosition);

    // Audio Listner
    components.listener = new THREE.AudioListener();
    components.camera.object.add(components.listener);

    // Sounds
    sounds.itemSelect = new THREE.Audio(components.listener);
    sounds.woodPush = new THREE.Audio(components.listener);
    sounds.woodPull = new THREE.Audio(components.listener);
    sounds.pageFlip = new THREE.Audio(components.listener);
    
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("/sounds/item_select.ogg", (buffer) => {
        sounds.itemSelect.setBuffer(buffer);
        sounds.itemSelect.setLoop(false);
        sounds.itemSelect.setVolume(0.4);
    });
    audioLoader.load("/sounds/wood_push.ogg", (buffer) => {
        sounds.woodPush.setBuffer(buffer);
        sounds.woodPush.setLoop(false);
        sounds.woodPush.setVolume(0.3);
    });
    audioLoader.load("/sounds/wood_pull.ogg", (buffer) => {
        sounds.woodPull.setBuffer(buffer);
        sounds.woodPull.setLoop(false);
        sounds.woodPull.setVolume(0.3);
    });
    audioLoader.load("/sounds/page_flip.ogg", (buffer) => {
        sounds.pageFlip.setBuffer(buffer);
        sounds.pageFlip.setLoop(false);
        sounds.pageFlip.setVolume(0.1);
    });

    // Post Processing
    const renderTarget = new THREE.WebGLRenderTarget(
        1920,
        1080,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            encoding: THREE.sRGBEncoding,
        }
    );

    components.composer = new EffectComposer(components.glRenderer, renderTarget);
    components.composer.setPixelRatio(window.devicePixelRatio);
    components.composer.setSize(window.innerWidth, window.innerHeight);

    const renderPass = new RenderPass(components.glScene, components.camera.object);
    components.composer.addPass(renderPass);
    
    passes.outlinePassSkinned = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), components.glScene, components.camera.object);
    passes.outlinePassSkinned.depthMaterial.skinning = true;
    passes.outlinePassSkinned.prepareMaskMaterial.skinning = true;
    passes.outlinePassSkinned.edgeStrength = passes.params.edgeStrength;
    passes.outlinePassSkinned.edgeGlow = passes.params.edgeGlow;
    passes.outlinePassSkinned.edgeThickness = passes.params.edgeThickness;
    passes.outlinePassSkinned.pulsePeriod = passes.params.pulsePeriod;
    components.composer.addPass(passes.outlinePassSkinned);

    passes.outlinePassNonSkinned = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), components.glScene, components.camera.object);
    passes.outlinePassNonSkinned.edgeStrength = passes.params.edgeStrength;
    passes.outlinePassNonSkinned.edgeGlow = passes.params.edgeGlow;
    passes.outlinePassNonSkinned.edgeThickness = passes.params.edgeThickness;
    passes.outlinePassNonSkinned.pulsePeriod = passes.params.pulsePeriod;
    components.composer.addPass(passes.outlinePassNonSkinned);

    passes.FXAAPass = new ShaderPass(FXAAShader);
    passes.FXAAPass.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    components.composer.addPass(passes.FXAAPass);

    passes.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.15, 1, 0.6);
    components.composer.addPass(passes.bloomPass);

    passes.bokehPass = new BokehPass(
        components.glScene,
        components.camera.object,
        {
            focus: passes.params.focus,
            aperture: passes.params.aperture,
            maxblur: passes.params.maxblur,

            width: window.innerWidth,
            height: window.innerHeight
        }
    );
    components.composer.addPass(passes.bokehPass);

    if (components.glRenderer.getPixelRatio() === 1 && !components.glRenderer.capabilities.isWebGL2) // Should always be the last pass to add
        components.composer.addPass(new SMAAPass());

    // Controls
    components.controls = new OrbitControls(components.camera.object, components.glRenderer.domElement);
    components.controls.target = new THREE.Vector3(0, 0, 0);
    components.controls.minDistance = 3;
    components.controls.maxDistance = 6;
    components.controls.minPolarAngle = 0.05 * Math.PI;
    components.controls.maxPolarAngle = 0.95 * Math.PI;
    components.controls.enableDamping = true;
    components.controls.enablePan = false;
    components.controls.enabled = false;

    zoomRefFactor = 1 / components.controls.target.distanceTo(components.controls.object.position);

    // Debugger
    components.debugger = new dat.GUI({ width: window.innerWidth * 0.25 });

    const glRendererFolder = components.debugger.addFolder("Renderer");
    glRendererFolder.add(components.glRenderer, "toneMapping", {
        None: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    }).onFinishChange(() => {
        components.glRenderer.toneMapping = Number(components.glRenderer.toneMapping);
        updateMaterials();
    });
    glRendererFolder.add(components.glRenderer, "toneMappingExposure")
        .min(0)
        .max(10)
        .step(0.01);

    const lightFolder = components.debugger.addFolder("Lighting");
    const directionalLightFolder = lightFolder.addFolder("Directional Light");
    directionalLightFolder.addColor(lights.directionalLight, "color")
        .onChange(() => lights.directionalLight.source.color.set(lights.directionalLight.color));
    directionalLightFolder.add(lights.directionalLight.source, "intensity")
        .step(0.1);
    const directionalLightPositionFolder = directionalLightFolder.addFolder("position");
    directionalLightPositionFolder.add(lights.directionalLight.source.position, "x")
        .step(0.1);
    directionalLightPositionFolder.add(lights.directionalLight.source.position, "y")
        .step(0.1);
    directionalLightPositionFolder.add(lights.directionalLight.source.position, "z")
        .step(0.1);
    directionalLightFolder.add(lights.directionalLight.source.shadow, "bias")
        .step(0.001);
    directionalLightFolder.add(lights.directionalLight.source.shadow, "normalBias")
        .step(0.001);

    const secondDirectionalLightFolder = lightFolder.addFolder("Second Directional Light");
    secondDirectionalLightFolder.addColor(lights.secondDirectionalLight, "color")
        .onChange(() => lights.secondDirectionalLight.source.color.set(lights.secondDirectionalLight.color));
    secondDirectionalLightFolder.add(lights.secondDirectionalLight.source, "intensity")
        .step(0.1);
    const secondDirectionalLightPositionFolder = secondDirectionalLightFolder.addFolder("position");
    secondDirectionalLightPositionFolder.add(lights.secondDirectionalLight.source.position, "x")
        .step(0.1);
    secondDirectionalLightPositionFolder.add(lights.secondDirectionalLight.source.position, "y")
        .step(0.1);
    secondDirectionalLightPositionFolder.add(lights.secondDirectionalLight.source.position, "z")
        .step(0.1);
    const secondDirectionalLightRotationFolder = secondDirectionalLightFolder.addFolder("rotation");
    secondDirectionalLightRotationFolder.add(lights.secondDirectionalLight.source.rotation, "x")
        .step(0.1);
    secondDirectionalLightRotationFolder.add(lights.secondDirectionalLight.source.rotation, "y")
        .step(0.1);
    secondDirectionalLightRotationFolder.add(lights.secondDirectionalLight.source.rotation, "z")
        .step(0.1);

    const ambientLightFolder = lightFolder.addFolder("Ambient Light");
    ambientLightFolder.addColor(lights.ambientLight, "color")
        .onChange(() => lights.ambientLight.source.color.set(lights.ambientLight.color));
    ambientLightFolder.add(lights.ambientLight.source, "intensity")
        .step(0.1);

    const lampLightFolder = lightFolder.addFolder("Lamp Light");
    lampLightFolder.addColor(lights.lampLight, "color")
        .onChange(() => lights.lampLight.source.color.set(lights.lampLight.color));
    lampLightFolder.add(lights.lampLight.source, "intensity")
        .step(0.1);
    lampLightFolder.add(lights.lampLight.source, "distance")
        .step(0.1);
    lampLightFolder.add(lights.lampLight.source, "angle")
        .step(0.1);
    lampLightFolder.add(lights.lampLight.source, "penumbra")
        .step(0.1);
    lampLightFolder.add(lights.lampLight.source, "decay")
        .step(0.1);
    const lampLightPositionFolder = lampLightFolder.addFolder("position");
    lampLightPositionFolder.add(lights.lampLight.source.position, "x")
        .step(0.1);
    lampLightPositionFolder.add(lights.lampLight.source.position, "y")
        .step(0.1);
    lampLightPositionFolder.add(lights.lampLight.source.position, "z")
        .step(0.1);
    lampLightFolder.add(lights.lampLight.source.shadow, "focus")
        .step(0.1);
    lampLightFolder.add(lights.lampLight.source.shadow, "bias")
        .step(0.001);
    lampLightFolder.add(lights.lampLight.source.shadow, "normalBias")
        .step(0.001);
        
    const outlinePassFolder = components.debugger.addFolder("Outline Pass");
    outlinePassFolder.add(passes.params, "edgeStrength", 0.01, 10).onChange((value) => {
        passes.outlinePassSkinned.edgeStrength = Number(value);
        passes.outlinePassNonSkinned.edgeStrength = Number(value);
    });
    outlinePassFolder.add(passes.params, "edgeGlow", 0.0, 1).onChange((value) => {
        passes.outlinePassSkinned.edgeGlow = Number(value);
        passes.outlinePassNonSkinned.edgeGlow = Number(value);
    });
    outlinePassFolder.add(passes.params, "edgeThickness", 1, 4).onChange((value) => {
        passes.outlinePassSkinned.edgeThickness = Number(value);
        passes.outlinePassNonSkinned.edgeThickness = Number(value);
    });
    outlinePassFolder.add(passes.params, "pulsePeriod", 0.0, 5).onChange((value) => {
        passes.outlinePassSkinned.pulsePeriod = Number(value);
        passes.outlinePassNonSkinned.pulsePeriod = Number(value);
    });
    outlinePassFolder.add(passes.params, "usePatternTexture").onChange((value) => {
        passes.outlinePassSkinned.usePatternTexture = value;
        passes.outlinePassNonSkinned.usePatternTexture = value;
    });
    outlinePassFolder.addColor(passes.params, "visibleEdgeColor").onChange((value) => {
        passes.outlinePassSkinned.visibleEdgeColor.set(value);
        passes.outlinePassNonSkinned.visibleEdgeColor.set(value);
    });
    outlinePassFolder.addColor(passes.params, "hiddenEdgeColor").onChange((value) => {
        passes.outlinePassSkinned.hiddenEdgeColor.set(value);
        passes.outlinePassNonSkinned.hiddenEdgeColor.set(value);
    });

    const bloomPassFoler = components.debugger.addFolder("Bloom Pass");
    bloomPassFoler.add(passes.bloomPass, "enabled");
    bloomPassFoler.add(passes.bloomPass, "strength", 0, 2);
    bloomPassFoler.add(passes.bloomPass, "radius", 0, 2);
    bloomPassFoler.add(passes.bloomPass, "threshold", 0, 1);

    const bokehPassFolder = components.debugger.addFolder("Bokeh Pass");
    bokehPassFolder.add(passes.bokehPass, "enabled");
    bokehPassFolder.add(passes.params, "focus", 0, 5).onChange(() => passes.bokehPass.uniforms["focus"].value = passes.params.focus);
    bokehPassFolder.add(passes.params, "aperture", 0, 1).onChange(() => passes.bokehPass.uniforms["aperture"].value = passes.params.aperture);
    bokehPassFolder.add(passes.params, "maxblur", 0, 1).onChange(() => passes.bokehPass.uniforms["maxblur"].value = passes.params.maxblur);

    components.debugger.close();
    components.debugger.hide();

    // Pointer Movement / Touch Movement
    window.addEventListener("pointermove", (event) => {
        clearTimeout(mouseMoveTimeout);
        if (!hasStarted && loadingFinished && overlayMesh !== null) {
            gsap.to(overlayMesh.material.uniforms.u_mixAddFactor, { duration: 1, value: 0 });
            mouseMoveTimeout = setTimeout(() => {
                gsap.killTweensOf(overlayMesh.material.uniforms.u_mixAddFactor);
                gsap.to(overlayMesh.material.uniforms.u_mixAddFactor, { duration: 0.65, value: 1});
            }, 800);
        }
        else
            clearTimeout(mouseMoveTimeout);

        if (!window.mobileCheck())
            drag = true;
        else { // Interact with clickables if getting a double tap on mobile devices
            let currentTime = new Date().getTime();
            let tapLength = currentTime - lastTap;
            clearTimeout(tapTimeout);
            if (tapLength >= 200 || tapLength < 0) { // Single tap on mobile => no interaction
                drag = true;
                tapTimeout = setTimeout(function() {
                    drag = true;
                    clearTimeout(tapTimeout);
                }, 200);
            }
            lastTap = currentTime;
        }

        const mouseX = event.clientX / window.innerWidth;
        const mouseY = event.clientY / window.innerHeight;

        components.cursor.x = (mouseX - 0.5) * 2;
        components.cursor.y = -(mouseY - 0.5) * 2;

        if (overlayMesh !== null)
            gsap.to(overlayMesh.material.uniforms.u_mouse.value, { duration: 0.25, x: mouseX * 2 - 1, y: -mouseY * 2 + 1 });
        
        checkIntersections();
    });

    // Pointer Down / Touch Start
    document.addEventListener("pointerdown", () => {
        drag = false;

        if (instructionsHolder !== null) {
            setTimeout(() => instructionsHolder.setAttribute("class", "instructions"), 1500);
        }
    });  

    // Pointer Up / Touch End
    window.addEventListener("pointerup", () => {
        if (!drag && (intersected !== null || selected !== null))
            handleClick();
    });

    // Resizing
    window.addEventListener("resize", onWindowResize);
};

const update = () => {
    // stats.begin();

    if (overlayMesh !== null)
        overlayMesh.material.uniforms.u_time.value += 0.01;
    
    const time = performance.now();
    const deltaTime = (time - parameters.lastTime) * 0.001;

    components.controls?.update();
    components.animationMixer?.update(deltaTime);

    components.composer.render();
    components.cssRenderer.render(components.cssScene, components.camera.object);

    parameters.lastTime = time;
    window.requestAnimationFrame(update)
    
    // stats.end();
};

const checkIntersections = () => {
    if (!hasStarted)
        return;

    if (selected === null) {
        components.raycaster.setFromCamera(components.cursor, components.camera.object);

        const clickableIntersections = components.raycaster.intersectObjects(Array.from(clickables.values()), true);

        if (clickableIntersections.length > 0) {
            document.body.style.cursor = "pointer";
            const clickableIntersection = clickableIntersections[0];
            intersected = clickableIntersection.object;
            if (intersected instanceof THREE.SkinnedMesh) {
                passes.outlinePassSkinned.selectedObjects = [intersected];
                passes.outlinePassNonSkinned.selectedObjects = [];
            }
            else {
                passes.outlinePassNonSkinned.selectedObjects = [intersected];
                passes.outlinePassSkinned.selectedObjects = [];
            } 
        }
        else {
            document.body.style.cursor = "default";
            passes.outlinePassSkinned.selectedObjects = [];
            passes.outlinePassNonSkinned.selectedObjects = [];
            intersected = null;
        }
    }
    else {
        if (canReturnSelected && selected.object.name === "Folder" && (folderSkinned.currentPage > 1 || (folderSkinned.currentPage === 1 && components.cursor.x >= 0)) && (folderSkinned.currentPage <= MAX_PAGE_COUNT || (folderSkinned.currentPage === MAX_PAGE_COUNT + 1 && components.cursor.x < 0)))
            document.body.style.cursor = "grab";
        else
            document.body.style.cursor = "pointer";
        
        passes.outlinePassSkinned.selectedObjects = [];
        passes.outlinePassNonSkinned.selectedObjects = [];
        intersected = null;
    }
};

const handleClick = () => {
    if (selected === null) {
        if (intersected.name === "Paper_Holder" || intersected.name === "Folder") {
            sounds.itemSelect.play();
            selected = {
                object: intersected,
                originalPosition: new THREE.Vector3().copy(intersected.position),
                originalRotation: new THREE.Euler().copy(intersected.rotation),
                originalQuaternion: new THREE.Quaternion().copy(intersected.quaternion)
            };
            checkIntersections();

            const zoom = components.controls.target.distanceTo(components.controls.object.position);
            const zoomFactor = Math.pow(zoom * zoomRefFactor, 1.325) - 0.09 * (1 / zoom);
            const targetDistance = 1.175;
            const target = new THREE.Vector3(0, targetDistance * 0.029, targetDistance * 2.1);
            if (selected.object.name === "Folder") {
                target.y *= 0.25;
                target.z *= 0.94;
            }

            target.multiplyScalar(zoomFactor);
            target.applyMatrix4(components.camera.object.matrixWorld);
            components.controls.dampingFactor = 0;
            components.controls.update();
            components.controls.enabled = false;
            let lastProgress = 0;
            let tween = gsap.to(selected.object.position, { duration: 0.75, x: target.x, y: target.y, z: target.z, onStart: () => {
                selected.object.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI * 0.21));
            }, onUpdate: () => {
                const currentProgress = tween.progress();
                if (selected.object.name !== "Folder") {
                    passes.bokehPass.uniforms["focus"].value = lerp(passes.params.focus, passes.alternativeBokehParams.focus, currentProgress);
                    passes.bokehPass.uniforms["aperture"].value = lerp(passes.params.aperture, passes.alternativeBokehParams.aperture, currentProgress);
                    passes.bokehPass.uniforms["maxblur"].value = lerp(passes.params.maxblur, passes.alternativeBokehParams.maxblur, currentProgress);
                }
                
                selected.object.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI * 0.29 * (currentProgress - lastProgress)));
                lastProgress = currentProgress;

                selected.object.lookAt(target);
            }, onComplete: () => {
                if (selected.object.name === "Folder") {
                    folderSkinned.object.parent.position.copy(selected.object.position);
                    folderSkinned.object.parent.rotation.copy(selected.object.rotation);
                    folderSkinned.object.parent.rotateX(Math.PI * 0.5);

                    folderSkinned.object.visible = true;
                    selected.object.visible = false;
                }

                canReturnSelected = true;
            }});
        }
        else if (intersected.name === "Laptop" || intersected.name === "Monitor") {
            sounds.itemSelect.play();

            selected = {
                object: intersected,
                originalPosition: new THREE.Vector3().copy(intersected.position),
                originalRotation: new THREE.Euler().copy(intersected.rotation),
                originalQuaternion: new THREE.Quaternion().copy(intersected.quaternion)
            };
            checkIntersections();
            const targetDistance = 1;
            
            let target = null;
            let xOffset = 0;
            let yOffset = 0;
            if (selected.object.name === "Laptop") {
                target = new THREE.Vector3(0, -targetDistance * 0.065, -targetDistance * 0.75);
                yOffset = 0.1395;
                components.cssScene.remove(cssObjectWindows);
            }
            else {
                target = new THREE.Vector3(0.01, targetDistance * 0.075, targetDistance * 0.09);
                xOffset = -0.36;
                yOffset = 0.075;
            }

            components.glRenderer.domElement.style.zIndex = -1;

            components.camera.originalPosition = new THREE.Vector3().copy(components.camera.object.position);

            target.applyMatrix4(selected.object.matrixWorld);
            components.controls.target = target;
            components.controls.minDistance = 0.1;
            components.controls.enabled = false;
            components.controls.update();

            gsap.to(components.camera.object.position, { duration: 1.25, x: target.x + xOffset, y: target.y + yOffset, z: -target.z, onComplete: () => {
                canReturnCamera = true;
            }});
        }
        else if (intersected.name == "Lamp") {
            sounds.itemSelect.play();
            lights.lampLight.enabled = !lights.lampLight.enabled;
            if (lights.lampLight.enabled) {
                components.glScene.remove(lampFace);
                lights.lampLight.source.intensity = 5;
            }
            else {
                lights.lampLight.source.intensity = 0;
                components.glScene.add(lampFace);
            }
            components.glScene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
                    child.material.needsUpdate = true;
            });
        }
        else if (intersected instanceof THREE.SkinnedMesh) {
            components.glRenderer.shadowMap.autoUpdate = true;
            components.glRenderer.shadowMap.needsUpdate = true;
            let action = null;
            let toPull;
            switch (intersected.name) {
                case "Top_Drawer": {
                    action = components.animationMixer.clipAction(deskAnimations[1]);
                    toPull = 1;
                    break;
                };
                case "Bottom_Drawer": {
                    action = components.animationMixer.clipAction(deskAnimations[2]);
                    toPull = -1;
                    break;
                }
                case "Bottom_Desk": {
                    action = components.animationMixer.clipAction(deskAnimations[3]);
                    toPull = -1;
                    break;
                }
            }
            if (action !== null) {
                let reverseFactor = animables.get(intersected.name).reverseFactor;
                toPull *= reverseFactor;
                if (toPull > 0)
                    sounds.woodPull.play();
                else
                    sounds.woodPush.play();
                if (reverseFactor > 0) {
                    action.reset();
                    action.setLoop(THREE.LoopOnce, 1);
                    action.clampWhenFinished = true;
                    action.timeScale = 1;
                    action.play();
                }
                else {
                    action.timeScale = -1;
                    action.paused = false;
                }
                animables.set(intersected.name, { reverseFactor: -reverseFactor });
            }
            shadowUpdateTimeout = setTimeout(() => { // Only update shadow for the length of the animation
                clearTimeout(shadowUpdateTimeout);
                components.glRenderer.shadowMap.autoUpdate = false;
                components.glRenderer.shadowMap.needsUpdate = true;
            }, 500);
        }
    }
    else if (canReturnSelected) {
        if (selected.object.name === "Folder" && (folderSkinned.currentPage <= MAX_PAGE_COUNT || (folderSkinned.currentPage > MAX_PAGE_COUNT && components.cursor.x < 0)) && (folderSkinned.currentPage > 1 || (folderSkinned.currentPage === 1 && components.cursor.x >= 0))) {
            if (folderSkinned.canFlipPage) {
                folderSkinned.canFlipPage = false;
                sounds.pageFlip.play();
                let reverseFactor = 1;
                if (components.cursor.x < 0)
                    reverseFactor *= -1;
                animables.set(folderSkinned.object.name, reverseFactor);

                let action = components.animationMixer.clipAction(deskAnimations[0]);
                action.timeScale = 0.9 * reverseFactor;
                if (folderSkinned.currentPage === 1) {
                    action.setLoop(THREE.LoopOnce, 1);
                    action.clampWhenFinished = true;
                    action.reset();
                    action.play();
                }
                else
                    action.paused = false;

                folderSkinned.currentPage += 1 * reverseFactor;

                document.body.style.cursor = "grabbing";
                setTimeout(() => {
                    checkIntersections();
                    action.paused = true;
                    folderSkinned.canFlipPage = true;
                }, 590);
            }
        }
        else {
            sounds.itemSelect.play();
            const target = selected.originalPosition;

            let tween = gsap.to(selected.object.position, { duration: 1, x: target.x, y: target.y, z: target.z,
                onStart: () => {
                    canReturnSelected = false;
                    selected.object.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI * -0.5));
                    selected.object.rotation.copy(selected.originalRotation);

                    if (selected.object.name === "Folder") {
                        selected.object.visible = true;
                        folderSkinned.object.visible = false;
                    }
                }, onUpdate: () => {
                    const currentProgress = tween.progress();
                    passes.bokehPass.uniforms["focus"].value = lerp(passes.alternativeBokehParams.focus, passes.params.focus, currentProgress);
                    passes.bokehPass.uniforms["aperture"].value = lerp(passes.alternativeBokehParams.aperture, passes.params.aperture, currentProgress);
                    passes.bokehPass.uniforms["maxblur"].value = lerp(passes.alternativeBokehParams.maxblur, passes.params.maxblur, currentProgress);
                }, onComplete: () => {
                    if (folderSkinned.currentPage === 0 || folderSkinned.currentPage === MAX_PAGE_COUNT + 1) {
                        folderSkinned.currentPage = 1;
                        let action = components.animationMixer.clipAction(deskAnimations[0]);
                        action.reset();
                        action.paused = true;
                    }

                    selected = null;
                    components.controls.dampingFactor = 0.05;
                    components.controls.enabled = true;
                    components.controls.update();
                }
            });
        }
    }
    else if (canReturnCamera) {
        sounds.itemSelect.play();
        components.controls.target = new THREE.Vector3(0, 0, 0);
        const pos = components.camera.originalPosition;
        gsap.to(components.camera.object.position, { duration: 1.5, x: pos.x, y: pos.y, z: pos.z, onStart: () => {
            components.glRenderer.domElement.style.zIndex = 0;
            canReturnCamera = false;
        }, onComplete: () => {
            if (selected.object.name === "Laptop")
                components.cssScene.add(cssObjectWindows);
            
            selected = null;
            components.controls.minDistance = 3;
            components.controls.enabled = true;
            components.controls.update();
        }});
    }
};

const lerp = (start, end, amount) => {
    return (1 - amount) * start + amount * end;
}

initialize().then(() => {
    update();   
});
