import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  FileText,
  Save,
  Printer,
  RotateCcw,
  Plus,
  Trash2,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Home,
  Download,
  Upload,
  Search,
  Sparkles,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InspectionRecord, ServiceMode, FloorData, BlockData } from './types';
import {
  saveDraftToDB,
  loadDraftFromDB,
  clearDraftFromDB,
  saveRecord,
  getSavedRecords,
  deleteRecord,
} from './utils/storage';
import { generateReportHtml } from './utils/reportGenerator';
import { SignatureCanvas } from './components/SignatureCanvas';
import { PWAInstallModal } from './components/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';

const TODAY_STR = new Date().toISOString().slice(0, 10);

const DEFAULT_INSPECTOR = 'Nivaldo Miranda Junior';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'saved' | 'preview'>('form');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Salvamento automático ativado');
  const [savedRecordsList, setSavedRecordsList] = useState<InspectionRecord[]>([]);

  const { isInstallable, isInstalled } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Core Form State
  const [serviceMode, setServiceMode] = useState<ServiceMode>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [clientType, setClientType] = useState<string>('Pessoa jurídica');
  const [cnpj, setCnpj] = useState<string>('');
  const [cnpjStatus, setCnpjStatus] = useState<string>('');
  const [isSearchingCnpj, setIsSearchingCnpj] = useState<boolean>(false);
  const [client, setClient] = useState<string>('');
  const [legalName, setLegalName] = useState<string>('');
  const [inspectionDate, setInspectionDate] = useState<string>(TODAY_STR);
  const [address, setAddress] = useState<string>('');
  const [inspector, setInspector] = useState<string>(DEFAULT_INSPECTOR);

  // Condomínio state
  const [floorCount, setFloorCount] = useState<number>(0);
  const [blockCount, setBlockCount] = useState<number>(1);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(1);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [deletedFloors, setDeletedFloors] = useState<number[]>([]);
  const [hasLeisureArea, setHasLeisureArea] = useState<string>('Não');
  const [leisureAreaNotes, setLeisureAreaNotes] = useState<string>('');
  const [hasStaffKitchen, setHasStaffKitchen] = useState<string>('Não');
  const [staffKitchenNotes, setStaffKitchenNotes] = useState<string>('');

  // Central de gás
  const [condoGasType, setCondoGasType] = useState<string>('GLP — Gás Liquefeito de Petróleo');
  const [quickShutoffValve, setQuickShutoffValve] = useState<string>('Sim');
  const [centralDrainDistanceStatus, setCentralDrainDistanceStatus] = useState<string>('Conforme — distância mínima de 1,5 m');
  const [centralDrainMeasuredDistance, setCentralDrainMeasuredDistance] = useState<string>('');
  const [centralCylinderType, setCentralCylinderType] = useState<string>('P45');
  const [centralCylinderQty, setCentralCylinderQty] = useState<string>('6');
  const [centralRegModel, setCentralRegModel] = useState<string>('');
  const [centralRegExpiry, setCentralRegExpiry] = useState<string>('');
  const [centralFlexExpiry, setCentralFlexExpiry] = useState<string>('');
  const [centralNotes, setCentralNotes] = useState<string>('');
  const [centralSignage, setCentralSignage] = useState<string>('Sim');
  const [centralSignageNt18, setCentralSignageNt18] = useState<string>('Sim');

  // Building conditions
  const [buildingVentilationDuct, setBuildingVentilationDuct] = useState<string>('Sim');
  const [shaftDoorMaterial, setShaftDoorMaterial] = useState<string>('Não combustível — metal (alumínio, ferro, inox etc.)');
  const [condoPipeMaterial, setCondoPipeMaterial] = useState<string>('Cobre');

  // Apartment state
  const [apartmentNumber, setApartmentNumber] = useState<string>('');
  const [apartmentResident, setApartmentResident] = useState<string>('');
  const [apartmentWorkNotes, setApartmentWorkNotes] = useState<string>('');
  const [aptConclusion, setAptConclusion] = useState<string>('');
  const [aptElectricalStatus, setAptElectricalStatus] = useState<'conforme' | 'nao_conforme' | ''>('conforme');
  const [aptElectricalNotes, setAptElectricalNotes] = useState<string>('');
  const [aptRepairLocation, setAptRepairLocation] = useState<string>('');
  const [aptLeakDetectionResult, setAptLeakDetectionResult] = useState<string>('');

  // Apartment installed items
  const [aptInstalledStove, setAptInstalledStove] = useState<boolean>(false);
  const [aptInstalledCooktop, setAptInstalledCooktop] = useState<boolean>(false);
  const [aptInstalledOven, setAptInstalledOven] = useState<boolean>(false);
  const [aptInstalledHeater, setAptInstalledHeater] = useState<boolean>(false);
  const [aptInstalledRegulator, setAptInstalledRegulator] = useState<boolean>(false);
  const [aptInstalledFlex, setAptInstalledFlex] = useState<boolean>(false);
  const [aptMaterials, setAptMaterials] = useState<string>('');

  // Conclusion
  const [conclusionOk, setConclusionOk] = useState<boolean>(true);
  const [conclusionCorrections, setConclusionCorrections] = useState<boolean>(false);
  const [conclusionLeak, setConclusionLeak] = useState<boolean>(false);
  const [conclusionRetest, setConclusionRetest] = useState<boolean>(false);
  const [generalNotes, setGeneralNotes] = useState<string>('');

  // Photos
  const [generalPhotos, setGeneralPhotos] = useState<string[]>([]);
  const [photoCaptions, setPhotoCaptions] = useState<Record<string, string>>({});

  // Signatures
  const [signerName, setSignerName] = useState<string>(DEFAULT_INSPECTOR);
  const [witnessName, setWitnessName] = useState<string>('');
  const [signatureImage, setSignatureImage] = useState<string>('');
  const [witnessSignatureImage, setWitnessSignatureImage] = useState<string>('');

  // Report HTML cache for preview/print
  const [reportHtmlContent, setReportHtmlContent] = useState<string>('');

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft & records on mount
  useEffect(() => {
    async function init() {
      const records = await getSavedRecords();
      setSavedRecordsList(records);

      const draft = await loadDraftFromDB();
      if (draft) {
        if (draft.serviceMode) setServiceMode(draft.serviceMode);
        if (draft.serviceType) setServiceType(draft.serviceType);
        if (draft.clientType) setClientType(draft.clientType);
        if (draft.cnpj) setCnpj(draft.cnpj);
        if (draft.legalName) setLegalName(draft.legalName);
        if (draft.client) setClient(draft.client);
        if (draft.inspectionDate) setInspectionDate(draft.inspectionDate);
        if (draft.address) setAddress(draft.address);
        if (draft.inspector) setInspector(draft.inspector);
        if (draft.floorCount) setFloorCount(draft.floorCount);
        if (draft.blockCount) setBlockCount(draft.blockCount);
        if (draft.blocks) setBlocks(draft.blocks);
        if (draft.deletedFloorNumbers) setDeletedFloors(draft.deletedFloorNumbers);
        if (draft.hasLeisureArea) setHasLeisureArea(draft.hasLeisureArea);
        if (draft.leisureAreaNotes) setLeisureAreaNotes(draft.leisureAreaNotes);
        if (draft.hasStaffKitchen) setHasStaffKitchen(draft.hasStaffKitchen);
        if (draft.staffKitchenNotes) setStaffKitchenNotes(draft.staffKitchenNotes);
        if (draft.condoGasType) setCondoGasType(draft.condoGasType);
        if (draft.quickShutoffValve) setQuickShutoffValve(draft.quickShutoffValve);
        if (draft.centralDrainDistanceStatus) setCentralDrainDistanceStatus(draft.centralDrainDistanceStatus);
        if (draft.centralDrainMeasuredDistance) setCentralDrainMeasuredDistance(draft.centralDrainMeasuredDistance);
        if (draft.centralCylinderType) setCentralCylinderType(draft.centralCylinderType);
        if (draft.centralCylinderQty) setCentralCylinderQty(draft.centralCylinderQty);
        if (draft.centralRegModel) setCentralRegModel(draft.centralRegModel);
        if (draft.centralRegExpiry) setCentralRegExpiry(draft.centralRegExpiry);
        if (draft.centralFlexExpiry) setCentralFlexExpiry(draft.centralFlexExpiry);
        if (draft.centralNotes) setCentralNotes(draft.centralNotes);
        if (draft.centralSignage) setCentralSignage(draft.centralSignage);
        if (draft.centralSignageNt18) setCentralSignageNt18(draft.centralSignageNt18);
        if (draft.buildingVentilationDuct) setBuildingVentilationDuct(draft.buildingVentilationDuct);
        if (draft.shaftDoorMaterial) setShaftDoorMaterial(draft.shaftDoorMaterial);
        if (draft.condoPipeMaterial) setCondoPipeMaterial(draft.condoPipeMaterial);
        if (draft.generalNotes) setGeneralNotes(draft.generalNotes);
        if (draft.signerName) setSignerName(draft.signerName);
        if (draft.witnessName) setWitnessName(draft.witnessName);
        if (draft.signatureImage) setSignatureImage(draft.signatureImage);
        if (draft.witnessSignatureImage) setWitnessSignatureImage(draft.witnessSignatureImage);

        if (draft.apartment) {
          if (draft.apartment.number) setApartmentNumber(draft.apartment.number);
          if (draft.apartment.resident) setApartmentResident(draft.apartment.resident);
          if (draft.apartment.workNotes) setApartmentWorkNotes(draft.apartment.workNotes);
          if (draft.apartment.conclusion) setAptConclusion(draft.apartment.conclusion);
          if (draft.apartment.electricalStatus) setAptElectricalStatus(draft.apartment.electricalStatus);
          if (draft.apartment.electricalNotes) setAptElectricalNotes(draft.apartment.electricalNotes);
          if (draft.apartment.repairLocation) setAptRepairLocation(draft.apartment.repairLocation);
          if (draft.apartment.leakDetectionResult) setAptLeakDetectionResult(draft.apartment.leakDetectionResult);
        }

        if (draft.generalPhotos) setGeneralPhotos(draft.generalPhotos);
        if (draft.photoCaptions) setPhotoCaptions(draft.photoCaptions);

        setAutoSaveStatus('Rascunho recuperado automaticamente');
      }
    }
    init();
  }, []);

  // Build current record snapshot
  const buildCurrentRecord = (): InspectionRecord => {
    return {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      serviceMode,
      serviceType: serviceType || (serviceMode === 'condominio' ? 'Inspeção técnica de condomínio' : 'Atendimento técnico'),
      clientType,
      cnpj,
      legalName,
      client,
      inspectionDate,
      address,
      inspector: inspector || DEFAULT_INSPECTOR,
      floorCount,
      blockCount,
      currentBlockIndex,
      blocks,
      deletedFloorNumbers: deletedFloors,
      hasLeisureArea,
      leisureAreaNotes,
      hasStaffKitchen,
      staffKitchenNotes,
      condoGasType,
      quickShutoffValve,
      centralDrainDistanceStatus,
      centralDrainMeasuredDistance,
      centralCylinderType,
      centralCylinderQty,
      centralRegModel,
      centralRegExpiry,
      centralFlexExpiry,
      centralNotes,
      centralSignage,
      centralSignageNt18,
      buildingVentilationDuct,
      shaftDoorMaterial,
      condoPipeMaterial,
      conclusionOk,
      conclusionCorrections,
      conclusionLeak,
      conclusionRetest,
      generalNotes,
      generalPhotos,
      photoCaptions,
      apartment: {
        number: apartmentNumber,
        resident: apartmentResident,
        services: {
          installation: serviceType === 'Instalação de equipamento',
          maintenance: serviceType === 'Manutenção / reparo',
          inspection: serviceType === 'Inspeção técnica em apartamento / unidade',
          leakTest: serviceType === 'Teste de estanqueidade',
          leakDetect: serviceType === 'Detecção de vazamento',
        },
        repairLocation: aptRepairLocation,
        leakDetectionResult: aptLeakDetectionResult,
        electricalStatus: aptElectricalStatus,
        electricalNotes: aptElectricalNotes,
        installedItems: {
          stove: aptInstalledStove,
          cooktop: aptInstalledCooktop,
          oven: aptInstalledOven,
          heater: aptInstalledHeater,
          regulator: aptInstalledRegulator,
          flex: aptInstalledFlex,
          materials: aptMaterials,
        },
        workNotes: apartmentWorkNotes,
        conclusion: aptConclusion,
      },
      leakTest: {
        startTime: '09:00',
        endTime: '10:00',
        equipment: 'Manômetro calibrado',
        calibrationDate: TODAY_STR,
        calibrationExpiry: TODAY_STR,
      },
      signerName: signerName || DEFAULT_INSPECTOR,
      witnessName,
      signatureImage,
      witnessSignatureImage,
    };
  };

  // Schedule auto-save
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      const rec = buildCurrentRecord();
      const ok = await saveDraftToDB(rec);
      if (ok) {
        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setAutoSaveStatus(`Salvo automaticamente às ${time}`);
      }
    }, 400);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [
    serviceMode,
    serviceType,
    client,
    cnpj,
    legalName,
    address,
    inspectionDate,
    inspector,
    floorCount,
    blocks,
    deletedFloors,
    condoGasType,
    centralCylinderType,
    centralCylinderQty,
    centralRegModel,
    centralRegExpiry,
    centralFlexExpiry,
    centralNotes,
    apartmentNumber,
    apartmentResident,
    apartmentWorkNotes,
    aptConclusion,
    aptElectricalStatus,
    conclusionOk,
    conclusionCorrections,
    conclusionLeak,
    generalNotes,
    generalPhotos,
    photoCaptions,
    signerName,
    witnessName,
    signatureImage,
    witnessSignatureImage,
  ]);

  // CNPJ format and lookup
  const handleCnpjChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 14);
    let formatted = raw;
    if (raw.length > 2) formatted = `${raw.slice(0, 2)}.${raw.slice(2)}`;
    if (raw.length > 5) formatted = `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`;
    if (raw.length > 8) formatted = `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8)}`;
    if (raw.length > 12) formatted = `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12, 14)}`;
    setCnpj(formatted);
  };

  const lookupCnpj = async () => {
    const raw = cnpj.replace(/\D/g, '');
    if (raw.length !== 14) {
      setCnpjStatus('CNPJ incompleto (deve conter 14 dígitos).');
      return;
    }
    setIsSearchingCnpj(true);
    setCnpjStatus('Consultando dados na Receita Federal...');
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${raw}`);
      if (!res.ok) throw new Error('Não foi possível obter dados deste CNPJ.');
      const data = await res.json();
      if (data.razao_social) setLegalName(data.razao_social);
      if (data.nome_fantasia || data.razao_social) setClient(data.nome_fantasia || data.razao_social);

      const addrParts = [
        data.logradouro ? `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro}`.trim() : '',
        data.numero,
        data.complemento,
        data.bairro,
        data.municipio ? `${data.municipio} - ${data.uf || ''}` : '',
        data.cep ? `CEP ${data.cep}` : '',
      ].filter(Boolean);

      if (addrParts.length > 0) {
        setAddress(addrParts.join(', '));
      }
      setCnpjStatus('Dados carregados com sucesso!');
    } catch {
      setCnpjStatus('Não foi possível consultar automaticamente. Preencha os campos manualmente.');
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  // Build Floors
  const handleBuildFloors = () => {
    if (floorCount <= 0) {
      alert('Selecione a quantidade de andares (de 1 a 100).');
      return;
    }

    const newFloors: Record<number, FloorData> = {};
    for (let i = floorCount; i >= 1; i--) {
      newFloors[i] = {
        floorNumber: i,
        name: i === floorCount ? `${i}º ANDAR — ANDAR DE REFERÊNCIA` : `${i}º ANDAR`,
        isGoodCondition: true,
        regCount: 0,
        meterCount: 0,
        regExpiries: {},
        meterMfgs: {},
      };
    }

    const initialBlock: BlockData = {
      name: blockCount > 1 ? 'Bloco 1' : 'Bloco Único',
      floorCount,
      floors: newFloors,
    };

    setBlocks([initialBlock]);
    setDeletedFloors([]);
  };

  // Floor updates
  const updateFloor = (blockIdx: number, floorNum: number, updater: (f: FloorData) => FloorData) => {
    setBlocks((prev) => {
      const copy = [...prev];
      const targetBlock = { ...copy[blockIdx] };
      const currentFloor = targetBlock.floors[floorNum];
      if (currentFloor) {
        targetBlock.floors = {
          ...targetBlock.floors,
          [floorNum]: updater(currentFloor),
        };
        copy[blockIdx] = targetBlock;
      }
      return copy;
    });
  };

  const applyToAllFloors = (blockIdx: number, field: 'regCount' | 'meterCount' | 'regModel' | 'meterModel', value: any) => {
    setBlocks((prev) => {
      const copy = [...prev];
      const targetBlock = { ...copy[blockIdx] };
      const updatedFloors = { ...targetBlock.floors };
      Object.keys(updatedFloors).forEach((k) => {
        const fn = Number(k);
        updatedFloors[fn] = {
          ...updatedFloors[fn],
          [field]: value,
        };
      });
      targetBlock.floors = updatedFloors;
      copy[blockIdx] = targetBlock;
      return copy;
    });
  };

  const deleteFloor = (floorNum: number) => {
    if (!confirm(`Deseja apagar o ${floorNum}º andar da inspeção?`)) return;
    setDeletedFloors((prev) => [...prev, floorNum]);
  };

  // General Photos Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setGeneralPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    setGeneralPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Reset form
  const handleResetForm = () => {
    if (!confirm('Deseja iniciar uma NOVA ordem de serviço? Os dados preenchidos na tela serão limpos (os atendimentos salvos permanecerão).')) {
      return;
    }
    clearDraftFromDB();
    setServiceMode('');
    setServiceType('');
    setClient('');
    setLegalName('');
    setCnpj('');
    setAddress('');
    setFloorCount(0);
    setBlocks([]);
    setDeletedFloors([]);
    setApartmentNumber('');
    setApartmentResident('');
    setApartmentWorkNotes('');
    setAptConclusion('');
    setGeneralNotes('');
    setGeneralPhotos([]);
    setPhotoCaptions({});
    setSignatureImage('');
    setWitnessSignatureImage('');
    setSignerName(DEFAULT_INSPECTOR);
    setWitnessName('');
    setAutoSaveStatus('Nova ordem de serviço iniciada');
  };

  // Save current record to list
  const handleSaveRecord = async () => {
    if (!client.trim()) {
      alert('Por favor, informe o nome do cliente antes de salvar.');
      return;
    }

    const rec = buildCurrentRecord();
    await saveRecord(rec);
    const updated = await getSavedRecords();
    setSavedRecordsList(updated);
    alert('Ordem de serviço salva com sucesso!');
  };

  // Generate Report View
  const handleOpenReport = () => {
    const rec = buildCurrentRecord();
    const html = generateReportHtml(rec);
    setReportHtmlContent(html);
    setActiveTab('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Download Standalone HTML
  const handleDownloadHtml = () => {
    const rec = buildCurrentRecord();
    const htmlBody = generateReportHtml(rec);
    const embeddedJson = JSON.stringify(rec).replace(/</g, '\\u003c');
    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Relatório GAS TECH — ${escapeHtml(rec.client)}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="bg-gray-100 p-4">
  <div class="max-w-4xl mx-auto shadow-xl rounded-xl overflow-hidden bg-white mb-6">
    ${htmlBody}
  </div>
  <script type="application/json" id="gasTechInspectionData">
    ${embeddedJson}
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laudo_GAS_TECH_${rec.client.replace(/\s+/g, '_')}_${rec.inspectionDate}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const rec = buildCurrentRecord();
    const payload = {
      app: 'GAS TECH',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      currentRecord: rec,
      savedRecords: savedRecordsList,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GAS_TECH_BACKUP_${TODAY_STR}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-gray-900 font-sans pb-16">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#141518] via-[#24262b] to-[#303238] text-white border-b-4 border-[#ffc928] sticky top-0 z-40 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shrink-0 shadow-md">
              <img src="/pwa-192x192.png" alt="Logo GAS TECH" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-wider flex items-center gap-1 leading-tight">
                GAS <span className="text-[#ffc928]">TECH</span>
              </div>
              <p className="text-[11px] text-gray-300 hidden sm:block">
                Instalação, manutenção e inspeção de sistemas de gás
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online Status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isOnline ? 'bg-green-950/80 text-green-300 border border-green-800' : 'bg-red-950/80 text-red-300 border border-red-800'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-green-400" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
              <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Install APK / PWA Button */}
            <button
              type="button"
              onClick={() => setIsInstallModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl text-xs font-bold shadow-md hover:from-red-700 hover:to-red-900 active:scale-95 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-yellow-300" />
              <span>Instalar Aplicativo (APK)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-gray-200/80 p-1.5 rounded-2xl w-fit max-w-full overflow-x-auto shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'form'
                ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-md'
                : 'text-gray-700 hover:text-gray-950 hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            Nova Ordem de Serviço
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-md'
                : 'text-gray-700 hover:text-gray-950 hover:bg-white/60'
            }`}
          >
            <Save className="w-4 h-4" />
            Atendimentos Salvos
            {savedRecordsList.length > 0 && (
              <span className="bg-yellow-400 text-gray-950 text-xs px-2 py-0.5 rounded-full font-black">
                {savedRecordsList.length}
              </span>
            )}
          </button>

          {activeTab === 'preview' && (
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-900 text-white shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-yellow-400" />
              Laudo Pronto para PDF
            </button>
          )}
        </div>

        {/* Auto-save indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 px-1">
          <span>{autoSaveStatus}</span>
          <span className="text-[11px] text-gray-400">Armazenamento em banco local seguro (IndexedDB)</span>
        </div>

        {/* TAB 1: FORM */}
        {activeTab === 'form' && (
          <div className="space-y-6">
            {/* Step 1: Identification & Service Mode */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 border-t-4 border-t-red-600">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                Tipo de Atendimento
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Selecione se o atendimento é de condomínio (central e prumada/andares) ou em unidade/apartamento específico.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setServiceMode('condominio');
                    setServiceType('Inspeção técnica de condomínio (central e andares)');
                  }}
                  className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
                    serviceMode === 'condominio'
                      ? 'border-red-600 bg-red-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Building2 className={`w-6 h-6 shrink-0 mt-0.5 ${serviceMode === 'condominio' ? 'text-red-600' : 'text-gray-400'}`} />
                  <div>
                    <strong className="block text-sm text-gray-900 font-bold">Inspeção de Condomínio</strong>
                    <span className="text-xs text-gray-500">Central de gás, prumadas, shafts e inspeção andar por andar</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setServiceMode('apartamento');
                    setServiceType('Instalação de equipamento');
                  }}
                  className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
                    serviceMode === 'apartamento'
                      ? 'border-red-600 bg-red-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Home className={`w-6 h-6 shrink-0 mt-0.5 ${serviceMode === 'apartamento' ? 'text-red-600' : 'text-gray-400'}`} />
                  <div>
                    <strong className="block text-sm text-gray-900 font-bold">Apartamento ou Unidade</strong>
                    <span className="text-xs text-gray-500">Instalação de fogão/aquecedor, testes de estanqueidade, manutenção ou reparos</span>
                  </div>
                </button>
              </div>

              {serviceMode === 'apartamento' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tipo de serviço na unidade
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white font-medium focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Instalação de equipamento">Instalação de equipamento</option>
                    <option value="Manutenção / reparo">Manutenção / reparo</option>
                    <option value="Inspeção técnica em apartamento / unidade">Inspeção técnica em apartamento / unidade</option>
                    <option value="Teste de estanqueidade">Teste de estanqueidade (Laudo NBR 15526 / NT 18)</option>
                    <option value="Detecção de vazamento">Detecção de vazamento</option>
                    <option value="Vistoria técnica em apartamento / unidade">Vistoria técnica em apartamento / unidade</option>
                    <option value="Outro serviço em apartamento / unidade">Outro serviço em apartamento / unidade</option>
                  </select>
                </div>
              )}
            </div>

            {/* Step 2: Client & Company Information */}
            {serviceMode && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                  <span>Dados do Cliente e Localização</span>
                  <span className="text-xs font-normal text-gray-500">Campos do Laudo</span>
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Cliente</label>
                    <select
                      value={clientType}
                      onChange={(e) => setClientType(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white"
                    >
                      <option value="Pessoa jurídica">Pessoa jurídica (Condomínio / Empresa)</option>
                      <option value="Pessoa física">Pessoa física (Morador / Proprietário)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Data do Atendimento</label>
                    <input
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                    />
                  </div>

                  {clientType === 'Pessoa jurídica' && (
                    <div className="sm:col-span-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                      <label className="block text-xs font-bold text-gray-800 mb-1">CNPJ da Empresa ou Condomínio</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cnpj}
                          onChange={(e) => handleCnpjChange(e.target.value)}
                          placeholder="00.000.000/0000-00"
                          maxLength={18}
                          className="flex-1 rounded-xl border border-gray-300 p-2.5 text-sm bg-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={lookupCnpj}
                          disabled={isSearchingCnpj}
                          className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-black transition cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5" />
                          {isSearchingCnpj ? 'Buscando...' : 'Buscar Dados'}
                        </button>
                      </div>
                      {cnpjStatus && <p className="text-xs text-blue-700 mt-1.5">{cnpjStatus}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Cliente ou Condomínio</label>
                    <input
                      type="text"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Ex.: Condomínio Residencial Parque das Flores"
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                    />
                  </div>

                  {clientType === 'Pessoa jurídica' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Razão Social</label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="Razão social completa"
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número, complemento, bairro, cidade, UF e CEP"
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Responsável Técnico pelo Atendimento</label>
                    <input
                      type="text"
                      value={inspector}
                      onChange={(e) => setInspector(e.target.value)}
                      placeholder="Nome do técnico responsável"
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Condominium: Central & Setup */}
            {serviceMode === 'condominio' && (
              <>
                {/* Floor Count Setup */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-base font-bold text-gray-900 mb-2">Quantos andares serão inspecionados?</h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Escolha a quantidade de andares do prédio. O sistema criará todos os pavimentos do andar mais alto até o 1º andar.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={floorCount}
                      onChange={(e) => setFloorCount(Number(e.target.value))}
                      className="rounded-xl border border-gray-300 p-2.5 text-sm bg-white font-bold w-48"
                    >
                      <option value={0}>Selecione...</option>
                      {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'andar' : 'andares'}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleBuildFloors}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-sm rounded-xl shadow-md hover:from-red-700 hover:to-red-900 transition cursor-pointer"
                    >
                      Montar Inspeção
                    </button>
                  </div>

                  {blocks.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>
                        Total de andares ativos neste bloco: {Object.keys(blocks[0]?.floors || {}).length - deletedFloors.length}
                      </span>
                      <span className="text-gray-500 font-normal">
                        Do {floorCount}º andar até o 1º andar
                      </span>
                    </div>
                  )}
                </div>

                {/* Central de Gás */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
                  <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                    Central de Gás
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Gás</label>
                      <select
                        value={condoGasType}
                        onChange={(e) => setCondoGasType(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white"
                      >
                        <option value="GLP — Gás Liquefeito de Petróleo">GLP — Gás Liquefeito de Petróleo</option>
                        <option value="GN — Gás Natural">GN — Gás Natural</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Válvula de Corte Rápido</label>
                      <select
                        value={quickShutoffValve}
                        onChange={(e) => setQuickShutoffValve(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white"
                      >
                        <option value="Sim">Sim — Instalada e funcional</option>
                        <option value="Não">Não — Ausente</option>
                        <option value="Não se aplica">Não se aplica</option>
                      </select>
                    </div>

                    {condoGasType.startsWith('GLP') && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Recipiente</label>
                          <select
                            value={centralCylinderType}
                            onChange={(e) => setCentralCylinderType(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white"
                          >
                            <option value="P45">Cilindros P45</option>
                            <option value="P190">Cilindros P190</option>
                            <option value="Tanque estacionário">Tanque Estacionário</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Quantidade de Cilindros/Tanques</label>
                          <input
                            type="number"
                            value={centralCylinderQty}
                            onChange={(e) => setCentralCylinderQty(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Afastamento de ralos/canaletas (&gt;= 1,5m conforme ABNT NBR 13523)
                          </label>
                          <select
                            value={centralDrainDistanceStatus}
                            onChange={(e) => setCentralDrainDistanceStatus(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white"
                          >
                            <option value="Conforme — distância mínima de 1,5 m">Sim — Atende à distância mínima de 1,5 m</option>
                            <option value="Não conforme — menos de 1,5 m">Não — Distância inferior a 1,5 m</option>
                            <option value="Não foi possível verificar">Não foi possível verificar</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Modelo do Regulador da Central</label>
                      <input
                        type="text"
                        value={centralRegModel}
                        onChange={(e) => setCentralRegModel(e.target.value)}
                        placeholder="Ex.: Aliança 50kg/h"
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Validade do Regulador</label>
                      <input
                        type="month"
                        value={centralRegExpiry}
                        onChange={(e) => setCentralRegExpiry(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Validade dos Pigtails / Flexíveis</label>
                      <input
                        type="month"
                        value={centralFlexExpiry}
                        onChange={(e) => setCentralFlexExpiry(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Sinalização Conforme NT 18</label>
                      <select
                        value={centralSignageNt18}
                        onChange={(e) => setCentralSignageNt18(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white"
                      >
                        <option value="Sim">Sim — Placas de perigo e sinalização presentes</option>
                        <option value="Não">Não — Sem sinalização adequada</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Observações da Central</label>
                      <textarea
                        value={centralNotes}
                        onChange={(e) => setCentralNotes(e.target.value)}
                        rows={2}
                        placeholder="Descreva condições de ventilação, estado de pintura, tubulação, etc."
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Floors Checklist */}
                {blocks.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-base font-bold text-gray-900 flex items-center justify-between">
                      <span>Inspeção por Andar ({blocks[0].name})</span>
                      <span className="text-xs text-gray-500 font-normal">
                        Preenchimento do topo até a base
                      </span>
                    </h2>

                    {Object.keys(blocks[0].floors)
                      .map(Number)
                      .sort((a, b) => b - a)
                      .map((fn) => {
                        if (deletedFloors.includes(fn)) return null;
                        const fl = blocks[0].floors[fn];
                        if (!fl) return null;

                        return (
                          <div
                            key={fn}
                            className={`rounded-2xl p-5 border shadow-xs transition bg-white ${
                              fl.isGoodCondition && !fl.hasLeak
                                ? 'border-gray-200 border-l-4 border-l-green-600'
                                : 'border-red-300 border-l-4 border-l-red-600'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-gray-900">{fl.name}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="inline-flex items-center gap-2 text-xs font-bold text-green-800 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={fl.isGoodCondition}
                                    onChange={(e) =>
                                      updateFloor(0, fn, (f) => ({
                                        ...f,
                                        isGoodCondition: e.target.checked,
                                      }))
                                    }
                                    className="accent-green-700 w-4 h-4 rounded"
                                  />
                                  <span>Em boas condições</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => deleteFloor(fn)}
                                  className="text-xs text-gray-400 hover:text-red-700 p-1.5 transition"
                                  title="Apagar este andar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                              {/* Reg Qty */}
                              <div>
                                <label className="block text-gray-600 font-bold mb-1">Reguladores</label>
                                <div className="flex gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    value={fl.regCount}
                                    onChange={(e) =>
                                      updateFloor(0, fn, (f) => ({
                                        ...f,
                                        regCount: Number(e.target.value),
                                      }))
                                    }
                                    className="w-16 rounded-lg border border-gray-300 p-1.5 font-bold text-center"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => applyToAllFloors(0, 'regCount', fl.regCount)}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-semibold"
                                  >
                                    Copiar p/ todos
                                  </button>
                                </div>
                              </div>

                              {/* Meter Qty */}
                              <div>
                                <label className="block text-gray-600 font-bold mb-1">Medidores</label>
                                <div className="flex gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    value={fl.meterCount}
                                    onChange={(e) =>
                                      updateFloor(0, fn, (f) => ({
                                        ...f,
                                        meterCount: Number(e.target.value),
                                      }))
                                    }
                                    className="w-16 rounded-lg border border-gray-300 p-1.5 font-bold text-center"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => applyToAllFloors(0, 'meterCount', fl.meterCount)}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-semibold"
                                  >
                                    Copiar p/ todos
                                  </button>
                                </div>
                              </div>

                              {/* Reg Model */}
                              <div>
                                <label className="block text-gray-600 font-bold mb-1">Modelo Regulador</label>
                                <input
                                  type="text"
                                  value={fl.regModel || ''}
                                  onChange={(e) =>
                                    updateFloor(0, fn, (f) => ({
                                      ...f,
                                      regModel: e.target.value,
                                    }))
                                  }
                                  placeholder="Ex.: Aliança 5kg"
                                  className="w-full rounded-lg border border-gray-300 p-1.5"
                                />
                              </div>

                              {/* Meter Model */}
                              <div>
                                <label className="block text-gray-600 font-bold mb-1">Modelo Medidor</label>
                                <input
                                  type="text"
                                  value={fl.meterModel || ''}
                                  onChange={(e) =>
                                    updateFloor(0, fn, (f) => ({
                                      ...f,
                                      meterModel: e.target.value,
                                    }))
                                  }
                                  placeholder="Ex.: G1.6"
                                  className="w-full rounded-lg border border-gray-300 p-1.5"
                                />
                              </div>
                            </div>

                            {/* Leak Checkbox & Notes */}
                            <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-gray-100">
                              <label className="inline-flex items-center gap-1.5 font-bold text-red-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={fl.hasLeak || false}
                                  onChange={(e) =>
                                    updateFloor(0, fn, (f) => ({
                                      ...f,
                                      hasLeak: e.target.checked,
                                      isGoodCondition: !e.target.checked,
                                    }))
                                  }
                                  className="accent-red-600 w-4 h-4 rounded"
                                />
                                <span>Vazamento identificado neste andar</span>
                              </label>

                              {fl.hasLeak && (
                                <input
                                  type="text"
                                  value={fl.leakLocation || ''}
                                  onChange={(e) =>
                                    updateFloor(0, fn, (f) => ({
                                      ...f,
                                      leakLocation: e.target.value,
                                    }))
                                  }
                                  placeholder="Onde foi identificado o vazamento? (ex.: no regulador do apt 402)"
                                  className="flex-1 rounded-lg border border-red-300 bg-red-50/50 p-1.5 text-xs"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}

            {/* Apartment Mode Specific Details */}
            {serviceMode === 'apartamento' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                  Dados da Unidade e Serviço
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Apartamento / Unidade</label>
                    <input
                      type="text"
                      value={apartmentNumber}
                      onChange={(e) => setApartmentNumber(e.target.value)}
                      placeholder="Ex.: Apto 702, Bloco B"
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Morador / Responsável Presente</label>
                    <input
                      type="text"
                      value={apartmentResident}
                      onChange={(e) => setApartmentResident(e.target.value)}
                      placeholder="Nome de quem acompanhou"
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Condição da Parte Elétrica</label>
                    <select
                      value={aptElectricalStatus}
                      onChange={(e) => setAptElectricalStatus(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white"
                    >
                      <option value="conforme">Conforme (seguro e sem risco elétrico próximo ao gás)</option>
                      <option value="nao_conforme">Não Conforme (fiação exposta ou risco identificado)</option>
                    </select>
                  </div>

                  {aptElectricalStatus === 'nao_conforme' && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Detalhes da Não Conformidade Elétrica</label>
                      <textarea
                        value={aptElectricalNotes}
                        onChange={(e) => setAptElectricalNotes(e.target.value)}
                        placeholder="Ex.: Tomada em curto ou fiação elétrica encostando no flexível metálico de gás"
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                        rows={2}
                      />
                    </div>
                  )}

                  {/* Installed equipment checkboxes */}
                  <div className="sm:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <span className="block text-xs font-bold text-gray-800 mb-2">Equipamentos e Peças Instaladas:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aptInstalledStove}
                          onChange={(e) => setAptInstalledStove(e.target.checked)}
                          className="accent-red-600 rounded"
                        />
                        <span>Fogão</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aptInstalledCooktop}
                          onChange={(e) => setAptInstalledCooktop(e.target.checked)}
                          className="accent-red-600 rounded"
                        />
                        <span>Cooktop</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aptInstalledOven}
                          onChange={(e) => setAptInstalledOven(e.target.checked)}
                          className="accent-red-600 rounded"
                        />
                        <span>Forno</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aptInstalledHeater}
                          onChange={(e) => setAptInstalledHeater(e.target.checked)}
                          className="accent-red-600 rounded"
                        />
                        <span>Aquecedor</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aptInstalledRegulator}
                          onChange={(e) => setAptInstalledRegulator(e.target.checked)}
                          className="accent-red-600 rounded"
                        />
                        <span>Regulador Novo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aptInstalledFlex}
                          onChange={(e) => setAptInstalledFlex(e.target.checked)}
                          className="accent-red-600 rounded"
                        />
                        <span>Flexível Metálico</span>
                      </label>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Materiais Utilizados</label>
                      <input
                        type="text"
                        value={aptMaterials}
                        onChange={(e) => setAptMaterials(e.target.value)}
                        placeholder="Ex.: Flexível de malha de aço 1.20m, adaptador 1/2, fita teflon"
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Serviços Executados e Observações</label>
                    <textarea
                      value={apartmentWorkNotes}
                      onChange={(e) => setApartmentWorkNotes(e.target.value)}
                      placeholder="Descreva detalhadamente o que foi inspecionado, montado, ajustado ou orientado ao morador"
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Conclusão do Atendimento na Unidade</label>
                    <input
                      type="text"
                      value={aptConclusion}
                      onChange={(e) => setAptConclusion(e.target.value)}
                      placeholder="Ex.: Equipamento instalado, regulado e testado com espuma de sabão. Sem vazamentos."
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Photos Section */}
            {serviceMode && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-red-600" />
                    Fotos do Atendimento e Evidências
                  </h2>
                  <span className="text-xs text-gray-500 font-medium">
                    {generalPhotos.length} {generalPhotos.length === 1 ? 'foto' : 'fotos'} adicionadas
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition cursor-pointer shadow-sm">
                    <Camera className="w-4 h-4 text-yellow-300" />
                    <span>Tirar Foto / Carregar Imagem</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {generalPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {generalPhotos.map((src, idx) => (
                      <div key={idx} className="relative rounded-xl border border-gray-200 bg-gray-50 p-2 flex flex-col gap-2">
                        <img
                          src={src}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-36 object-contain rounded-lg bg-black/5"
                        />
                        <input
                          type="text"
                          value={photoCaptions[`general_${idx}`] || ''}
                          onChange={(e) =>
                            setPhotoCaptions((prev) => ({
                              ...prev,
                              [`general_${idx}`]: e.target.value,
                            }))
                          }
                          placeholder="Legenda da foto..."
                          className="w-full text-xs p-1.5 border border-gray-300 rounded-md bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="text-xs text-red-600 font-bold self-end hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* General Conclusion and Notes */}
            {serviceMode && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                  Conclusão e Parecer Técnico
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conclusionOk}
                      onChange={(e) => setConclusionOk(e.target.checked)}
                      className="accent-green-700 w-4 h-4 rounded"
                    />
                    <span className="font-bold text-gray-900">Em condições de uso</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conclusionCorrections}
                      onChange={(e) => setConclusionCorrections(e.target.checked)}
                      className="accent-amber-600 w-4 h-4 rounded"
                    />
                    <span className="font-bold text-gray-900">Necessita correções</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conclusionLeak}
                      onChange={(e) => setConclusionLeak(e.target.checked)}
                      className="accent-red-600 w-4 h-4 rounded"
                    />
                    <span className="font-bold text-gray-900">Vazamento identificado</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conclusionRetest}
                      onChange={(e) => setConclusionRetest(e.target.checked)}
                      className="accent-blue-600 w-4 h-4 rounded"
                    />
                    <span className="font-bold text-gray-900">Reinspeção sugerida</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Observações Finais do Laudo</label>
                  <textarea
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    rows={3}
                    placeholder="Orientações de segurança para o cliente, prazos para adequação de peças vencidas, etc."
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Digital Signatures */}
            {serviceMode && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                  Assinaturas Digitais na Tela
                </h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Inspector Signature */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Técnico Responsável</label>
                      <input
                        type="text"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                      />
                    </div>
                    <SignatureCanvas
                      label="Assinatura do Técnico"
                      initialDataUrl={signatureImage}
                      onChange={setSignatureImage}
                    />
                  </div>

                  {/* Witness Signature */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nome de Quem Acompanhou / Cliente</label>
                      <input
                        type="text"
                        value={witnessName}
                        onChange={(e) => setWitnessName(e.target.value)}
                        placeholder="Nome completo do síndico/morador"
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                      />
                    </div>
                    <SignatureCanvas
                      label="Assinatura de Quem Acompanhou"
                      initialDataUrl={witnessSignatureImage}
                      onChange={setWitnessSignatureImage}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            {serviceMode && (
              <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Nova OS / Limpar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveRecord}
                    className="px-4 py-2.5 bg-gray-800 text-white font-bold text-xs rounded-xl hover:bg-black shadow transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-green-400" />
                    Salvar Atendimento
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenReport}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-xs rounded-xl hover:from-red-700 hover:to-red-900 shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-yellow-300" />
                    Gerar Laudo / Imprimir em PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED RECORDS */}
        {activeTab === 'saved' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Atendimentos Salvos no Aparelho</h2>
                <p className="text-xs text-gray-500">
                  Os dados ficam guardados no banco local deste dispositivo para consulta mesmo offline.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-3.5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-black transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Backup (JSON)
                </button>
              </div>
            </div>

            {savedRecordsList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">Nenhum atendimento salvo ainda.</p>
                <p className="text-xs">Preencha o formulário e clique em "Salvar Atendimento".</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {savedRecordsList.map((rec) => (
                  <div key={rec.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{rec.client || 'Cliente não identificado'}</h4>
                      <p className="text-xs text-gray-500">
                        {rec.serviceType} • {rec.inspectionDate} • {rec.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const html = generateReportHtml(rec);
                          setReportHtmlContent(html);
                          setActiveTab('preview');
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Abrir / Imprimir
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Excluir o atendimento de "${rec.client}"?`)) {
                            await deleteRecord(rec.id);
                            const updated = await getSavedRecords();
                            setSavedRecordsList(updated);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-700 transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REPORT PREVIEW / PRINT */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold transition text-gray-700"
              >
                ← Voltar ao Formulário
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                  Baixar Relatório HTML
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl text-xs font-bold shadow-md hover:from-red-700 hover:to-red-900 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-yellow-300" />
                  Salvar em PDF / Imprimir
                </button>
              </div>
            </div>

            {/* Render HTML Document */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
              <div dangerouslySetInnerHTML={{ __html: reportHtmlContent }} />
            </div>
          </div>
        )}
      </main>

      {/* PWA / APK Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
