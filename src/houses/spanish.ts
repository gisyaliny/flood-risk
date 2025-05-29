import * as THREE from "three";
import {
  roofMaterial,
  floorMaterial,
  wallMaterial,
  aluMaterial,
  aweningMaterial,
  aweningMaterial2,
  woodMaterial,
  plantMaterial,
  bulbMaterial,
  bulbMaterialOn
} from "../materials";

import {
  IHouse,
  IBalconySettings,
  IBalconyDoorSettings,
  IAwningSettings,
  IPlantSettings,
  IHoleSettings,
  IHangingLightsSettings,
  IHouseSide,
  IHouseFloor
} from "./types";

const spanishhouse: IHouse = {
  floors: [],
  wallthickness: 0.2
};

const insertBalconyDoor = ({
  open
}: IBalconyDoorSettings): IBalconyDoorSettings => {
  return {
    type: "balconydoor",
    z: -spanishhouse.wallthickness / 2,
    open: open || [80, 60],
    shutters: 3,
    materials: {
      default: woodMaterial
    }
  };
};

const insertWindowShutters = (shutters?: number) => {
  return {
    type: "shuttersWithFrame",
    shutters: shutters || 2,
    open: [45, 10],
    z: -spanishhouse.wallthickness / 2,
    materials: {
      default: woodMaterial
    }
  };
};

const insertWallRailing = () => {
  return {
    type: "wallRailing",
    z: -spanishhouse.wallthickness / 2,
    materials: {
      default: aluMaterial
    }
  };
};

const insertHangingLights = ({
  width,
  depth
}: {
  width: number;
  depth: number;
}) => {
  return {
    type: "hangingLights",
    z: -spanishhouse.wallthickness / 2,
    path: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, depth),
      new THREE.Vector3(width, 0, depth),
      new THREE.Vector3(width, 0, 0)
    ],
    depth: depth || 2,
    hanging: [0.2, 0.4, 0.2],
    materials: {
      default: aluMaterial,
      bulb: bulbMaterialOn
    }
  };
};

const insertBalcony = (): IBalconySettings => {
  return {
    type: "balcony",
    top: 0,
    left: -0.2,
    right: -0.2,
    z: 0,
    depth: 1.2,
    materials: {
      default: wallMaterial,
      alu: aluMaterial
    }
  };
};

const insertFrenchBalcony = (): IBalconySettings => {
  return {
    type: "balcony",
    top: 0,
    left: -0.2,
    right: -0.2,
    z: 0,
    depth: 0.2,
    materials: {
      default: wallMaterial,
      alu: aluMaterial
    }
  };
};

const insertRetractableAwening = ({
  opened,
  top
}: IAwningSettings): IAwningSettings => {
  const settings = {
    type: "retractable-awning",
    top: top || -0.2,
    left: -0.2,
    right: -0.2,
    z: 0,
    depth: 1,
    height: 1,
    opened: opened || 70,
    stiffness: 0.8,
    segments: 17,
    materials: {
      default: wallMaterial,
      alu: aluMaterial,
      fabric: [aweningMaterial, aweningMaterial2]
    }
  };

  // settings.opened = Math.random() * 100;

  return settings;
};

const insertAwening = (): IAwningSettings => {
  return {
    type: "awning",
    top: -0.1,
    left: -0.2,
    right: -0.2,
    z: 0,
    depth: 1,
    height: 1,
    opened: 90,
    stiffness: 0.5,
    segments: 17,
    materials: {
      default: wallMaterial,
      alu: aluMaterial,
      fabric: [aweningMaterial, aweningMaterial2]
    }
  };
};

const insertPlant = (): IPlantSettings => {
  return {
    type: "plant",
    z: 0,
    materials: {
      default: plantMaterial
    }
  };
};

const awening = (props: { offsetLeft: number }) => {
  return {
    ...props,
    bottom: 0,
    top: 0.02,
    width: 1,
    shapes: [insertAwening()]
  };
};
function balconyWithDoorAndAwening(props) {
  return {
    bottom: 0.01,
    ...props,
    width: 3,
    height: 2.4,
    shapes: [insertAwening(), insertBalcony(), insertBalconyDoor()]
  };
}
function balconyWithDoorAndReAwening(props: {
  awening: IAwningSettings;
  door: any;
}) {
  return {
    bottom: 0.01,
    ...props,
    width: 3,
    height: 2.4,
    shapes: [
      insertRetractableAwening({ opened: props.awening?.opened }),
      insertBalcony(),
      insertBalconyDoor({ ...props.door })
    ]
  };
}
function cafeopening(props: {
  width?: number;
  awening: IAwningSettings;
  door: any;
}) {
  return {
    bottom: 0.01,
    width: 3,
    height: 2.5,
    ...props,
    shapes: [
      insertRetractableAwening({ ...props.awening }),
      insertBalconyDoor({ ...props.door })
    ]
  };
}
function normalWindowWithFrenchBalcony(props: { offsetLeft: number }) {
  return {
    ...props,
    width: 1,
    height: 2,
    shapes: [insertWindowShutters(2), insertFrenchBalcony()]
  };
}

function normalWindow(props: { offsetLeft: number; width?: number }) {
  return {
    bottom: 0.2,
    width: props.width || 1,
    height: 2,
    ...props,
    shapes: [insertWindowShutters(2)]
  };
}

function smallWindow(props: { offsetLeft: number }) {
  return {
    bottom: 0.5,
    width: 0.5,
    height: 0.5,
    ...props,
    shapes: [insertWindowShutters(1)]
  };
}

function hangingLights(props: { offsetLeft: number }) {
  const settings = {
    width: 3,
    height: 3,
    ...props,
    shapes: []
  };
  settings.shapes = [
    insertHangingLights({ width: settings.width, depth: settings.depth })
  ];
  return settings;
}

function wallRailing(props: { offsetLeft: number; width?: number }) {
  return {
    width: 2,
    height: 0.4,
    top: 0.1,
    ...props,
    shapes: [insertWallRailing()]
  };
}

function entranceDoor() {
  return {
    bottom: 0,
    roundTop: 1
    // shapes: [insertWindowShutters(1)]
  };
}

function plant(props: { offsetLeft: number }) {
  return {
    ...props,
    shapes: [insertPlant()]
    // shapes: [insertWindowShutters(1)]
  };
}

spanishhouse.floors = [
  {
    height: 0.01,
    floor: false,
    materials: {
      floor: floorMaterial
    },
    sides: [
      {
        start: new THREE.Vector3(-4, 0, 2)
      },
      {
        start: new THREE.Vector3(3, 0, 2),
        holes: []
      },
      {
        start: new THREE.Vector3(3, 0, -2)
      },
      {
        start: new THREE.Vector3(-3, 0, -3)
      }
    ]
  },
  {
    height: 4,
    floor: true,
    materials: {
      floor: floorMaterial
    },
    sides: [
      {
        holes: [
          cafeopening({
            offsetLeft: 0.35,
            width: 3,
            awening: { opened: 80, top: -80 },
            door: { open: [80, 80] }
          }),
          normalWindow({ offsetLeft: 0.7 }),
          hangingLights({ offsetLeft: 0.5, width: 6, depth: 3 })
        ]
      },
      {
        holes: [smallWindow({ offsetLeft: 2 })]
      },
      {},
      {}
    ]
  },
  {
    height: 3,
    materials: {
      floor: floorMaterial
    },
    sides: [
      {
        // shift: new THREE.Vector3(0, 0, 40),
        holes: [
          balconyWithDoorAndReAwening({
            offsetLeft: 0.5,
            awening: { opened: 10 }
            // door: { open: [0, 0] }
          })
        ]
      },
      {
        // shift: new THREE.Vector3(0, 0, 40)
      },
      {},
      {}
    ]
  },
  {
    height: 2.6,
    materials: {
      floor: floorMaterial
    },
    sides: [
      {
        // holes: [smallWindow({ .offsetLeft: 200 })]
        holes: [
          balconyWithDoorAndReAwening({
            offsetLeft: 0.5,
            awening: { opened: 10 }
          })
          //hangingLights({ offsetLeft: 0.5, width: 400, depth: 130 })
          // normalWindow({  offsetLeft: 0.5 })
        ]
      },
      {
        holes: [smallWindow({ offsetLeft: 2 })]
      },
      {},
      {}
    ]
  },
  {
    height: 1,
    materials: {
      floor: roofMaterial
    },
    sides: [
      {
        holes: [
          plant({ offsetLeft: 0.5, offsetFront: 0.5, height: 2 }),
          wallRailing({ offsetLeft: 0.5, width: 4 })
        ]
      }
    ]
  }
];

const house: IHouse = {
  floors: [],
  wallthickness: spanishhouse.wallthickness
};

function addFloor(props: { height: number }) {
  house.floors.push({ ...props, sides: [] });

  return house.floors[house.floors.length - 1];
}
console.clear();

for (var f = 0; f < spanishhouse.floors.length; f++) {
  const floor = spanishhouse.floors[f];
  let currentFloor = addFloor({
    height: floor.height,
    materials: floor.materials,
    floor: floor.floor === undefined ? true : floor.floor
  });

  currentFloor.sides = floor.sides;
}

export default house;
