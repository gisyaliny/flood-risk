import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Global variables
let camera, scene, renderer;
let controls, sun;
let house;
let floodLayers = {};
let terrain;

const loader = new GLTFLoader();

// FEMA Flood Risk Levels with realistic depths (in feet) - sorted by name
const FLOOD_LEVELS = {
  '10': { depth: 2, color: 0x5DADE2, name: '10-Year Flood', active: true },
  '25': { depth: 4, color: 0x52BE80, name: '25-Year Flood', active: true },
  '50': { depth: 6, color: 0xF39C12, name: '50-Year Flood', active: true },
  '100': { depth: 8, color: 0xE67E22, name: '100-Year Flood', active: true },
  '200': { depth: 12, color: 0xE74C3C, name: '200-Year Flood', active: true },
  '500': { depth: 16, color: 0x8E44AD, name: '500-Year Flood', active: true }
};

// Convert feet to Three.js units (assuming 1 unit = 1 foot)
function feetToUnits(feet) {
  return feet;
}

// House class to manage the house in the scene
class House {
  constructor() {
    this.createHouse();
  }

  createHouse() {
    this.houseGroup = new THREE.Group();
    
    // Create a realistic American two-story house
    this.createFoundation();
    this.createMainStructure();
    this.createSecondFloor();
    this.createRoof();
    this.createGarage();
    this.createFrontPorch();
    this.createWindows();
    this.createDoors();
    this.createChimney();
    this.createLandscaping();

    scene.add(this.houseGroup);
  }

  createFoundation() {
    // Concrete foundation with basement
    const foundationGeometry = new THREE.BoxGeometry(32, 2, 24);
    const foundationMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.set(0, 1, 0);
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    this.houseGroup.add(foundation);

    // Foundation walls (visible part)
    const wallHeight = 1.5;
    const foundationWallGeometry = new THREE.BoxGeometry(32, wallHeight, 0.5);
    const foundationWallMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    
    // Front foundation wall
    const frontFoundationWall = new THREE.Mesh(foundationWallGeometry, foundationWallMaterial);
    frontFoundationWall.position.set(0, wallHeight/2, 12);
    frontFoundationWall.castShadow = true;
    this.houseGroup.add(frontFoundationWall);
    
    // Back foundation wall
    const backFoundationWall = new THREE.Mesh(foundationWallGeometry, foundationWallMaterial);
    backFoundationWall.position.set(0, wallHeight/2, -12);
    backFoundationWall.castShadow = true;
    this.houseGroup.add(backFoundationWall);
    
    // Side foundation walls
    const sideFoundationWallGeometry = new THREE.BoxGeometry(0.5, wallHeight, 24);
    const leftFoundationWall = new THREE.Mesh(sideFoundationWallGeometry, foundationWallMaterial);
    leftFoundationWall.position.set(-16, wallHeight/2, 0);
    leftFoundationWall.castShadow = true;
    this.houseGroup.add(leftFoundationWall);
    
    const rightFoundationWall = new THREE.Mesh(sideFoundationWallGeometry, foundationWallMaterial);
    rightFoundationWall.position.set(16, wallHeight/2, 0);
    rightFoundationWall.castShadow = true;
    this.houseGroup.add(rightFoundationWall);
  }

  createMainStructure() {
    // First floor main structure (typical American colonial style)
    const mainGeometry = new THREE.BoxGeometry(30, 9, 22);
    const sidingMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC }); // Beige siding
    const firstFloor = new THREE.Mesh(mainGeometry, sidingMaterial);
    firstFloor.position.set(0, 6.5, 0);
    firstFloor.castShadow = true;
    firstFloor.receiveShadow = true;
    this.houseGroup.add(firstFloor);

    // Add horizontal siding texture effect
    for (let i = 0; i < 8; i++) {
      const sidingLine = new THREE.BoxGeometry(30.2, 0.1, 22.2);
      const sidingLineMaterial = new THREE.MeshLambertMaterial({ color: 0xE5E5CC });
      const line = new THREE.Mesh(sidingLine, sidingLineMaterial);
      line.position.set(0, 3 + i * 1.2, 0);
      this.houseGroup.add(line);
    }
  }

  createSecondFloor() {
    // Second floor
    const secondFloorGeometry = new THREE.BoxGeometry(30, 8, 22);
    const sidingMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
    const secondFloor = new THREE.Mesh(secondFloorGeometry, sidingMaterial);
    secondFloor.position.set(0, 15, 0);
    secondFloor.castShadow = true;
    secondFloor.receiveShadow = true;
    this.houseGroup.add(secondFloor);

    // Second floor siding lines
    for (let i = 0; i < 7; i++) {
      const sidingLine = new THREE.BoxGeometry(30.2, 0.1, 22.2);
      const sidingLineMaterial = new THREE.MeshLambertMaterial({ color: 0xE5E5CC });
      const line = new THREE.Mesh(sidingLine, sidingLineMaterial);
      line.position.set(0, 11.5 + i * 1.2, 0);
      this.houseGroup.add(line);
    }

    // Dormers for second floor
    this.createDormers();
  }

  createDormers() {
    // Left dormer
    const dormerGeometry = new THREE.BoxGeometry(6, 5, 4);
    const dormerMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
    
    const leftDormer = new THREE.Mesh(dormerGeometry, dormerMaterial);
    leftDormer.position.set(-8, 17, 13);
    leftDormer.castShadow = true;
    this.houseGroup.add(leftDormer);
    
    // Right dormer
    const rightDormer = new THREE.Mesh(dormerGeometry, dormerMaterial);
    rightDormer.position.set(8, 17, 13);
    rightDormer.castShadow = true;
    this.houseGroup.add(rightDormer);

    // Dormer roofs
    const dormerRoofGeometry = new THREE.ConeGeometry(4, 3, 3);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    
    const leftDormerRoof = new THREE.Mesh(dormerRoofGeometry, roofMaterial);
    leftDormerRoof.position.set(-8, 21, 13);
    leftDormerRoof.rotation.y = Math.PI;
    leftDormerRoof.castShadow = true;
    this.houseGroup.add(leftDormerRoof);
    
    const rightDormerRoof = new THREE.Mesh(dormerRoofGeometry, roofMaterial);
    rightDormerRoof.position.set(8, 21, 13);
    rightDormerRoof.rotation.y = Math.PI;
    rightDormerRoof.castShadow = true;
    this.houseGroup.add(rightDormerRoof);
  }

  createRoof() {
    // Main gabled roof (typical American style)
    const roofGeometry = new THREE.BoxGeometry(34, 6, 26);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 }); // Dark brown shingles
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 22, 0);
    roof.rotation.x = Math.PI / 6; // Pitched roof
    roof.castShadow = true;
    this.houseGroup.add(roof);

    // Ridge line
    const ridgeGeometry = new THREE.BoxGeometry(36, 0.5, 1);
    const ridgeMaterial = new THREE.MeshLambertMaterial({ color: 0x4A2C2A });
    const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
    ridge.position.set(0, 24.5, 0);
    ridge.castShadow = true;
    this.houseGroup.add(ridge);

    // Gutters
    const gutterGeometry = new THREE.BoxGeometry(32, 0.3, 0.5);
    const gutterMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    
    const frontGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
    frontGutter.position.set(0, 18.5, 11.5);
    this.houseGroup.add(frontGutter);
    
    const backGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
    backGutter.position.set(0, 18.5, -11.5);
    this.houseGroup.add(backGutter);
  }

  createGarage() {
    // Attached two-car garage
    const garageGeometry = new THREE.BoxGeometry(20, 8, 20);
    const garageMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
    const garage = new THREE.Mesh(garageGeometry, garageMaterial);
    garage.position.set(-25, 6, 0);
    garage.castShadow = true;
    garage.receiveShadow = true;
    this.houseGroup.add(garage);

    // Garage roof
    const garageRoofGeometry = new THREE.BoxGeometry(22, 3, 22);
    const garageRoof = new THREE.Mesh(garageRoofGeometry, new THREE.MeshLambertMaterial({ color: 0x654321 }));
    garageRoof.position.set(-25, 12, 0);
    garageRoof.castShadow = true;
    this.houseGroup.add(garageRoof);

    // Garage doors
    const garageDoorGeometry = new THREE.BoxGeometry(8, 7, 0.2);
    const garageDoorMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    
    const leftGarageDoor = new THREE.Mesh(garageDoorGeometry, garageDoorMaterial);
    leftGarageDoor.position.set(-29, 5.5, 10.1);
    this.houseGroup.add(leftGarageDoor);
    
    const rightGarageDoor = new THREE.Mesh(garageDoorGeometry, garageDoorMaterial);
    rightGarageDoor.position.set(-21, 5.5, 10.1);
    this.houseGroup.add(rightGarageDoor);

    // Garage door panels (decorative)
    for (let door = 0; door < 2; door++) {
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
          const panelGeometry = new THREE.BoxGeometry(2.4, 1.5, 0.1);
          const panelMaterial = new THREE.MeshLambertMaterial({ color: 0xF0F0F0 });
          const panel = new THREE.Mesh(panelGeometry, panelMaterial);
          panel.position.set(-29 + door * 8 + col * 2.6, 1.5 + row * 1.7, 10.15);
          this.houseGroup.add(panel);
        }
      }
    }
  }

  createFrontPorch() {
    // Traditional American front porch
    const porchFloorGeometry = new THREE.BoxGeometry(16, 0.5, 6);
    const porchFloorMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C }); // Wood color
    const porchFloor = new THREE.Mesh(porchFloorGeometry, porchFloorMaterial);
    porchFloor.position.set(0, 2.75, 14);
    porchFloor.castShadow = true;
    porchFloor.receiveShadow = true;
    this.houseGroup.add(porchFloor);

    // Porch steps
    for (let i = 0; i < 3; i++) {
      const stepGeometry = new THREE.BoxGeometry(16, 0.3, 1.5);
      const step = new THREE.Mesh(stepGeometry, porchFloorMaterial);
      step.position.set(0, 1.5 + i * 0.4, 17.5 + i * 0.7);
      step.castShadow = true;
      step.receiveShadow = true;
      this.houseGroup.add(step);
    }

    // Porch columns
    const columnGeometry = new THREE.CylinderGeometry(0.4, 0.4, 8, 8);
    const columnMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    
    for (let i = 0; i < 4; i++) {
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      column.position.set(-6 + i * 4, 7, 14);
      column.castShadow = true;
      this.houseGroup.add(column);
    }

    // Porch ceiling
    const porchCeilingGeometry = new THREE.BoxGeometry(16, 0.3, 6);
    const porchCeilingMaterial = new THREE.MeshLambertMaterial({ color: 0xF0F8FF });
    const porchCeiling = new THREE.Mesh(porchCeilingGeometry, porchCeilingMaterial);
    porchCeiling.position.set(0, 11, 14);
    porchCeiling.castShadow = true;
    this.houseGroup.add(porchCeiling);

    // Porch railings
    const railingGeometry = new THREE.BoxGeometry(16, 1, 0.2);
    const railingMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const railing = new THREE.Mesh(railingGeometry, railingMaterial);
    railing.position.set(0, 4, 17);
    this.houseGroup.add(railing);

    // Railing spindles
    for (let i = 0; i < 15; i++) {
      const spindleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
      const spindle = new THREE.Mesh(spindleGeometry, railingMaterial);
      spindle.position.set(-7 + i * 1, 3.5, 17);
      this.houseGroup.add(spindle);
    }
  }

  createWindows() {
    const windowFrameMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const windowGlassMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x87CEEB, 
      transparent: true, 
      opacity: 0.3 
    });

    // First floor windows
    this.createWindow(-10, 6, 11.1, 3, 4, windowFrameMaterial, windowGlassMaterial); // Left front
    this.createWindow(10, 6, 11.1, 3, 4, windowFrameMaterial, windowGlassMaterial);  // Right front
    this.createWindow(-15.1, 6, 5, 3, 4, windowFrameMaterial, windowGlassMaterial, true); // Left side
    this.createWindow(15.1, 6, -5, 3, 4, windowFrameMaterial, windowGlassMaterial, true); // Right side
    this.createWindow(-8, 6, -11.1, 2.5, 3, windowFrameMaterial, windowGlassMaterial); // Back left
    this.createWindow(8, 6, -11.1, 2.5, 3, windowFrameMaterial, windowGlassMaterial);  // Back right

    // Second floor windows
    this.createWindow(-10, 15, 11.1, 2.5, 3.5, windowFrameMaterial, windowGlassMaterial); // Left front
    this.createWindow(10, 15, 11.1, 2.5, 3.5, windowFrameMaterial, windowGlassMaterial);  // Right front
    this.createWindow(-15.1, 15, 5, 2.5, 3.5, windowFrameMaterial, windowGlassMaterial, true); // Left side
    this.createWindow(15.1, 15, -5, 2.5, 3.5, windowFrameMaterial, windowGlassMaterial, true); // Right side

    // Dormer windows
    this.createWindow(-8, 17, 15.1, 2, 2.5, windowFrameMaterial, windowGlassMaterial); // Left dormer
    this.createWindow(8, 17, 15.1, 2, 2.5, windowFrameMaterial, windowGlassMaterial);  // Right dormer

    // Garage window
    this.createWindow(-25, 8, 10.1, 2, 2, windowFrameMaterial, windowGlassMaterial); // Garage side window
  }

  createWindow(x, y, z, width, height, frameMaterial, glassMaterial, isSide = false) {
    // Window frame
    const frameThickness = 0.2;
    const frameGeometry = new THREE.BoxGeometry(
      isSide ? frameThickness : width + 0.4, 
      height + 0.4, 
      isSide ? width + 0.4 : frameThickness
    );
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(x, y, z);
    this.houseGroup.add(frame);

    // Window glass
    const glassGeometry = new THREE.BoxGeometry(
      isSide ? frameThickness/2 : width, 
      height, 
      isSide ? width : frameThickness/2
    );
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.set(x, y, z);
    this.houseGroup.add(glass);

    // Window dividers (mullions)
    const dividerMaterial = new THREE.MeshLambertMaterial({ color: 0xDDDDDD });
    
    // Horizontal divider
    const hDividerGeometry = new THREE.BoxGeometry(
      isSide ? frameThickness/3 : width, 
      0.1, 
      isSide ? width : frameThickness/3
    );
    const hDivider = new THREE.Mesh(hDividerGeometry, dividerMaterial);
    hDivider.position.set(x, y, z);
    this.houseGroup.add(hDivider);

    // Vertical divider
    const vDividerGeometry = new THREE.BoxGeometry(
      isSide ? frameThickness/3 : 0.1, 
      height, 
      isSide ? 0.1 : frameThickness/3
    );
    const vDivider = new THREE.Mesh(vDividerGeometry, dividerMaterial);
    vDivider.position.set(x, y, z);
    this.houseGroup.add(vDivider);
  }

  createDoors() {
    // Front door
    const frontDoorGeometry = new THREE.BoxGeometry(3, 7, 0.3);
    const frontDoorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown wood
    const frontDoor = new THREE.Mesh(frontDoorGeometry, frontDoorMaterial);
    frontDoor.position.set(0, 5.5, 11.15);
    this.houseGroup.add(frontDoor);

    // Door panels
    for (let row = 0; row < 2; row++) {
      const panelGeometry = new THREE.BoxGeometry(2.4, 2.8, 0.1);
      const panelMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      panel.position.set(0, 4 + row * 3.2, 11.2);
      this.houseGroup.add(panel);
    }

    // Door handle
    const handleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 }); // Gold
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(1.2, 5.5, 11.3);
    this.houseGroup.add(handle);

    // Side lights (decorative glass panels next to door)
    const sideLightGeometry = new THREE.BoxGeometry(0.8, 6, 0.2);
    const sideLightMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x87CEEB, 
      transparent: true, 
      opacity: 0.4 
    });
    
    const leftSideLight = new THREE.Mesh(sideLightGeometry, sideLightMaterial);
    leftSideLight.position.set(-2.2, 5.5, 11.1);
    this.houseGroup.add(leftSideLight);
    
    const rightSideLight = new THREE.Mesh(sideLightGeometry, sideLightMaterial);
    rightSideLight.position.set(2.2, 5.5, 11.1);
    this.houseGroup.add(rightSideLight);
  }

  createChimney() {
    // Brick chimney
    const chimneyGeometry = new THREE.BoxGeometry(3, 12, 3);
    const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 }); // Dark red brick
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(12, 27, -5);
    chimney.castShadow = true;
    this.houseGroup.add(chimney);

    // Chimney cap
    const capGeometry = new THREE.BoxGeometry(4, 0.5, 4);
    const capMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.set(12, 33.5, -5);
    cap.castShadow = true;
    this.houseGroup.add(cap);
  }

  createLandscaping() {
    // Front yard bushes
    for (let i = 0; i < 6; i++) {
      const bushGeometry = new THREE.SphereGeometry(1 + Math.random() * 0.5, 8, 6);
      const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      bush.position.set(-12 + i * 5, 1.5, 20 + Math.random() * 3);
      bush.scale.y = 0.6;
      bush.castShadow = true;
      this.houseGroup.add(bush);
    }

    // Driveway
    const drivewayGeometry = new THREE.BoxGeometry(12, 0.2, 25);
    const drivewayMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Dark gray
    const driveway = new THREE.Mesh(drivewayGeometry, drivewayMaterial);
    driveway.position.set(-25, 0.1, 12);
    driveway.receiveShadow = true;
    this.houseGroup.add(driveway);

    // Walkway to front door
    const walkwayGeometry = new THREE.BoxGeometry(4, 0.2, 15);
    const walkwayMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 }); // Slate gray
    const walkway = new THREE.Mesh(walkwayGeometry, walkwayMaterial);
    walkway.position.set(0, 0.1, 22);
    walkway.receiveShadow = true;
    this.houseGroup.add(walkway);
  }
}

function createTerrain() {
  // Create ground plane with realistic grass texture
  const terrainGeometry = new THREE.PlaneGeometry(10000, 10000);
  const terrainMaterial = new THREE.MeshLambertMaterial({ color: 0x8FBC8F });
  
  terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -1;
  terrain.receiveShadow = true;
  scene.add(terrain);
}

function createFloodLayers() {
  // Load the original water normals texture for authentic water effects
  const waterNormals = new THREE.TextureLoader().load('assets/waternormals.jpg', function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  });

  Object.keys(FLOOD_LEVELS).forEach(level => {
    const floodData = FLOOD_LEVELS[level];
    // Large water surface
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    
    const water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: floodData.color,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      }
    );

    water.rotation.x = -Math.PI / 2;
    water.position.y = floodData.depth - 1; // Adjust for terrain level
    water.material.transparent = true;
    water.material.opacity = 0.6 + (floodData.depth * 0.015); // More realistic transparency
    
    floodLayers[level] = water;
    scene.add(water);
  });
}

// Initialize flood level control UI
function createFloodControls() {
  const controlsDiv = document.createElement('div');
  controlsDiv.style.position = 'absolute';
  controlsDiv.style.top = '20px';
  controlsDiv.style.left = '20px';
  controlsDiv.style.background = 'rgba(0, 0, 0, 0.85)';
  controlsDiv.style.color = 'white';
  controlsDiv.style.padding = '25px';
  controlsDiv.style.borderRadius = '12px';
  controlsDiv.style.fontFamily = 'Arial, sans-serif';
  controlsDiv.style.zIndex = '1000';
  controlsDiv.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
  controlsDiv.style.border = '2px solid rgba(255, 255, 255, 0.1)';
  controlsDiv.style.minWidth = '300px';
  controlsDiv.style.maxHeight = '80vh';
  controlsDiv.style.overflowY = 'auto';

  const title = document.createElement('h2');
  title.textContent = 'FEMA Flood Risk Levels';
  title.style.margin = '0 0 20px 0';
  title.style.fontSize = '20px';
  title.style.color = '#87CEEB';
  title.style.textAlign = 'center';
  title.style.borderBottom = '2px solid #87CEEB';
  title.style.paddingBottom = '10px';

  controlsDiv.appendChild(title);

  // Create flood level controls in sorted order
  const sortedLevels = Object.keys(FLOOD_LEVELS).sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  sortedLevels.forEach(level => {
    const floodData = FLOOD_LEVELS[level];
    
    const levelDiv = document.createElement('div');
    levelDiv.style.display = 'flex';
    levelDiv.style.alignItems = 'center';
    levelDiv.style.marginBottom = '15px';
    levelDiv.style.padding = '10px';
    levelDiv.style.borderRadius = '8px';
    levelDiv.style.background = 'rgba(255, 255, 255, 0.05)';
    levelDiv.style.border = '1px solid rgba(255, 255, 255, 0.1)';

    // Color indicator
    const colorIndicator = document.createElement('div');
    colorIndicator.style.width = '20px';
    colorIndicator.style.height = '20px';
    colorIndicator.style.borderRadius = '50%';
    colorIndicator.style.backgroundColor = `#${floodData.color.toString(16).padStart(6, '0')}`;
    colorIndicator.style.marginRight = '12px';
    colorIndicator.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    colorIndicator.style.flexShrink = '0';

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `flood-${level}`;
    checkbox.checked = floodData.active;
    checkbox.style.marginRight = '10px';
    checkbox.style.transform = 'scale(1.2)';

    // Label and info
    const labelContainer = document.createElement('div');
    labelContainer.style.flex = '1';
    
    const label = document.createElement('label');
    label.htmlFor = `flood-${level}`;
    label.textContent = floodData.name;
    label.style.fontWeight = 'bold';
    label.style.fontSize = '14px';
    label.style.display = 'block';
    label.style.cursor = 'pointer';

    const depthInfo = document.createElement('div');
    depthInfo.textContent = `${floodData.depth} feet deep`;
    depthInfo.style.fontSize = '12px';
    depthInfo.style.color = '#ccc';
    depthInfo.style.marginTop = '2px';

    labelContainer.appendChild(label);
    labelContainer.appendChild(depthInfo);

    levelDiv.appendChild(colorIndicator);
    levelDiv.appendChild(checkbox);
    levelDiv.appendChild(labelContainer);

    // Add event listener
    checkbox.addEventListener('change', (e) => {
      toggleFloodLevel(level, e.target.checked);
      updateFloodImpactInfo();
    });

    controlsDiv.appendChild(levelDiv);
  });

  // Add impact information
  const infoDiv = document.createElement('div');
  infoDiv.style.marginTop = '20px';
  infoDiv.style.padding = '15px';
  infoDiv.style.background = 'rgba(135, 206, 235, 0.1)';
  infoDiv.style.borderRadius = '8px';
  infoDiv.style.border = '1px solid rgba(135, 206, 235, 0.3)';

  const infoTitle = document.createElement('h4');
  infoTitle.textContent = 'Current Flood Impact';
  infoTitle.style.margin = '0 0 10px 0';
  infoTitle.style.color = '#87CEEB';
  infoTitle.style.fontSize = '14px';

  const impactInfo = document.createElement('div');
  impactInfo.id = 'flood-impact';
  impactInfo.style.fontSize = '12px';
  impactInfo.style.lineHeight = '1.4';

  infoDiv.appendChild(infoTitle);
  infoDiv.appendChild(impactInfo);
  controlsDiv.appendChild(infoDiv);

  // Instructions
  const instructions = document.createElement('div');
  instructions.style.marginTop = '15px';
  instructions.style.fontSize = '11px';
  instructions.style.color = '#999';
  instructions.style.textAlign = 'center';
  instructions.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
  instructions.style.paddingTop = '10px';
  instructions.innerHTML = 'Use mouse to orbit • Wheel to zoom<br>Toggle flood levels to see impact';

  controlsDiv.appendChild(instructions);
  document.body.appendChild(controlsDiv);

  // Update initial impact info
  updateFloodImpactInfo();
}

function toggleFloodLevel(level, visible) {
  FLOOD_LEVELS[level].active = visible;
  if (floodLayers[level]) {
    floodLayers[level].visible = visible;
  }
}

function updateFloodImpactInfo() {
  const impactDiv = document.getElementById('flood-impact');
  if (!impactDiv) return;

  const activeLevels = Object.keys(FLOOD_LEVELS)
    .filter(level => FLOOD_LEVELS[level].active)
    .sort((a, b) => parseInt(a) - parseInt(b));

  if (activeLevels.length === 0) {
    impactDiv.innerHTML = '<span style="color: #00ff00;">No flood risk displayed</span>';
    return;
  }

  const maxLevel = activeLevels[activeLevels.length - 1];
  const maxDepth = FLOOD_LEVELS[maxLevel].depth;

  let impactText = '';
  let impactColor = '#00ff00';

  if (maxDepth <= 2) {
    impactText = 'Minimal flooding - Yard and foundation affected';
    impactColor = '#ffff00';
  } else if (maxDepth <= 4) {
    impactText = 'Basement flooding - Utilities at risk';
    impactColor = '#ffa500';
  } else if (maxDepth <= 6) {
    impactText = 'First floor flooding - Evacuation recommended';
    impactColor = '#ff8800';
  } else if (maxDepth <= 8) {
    impactText = 'Severe flooding - Second floor access needed';
    impactColor = '#ff4400';
  } else if (maxDepth <= 12) {
    impactText = 'Major flooding - Structure heavily damaged';
    impactColor = '#ff0000';
  } else {
    impactText = 'Catastrophic flooding - Total property loss';
    impactColor = '#8b0000';
  }

  impactDiv.innerHTML = `
    <div style="color: ${impactColor}; font-weight: bold;">${impactText}</div>
    <div style="margin-top: 5px; color: #ccc;">
      Maximum depth: ${maxDepth} feet<br>
      Active levels: ${activeLevels.length} of ${Object.keys(FLOOD_LEVELS).length}
    </div>
  `;
}

init();
animate();

async function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5; // Better exposure for realistic lighting
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(30, 30, 100);

  sun = new THREE.Vector3();

  // Create terrain
  createTerrain();

  // Enhanced lighting setup for realistic water effects
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // Reduced ambient light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
  directionalLight.position.set(200, 200, 100);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 4096;
  directionalLight.shadow.mapSize.height = 4096;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 1000;
  directionalLight.shadow.camera.left = -500;
  directionalLight.shadow.camera.right = 500;
  directionalLight.shadow.camera.top = 500;
  directionalLight.shadow.camera.bottom = -500;
  scene.add(directionalLight);

  // Skybox with better parameters for realistic lighting
  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 2;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;

  const parameters = {
    elevation: 20, // Higher sun for better water reflections
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  let renderTarget;

  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);

    if (renderTarget !== undefined) renderTarget.dispose();
    renderTarget = pmremGenerator.fromScene(sky);
    scene.environment = renderTarget.texture;
  }

  updateSun();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.update();

  // Create the house
  house = new House();

  // Create flood layers
  createFloodLayers();

  // Create flood controls
  createFloodControls();

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;

  // Update water animations with authentic movement
  Object.keys(floodLayers).forEach(level => {
    const water = floodLayers[level];
    if (water.visible) {
      water.material.uniforms['time'].value += 1.0 / 60.0;

      // Subtle water movement
      const depth = FLOOD_LEVELS[level].depth;
      water.position.y = (depth - 1) + Math.sin(time * 0.3) * 0.05;
    }
  });

  // Update sun direction for all water layers - crucial for realistic reflections
  Object.values(floodLayers).forEach(water => {
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();
  });

  controls.update();
  renderer.render(scene, camera);
}