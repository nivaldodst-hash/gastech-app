export type ServiceMode = 'condominio' | 'apartamento' | '';

export interface FloorData {
  floorNumber: number;
  name: string;
  isGoodCondition: boolean;
  regCount: number;
  meterCount: number;
  regModel?: string;
  meterModel?: string;
  regExpiries: Record<number, string>; // reg index -> YYYY-MM
  meterMfgs: Record<number, string>; // meter index -> YYYY
  medVerificados?: boolean;
  medOk?: boolean;
  medAvaria?: boolean;
  medTroca?: boolean;
  hasLeak?: boolean;
  leakLocation?: string;
  hasRepair?: boolean;
  notes?: string;
  regLeaks?: Record<number, { leak: boolean; location?: string }>;
  meterLeaks?: Record<number, { leak: boolean; location?: string }>;
  photosReg?: string[];
  photosMeter?: string[];
  photosLeakRepair?: string[];
}

export interface BlockData {
  name: string;
  floorCount: number;
  floors: Record<number, FloorData>;
}

export interface ApartmentData {
  number: string;
  resident?: string;
  services: {
    inspection?: boolean;
    installation?: boolean;
    maintenance?: boolean;
    leakTest?: boolean;
    leakDetect?: boolean;
    leakRepair?: boolean;
    regulatorReplace?: boolean;
    meterReplace?: boolean;
    flexReplace?: boolean;
    registerReplace?: boolean;
    pipeInstall?: boolean;
    other?: boolean;
  };
  repairLocation?: string;
  repairPhotos?: string[];
  leakDetectionResult?: string;
  leakDetectionPhotos?: string[];
  electricalStatus?: 'conforme' | 'nao_conforme' | '';
  electricalNonconformities?: {
    exposed?: boolean;
    nearGas?: boolean;
    stoveEnergy?: boolean;
    other?: boolean;
  };
  electricalNotes?: string;
  equipmentConditions?: {
    regOk?: boolean;
    regExpired?: boolean;
    regLeak?: boolean;
    regReplaced?: boolean;
    regInstalled?: boolean;
    regNeedsReplace?: boolean;
    meterOk?: boolean;
    meterDamage?: boolean;
    meterReplaced?: boolean;
    meterInstalled?: boolean;
    meterNeedsReplace?: boolean;
    flexOk?: boolean;
    flexExpired?: boolean;
    flexDamage?: boolean;
    flexReplaced?: boolean;
    flexInstalled?: boolean;
    flexNeedsReplace?: boolean;
    registerOk?: boolean;
    registerDamage?: boolean;
    registerReplaced?: boolean;
    registerInstalled?: boolean;
    registerNeedsReplace?: boolean;
    pipeOk?: boolean;
    pipeLeak?: boolean;
    pipeDamage?: boolean;
    applianceOk?: boolean;
    applianceLeak?: boolean;
    applianceInstalled?: boolean;
  };
  installedItems?: {
    regulator?: boolean;
    regulatorQty?: number;
    meter?: boolean;
    meterQty?: number;
    flex?: boolean;
    flexQty?: number;
    register?: boolean;
    registerQty?: number;
    adapter?: boolean;
    adapterQty?: number;
    stove?: boolean;
    stoveQty?: number;
    cooktop?: boolean;
    cooktopQty?: number;
    oven?: boolean;
    ovenQty?: number;
    heater?: boolean;
    heaterQty?: number;
    materials?: string;
  };
  workNotes?: string;
  photos?: string[];
  conclusion?: string;
}

export interface LeakTestData {
  startTime?: string;
  endTime?: string;
  equipment?: string;
  manufacturer?: string;
  calibrationDate?: string;
  calibrationExpiry?: string;
  // Stage 1
  stage1Gas?: string;
  stage1Date?: string;
  s1Pressures?: {
    p0?: number; t0?: string;
    p10?: number; t10?: string;
    p20?: number; t20?: string;
    p30?: number; t30?: string;
    p40?: number; t40?: string;
    p50?: number; t50?: string;
    p60?: number; t60?: string;
  };
  stage1Result?: string;
  // Stage 2
  stage2Gas?: string;
  stage2Date?: string;
  s2Pressures?: {
    p0?: number; t0?: string;
    p25?: number; t25?: string;
    p5?: number; t5?: string;
  };
  stage2Result?: string;
  // Complementary
  gasType?: string;
  centralType?: string;
  largestVessel?: string;
  centralCapacity?: string;
  safetyPE1?: string;
  safetyPE2?: string;
  networkMaterial?: string;
  passages?: {
    ducts?: string;
    cistern?: string;
    electrical?: string;
    fuel?: string;
    structure?: string;
    closedSpace?: string;
    elevator?: string;
  };
  adjustmentDevice?: string;
  adjustmentLocation?: string;
  photos?: string[];
}

export interface InspectionRecord {
  id: number;
  savedAt: string;
  serviceMode: ServiceMode;
  serviceType: string;
  clientType: string;
  cnpj?: string;
  legalName?: string;
  client: string;
  inspectionDate: string;
  address: string;
  inspector: string;
  // Condominio
  floorCount: number;
  blockCount: number;
  currentBlockIndex: number;
  hasLeisureArea?: string;
  leisureAreaNotes?: string;
  leisureAreaPhotos?: string[];
  hasStaffKitchen?: string;
  staffKitchenNotes?: string;
  staffKitchenPhotos?: string[];
  // Central
  condoGasType?: string;
  quickShutoffValve?: string;
  centralDrainDistanceStatus?: string;
  centralDrainMeasuredDistance?: string;
  glpChecks?: {
    location?: string;
    access?: string;
    cylinder?: string;
    valves?: string;
    clearance?: string;
    signage?: string;
    notes?: string;
  };
  centralCylinderType?: string;
  centralCylinderQty?: string;
  centralRegModel?: string;
  centralRegOk?: boolean;
  centralRegExpired?: boolean;
  centralRegLeak?: boolean;
  centralRegLeakLocation?: string;
  centralRegNeedsReplace?: boolean;
  centralRegExpiry?: string;
  centralRegPhotos?: string[];
  centralFlexOk?: boolean;
  centralFlexExpired?: boolean;
  centralFlexDamage?: boolean;
  centralFlexNeedsReplace?: boolean;
  centralFlexExpiry?: string;
  centralFlexPhotos?: string[];
  centralGeneralCondition?: 'good' | 'regular' | 'bad' | '';
  centralGeneralPhotos?: string[];
  centralNotes?: string;
  centralSignage?: string;
  centralSignageNt18?: string;
  centralEndPhotos?: string[];
  // Blocks & Floors
  blocks: BlockData[];
  deletedFloorNumbers?: number[];
  // Building Final
  buildingVentilationDuct?: string;
  buildingDuctPhotos?: string[];
  shaftDoorMaterial?: string;
  shaftDoorPhotos?: string[];
  condoPipeMaterial?: string;
  // Conclusion
  conclusionOk?: boolean;
  conclusionCorrections?: boolean;
  conclusionLeak?: boolean;
  conclusionRetest?: boolean;
  generalNotes?: string;
  generalPhotos?: string[];
  // Apartment & Leak test
  apartment: ApartmentData;
  leakTest: LeakTestData;
  // Signatures
  signerName: string;
  witnessName: string;
  signatureImage?: string;
  witnessSignatureImage?: string;
  // Photo Captions
  photoCaptions?: Record<string, string>;
}
