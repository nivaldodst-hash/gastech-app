import { InspectionRecord } from '../types';

function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[c] || c)
  );
}

function formatDate(val?: string): string {
  if (!val) return '';
  const parts = val.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  if (parts.length === 2) {
    return `${parts[1]}/${parts[0]}`;
  }
  return val;
}

export function generateReportHtml(record: InspectionRecord): string {
  const isApt = record.serviceMode === 'apartamento';

  const reportTitleMap: Record<string, string> = {
    'Instalação de equipamento': 'Relatório técnico de instalação de equipamento',
    'Manutenção / reparo': 'Relatório técnico de manutenção e reparo',
    'Inspeção técnica': 'Relatório técnico de inspeção da rede de gás',
    'Teste de estanqueidade': 'Laudo técnico de estanqueidade',
    'Detecção de vazamento': 'Relatório técnico de detecção de vazamento',
    'Vistoria técnica': 'Relatório técnico de vistoria da rede de gás',
    'Outro serviço': 'Relatório técnico de serviço em rede de gás',
  };

  const reportTitle = isApt
    ? reportTitleMap[record.serviceType] || 'Relatório técnico de atendimento em rede de gás'
    : 'Relatório técnico de inspeção da rede de gás';

  let out = `
  <div class="report-preview font-sans text-gray-900 bg-white p-6 max-w-[920px] mx-auto text-xs leading-normal">
    <!-- Letterhead -->
    <div class="report-letterhead border border-gray-200 border-t-4 border-t-[#b51f2b] rounded-lg p-4 mb-5 bg-gradient-to-br from-white to-gray-50 flex items-center gap-5">
      <div class="w-20 h-20 shrink-0 bg-white p-1 rounded-lg border border-gray-200 flex items-center justify-center">
        <img src="/pwa-192x192.png" alt="Logo GAS TECH" class="max-h-full max-w-full object-contain" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-2xl font-black text-[#b51f2b] tracking-wider leading-none mb-1">GAS TECH</div>
        <div class="text-[10px] font-bold text-gray-700 tracking-wide uppercase mb-2">Instalação, Manutenção e Inspeção de Sistemas de Gás</div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-600">
          <div><span class="font-semibold text-gray-800">Responsável:</span> ${escapeHtml(record.inspector || 'Nivaldo Miranda Junior')}</div>
          <div><span class="font-semibold text-gray-800">Reg. CRT/TRT:</span> 14110608732</div>
          <div><span class="font-semibold text-gray-800">CREA/CAU:</span> 0131331400</div>
          <div><span class="font-semibold text-gray-800">Cred. CBMES:</span> 131905</div>
          <div class="col-span-2"><span class="font-semibold text-gray-800">CNPJ:</span> 57.015.293/0001-06</div>
        </div>
      </div>
    </div>

    <div class="text-center font-bold text-[10px] tracking-widest text-[#b51f2b] uppercase mb-1">Documento Técnico</div>
    <h1 class="text-xl font-extrabold text-center uppercase tracking-tight text-gray-950 pb-3 mb-4 border-b border-gray-300">
      ${escapeHtml(reportTitle)}
    </h1>

    <!-- Metadata Grid -->
    <div class="border border-gray-300 rounded-md overflow-hidden grid grid-cols-2 text-xs mb-4">
      <div class="p-2 border-r border-b border-gray-200 bg-white">
        <span class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cliente / Contratante</span>
        <strong class="text-gray-900">${escapeHtml(record.client || 'Não informado')}</strong>
      </div>
      <div class="p-2 border-b border-gray-200 bg-white">
        <span class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Data do Atendimento</span>
        <strong class="text-gray-900">${formatDate(record.inspectionDate) || 'Não informada'}</strong>
      </div>
      ${
        record.legalName
          ? `<div class="p-2 border-r border-b border-gray-200 bg-white">
              <span class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Razão Social</span>
              <strong class="text-gray-900">${escapeHtml(record.legalName)}</strong>
            </div>`
          : ''
      }
      ${
        record.cnpj
          ? `<div class="p-2 border-b border-gray-200 bg-white">
              <span class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">CNPJ</span>
              <strong class="text-gray-900">${escapeHtml(record.cnpj)}</strong>
            </div>`
          : ''
      }
      <div class="p-2 col-span-2 border-b border-gray-200 bg-white">
        <span class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Local do Atendimento / Endereço</span>
        <strong class="text-gray-900">${escapeHtml(record.address || 'Não informado')}</strong>
      </div>
      <div class="p-2 border-r border-gray-200 bg-white">
        <span class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tipo de Serviço</span>
        <strong class="text-gray-900">${escapeHtml(record.serviceType || 'Inspeção técnica')}</strong>
      </div>
      <div class="p-2 bg-white">
        <span class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Responsável pelo Atendimento</span>
        <strong class="text-gray-900">${escapeHtml(record.inspector || 'Nivaldo Miranda Junior')}</strong>
      </div>
    </div>

    <!-- Escopo -->
    <div class="p-3 bg-gray-50 border-l-4 border-l-[#b51f2b] rounded-r-md text-gray-700 text-xs mb-4">
      <h2 class="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Objeto e Escopo</h2>
      <p class="leading-relaxed">
        Este documento registra os dados do local, os itens verificados, as condições apuradas, os serviços executados e os registros fotográficos vinculados a este atendimento técnico, conforme inspeção e testes realizados.
      </p>
    </div>
  `;

  // Condomínio sections
  if (!isApt) {
    out += `
      <section class="border border-gray-300 rounded-md p-3 mb-4 bg-white">
        <div class="bg-gray-800 text-white font-extrabold text-xs px-3 py-1.5 -mx-3 -mt-3 mb-3 rounded-t border-l-4 border-l-[#ffc928] flex justify-between items-center">
          <span>CENTRAL DE GÁS</span>
          <span class="text-[10px] font-normal text-gray-300">Tipo de gás: ${escapeHtml(record.condoGasType || 'Não informado')}</span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs mb-2">
          ${record.centralCylinderType ? `<div><strong>Tipo de recipiente:</strong> ${escapeHtml(record.centralCylinderType)}</div>` : ''}
          ${record.centralCylinderQty ? `<div><strong>Quantidade de cilindros/tanques:</strong> ${escapeHtml(record.centralCylinderQty)}</div>` : ''}
          ${record.quickShutoffValve ? `<div><strong>Válvula de corte rápido:</strong> ${escapeHtml(record.quickShutoffValve)}</div>` : ''}
          ${record.centralSignage ? `<div><strong>Sinalização da central:</strong> ${escapeHtml(record.centralSignage)} ${record.centralSignageNt18 ? `(Conforme NT 18: ${escapeHtml(record.centralSignageNt18)})` : ''}</div>` : ''}
          ${record.centralDrainDistanceStatus ? `<div class="col-span-2"><strong>Afastamento de ralos (&gt;= 1,5m):</strong> ${escapeHtml(record.centralDrainDistanceStatus)} ${record.centralDrainMeasuredDistance ? `— ${escapeHtml(record.centralDrainMeasuredDistance)}m medidos` : ''}</div>` : ''}
        </div>

        <!-- Regulador e Flexíveis Central -->
        <div class="space-y-1.5 pt-2 border-t border-gray-200">
          ${record.centralRegModel ? `<div><strong>Modelo do regulador:</strong> ${escapeHtml(record.centralRegModel)}</div>` : ''}
          ${record.centralRegExpiry ? `<div><strong>Validade do regulador:</strong> ${formatDate(record.centralRegExpiry)}</div>` : ''}
          ${record.centralFlexExpiry ? `<div><strong>Validade dos pigtails/mangueiras:</strong> ${formatDate(record.centralFlexExpiry)}</div>` : ''}
          ${record.centralNotes ? `<div class="mt-2 text-xs text-gray-700"><strong>Observações da central:</strong> ${escapeHtml(record.centralNotes)}</div>` : ''}
        </div>
      </section>
    `;

    // Special areas
    if (record.hasLeisureArea === 'Sim' || record.hasStaffKitchen === 'Sim') {
      out += `
        <div class="grid grid-cols-2 gap-3 mb-4">
          ${
            record.hasLeisureArea === 'Sim'
              ? `<div class="border border-gray-300 rounded-md p-3 bg-white">
                  <h3 class="font-bold text-xs text-red-900 border-b border-gray-200 pb-1 mb-2">Área de Lazer</h3>
                  <p class="text-xs text-gray-700">${escapeHtml(record.leisureAreaNotes || 'Inspecionado conforme padrão de segurança.')}</p>
                </div>`
              : ''
          }
          ${
            record.hasStaffKitchen === 'Sim'
              ? `<div class="border border-gray-300 rounded-md p-3 bg-white">
                  <h3 class="font-bold text-xs text-red-900 border-b border-gray-200 pb-1 mb-2">Cozinha dos Funcionários</h3>
                  <p class="text-xs text-gray-700">${escapeHtml(record.staffKitchenNotes || 'Inspecionado conforme padrão de segurança.')}</p>
                </div>`
              : ''
          }
        </div>
      `;
    }

    // Floors Inspection
    if (record.blocks && record.blocks.length > 0) {
      record.blocks.forEach((block) => {
        out += `
          <div class="border border-gray-300 rounded-md p-3 mb-4 bg-white">
            <div class="bg-gray-800 text-white font-extrabold text-xs px-3 py-1.5 -mx-3 -mt-3 mb-3 rounded-t border-l-4 border-l-[#ffc928]">
              ${escapeHtml(block.name.toUpperCase())} — INSPEÇÃO POR ANDAR
            </div>
            <div class="grid grid-cols-2 gap-2">
        `;

        const floorNums = Object.keys(block.floors)
          .map(Number)
          .sort((a, b) => b - a);

        floorNums.forEach((fn) => {
          if (record.deletedFloorNumbers?.includes(fn)) return;
          const fl = block.floors[fn];
          if (!fl) return;

          const isGood = fl.isGoodCondition && !fl.hasLeak && !fl.hasRepair;
          out += `
            <div class="border rounded p-2 text-[11px] ${
              isGood ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-200'
            }">
              <div class="font-bold text-gray-900 mb-1 flex items-center justify-between">
                <span>${escapeHtml(fl.name || `${fn}º Andar`)}</span>
                ${
                  isGood
                    ? '<span class="text-green-700 font-extrabold text-[10px]">✔ Em boas condições</span>'
                    : fl.hasLeak
                    ? '<span class="text-red-700 font-extrabold text-[10px]">⚠ Vazamento</span>'
                    : ''
                }
              </div>
              <div class="text-gray-600 space-y-0.5">
                <div>Reguladores: ${fl.regCount} ${fl.regModel ? `(${escapeHtml(fl.regModel)})` : ''} | Medidores: ${fl.meterCount} ${fl.meterModel ? `(${escapeHtml(fl.meterModel)})` : ''}</div>
                ${fl.hasLeak && fl.leakLocation ? `<div class="text-red-700 font-semibold">Local do vazamento: ${escapeHtml(fl.leakLocation)}</div>` : ''}
                ${fl.notes ? `<div class="italic">${escapeHtml(fl.notes)}</div>` : ''}
              </div>
            </div>
          `;
        });

        out += `
            </div>
          </div>
        `;
      });
    }

    // Building Conditions
    if (record.buildingVentilationDuct || record.shaftDoorMaterial || record.condoPipeMaterial) {
      out += `
        <div class="border border-gray-200 rounded-md p-3 mb-4 bg-gray-50 text-xs">
          <h3 class="font-bold text-gray-900 mb-2">Estrutura e Edificação:</h3>
          <div class="grid grid-cols-3 gap-2">
            ${record.buildingVentilationDuct ? `<div><strong>Duto de ventilação:</strong> ${escapeHtml(record.buildingVentilationDuct)}</div>` : ''}
            ${record.shaftDoorMaterial ? `<div><strong>Portas do shaft:</strong> ${escapeHtml(record.shaftDoorMaterial)}</div>` : ''}
            ${record.condoPipeMaterial ? `<div><strong>Tubulação:</strong> ${escapeHtml(record.condoPipeMaterial)}</div>` : ''}
          </div>
        </div>
      `;
    }
  }

  // Apartment Mode Details
  if (isApt) {
    const apt = record.apartment;
    out += `
      <section class="border border-gray-300 rounded-md p-4 mb-4 bg-white">
        <div class="bg-gray-800 text-white font-extrabold text-xs px-3 py-1.5 -mx-4 -mt-4 mb-3 rounded-t border-l-4 border-l-[#ffc928] flex justify-between items-center">
          <span>UNIDADE / APARTAMENTO: ${escapeHtml(apt.number || 'Não informado')}</span>
          ${apt.resident ? `<span class="text-gray-300 font-normal">Responsável: ${escapeHtml(apt.resident)}</span>` : ''}
        </div>

        ${
          apt.electricalStatus
            ? `<div class="mb-3 p-2.5 rounded bg-gray-50 border border-gray-200 text-xs">
                <strong>Parte Elétrica:</strong> ${
                  apt.electricalStatus === 'conforme'
                    ? '<span class="text-green-700 font-bold">Conforme</span>'
                    : '<span class="text-red-700 font-bold">Não Conforme</span>'
                }
                ${apt.electricalNotes ? `<div class="mt-1 text-gray-700">${escapeHtml(apt.electricalNotes)}</div>` : ''}
              </div>`
            : ''
        }

        ${
          apt.workNotes
            ? `<div class="mb-3 text-xs">
                <strong class="text-gray-900 block mb-1">Serviços Executados e Ocorrências:</strong>
                <p class="text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-200 leading-relaxed">${escapeHtml(apt.workNotes)}</p>
              </div>`
            : ''
        }

        ${
          apt.installedItems?.materials
            ? `<div class="mb-3 text-xs">
                <strong>Materiais Utilizados:</strong> ${escapeHtml(apt.installedItems.materials)}
              </div>`
            : ''
        }

        ${
          apt.conclusion
            ? `<div class="p-3 bg-red-50/70 border border-red-200 rounded-md text-xs mt-3">
                <strong class="text-red-900 block mb-1">Conclusão do Atendimento:</strong>
                <p class="text-gray-800">${escapeHtml(apt.conclusion)}</p>
              </div>`
            : ''
        }
      </section>
    `;

    // Leak test table if present
    if (record.serviceType === 'Teste de estanqueidade' || record.apartment.services.leakTest) {
      const lt = record.leakTest;
      out += `
        <section class="border border-gray-300 rounded-md p-3 mb-4 bg-white text-xs">
          <h3 class="font-bold text-sm text-[#b51f2b] border-b border-gray-200 pb-1 mb-2">
            Laudo do Teste de Estanqueidade
          </h3>
          <div class="grid grid-cols-2 gap-2 mb-3">
            <div><strong>Início:</strong> ${escapeHtml(lt.startTime || '--:--')} | <strong>Término:</strong> ${escapeHtml(lt.endTime || '--:--')}</div>
            <div><strong>Equipamento:</strong> ${escapeHtml(lt.equipment || 'Manômetro')}</div>
            <div><strong>Fabricante:</strong> ${escapeHtml(lt.manufacturer || 'Não informado')}</div>
            <div><strong>Calibração:</strong> ${formatDate(lt.calibrationDate)} (Validade: ${formatDate(lt.calibrationExpiry)})</div>
          </div>

          <div class="p-2.5 bg-red-50/50 border border-red-200 rounded text-[11px] text-gray-800 mb-2">
            <strong>Declaração Técnica:</strong> Informo, sob as penalidades civis e criminais, e na condição de Responsável Técnico pelo Laudo de Estanqueidade da rede de distribuição interna de gás combustível (GN/GLP) da edificação supracitada, que o sistema foi dimensionado e ensaiado conforme as normas ABNT NBR 15526:2012 e CBMES NT 18.
          </div>
        </section>
      `;
    }
  }

  // General Photos
  if (record.generalPhotos && record.generalPhotos.length > 0) {
    out += `
      <section class="mb-4">
        <h3 class="font-bold text-xs text-gray-900 uppercase tracking-wide mb-2 pb-1 border-b border-gray-200">
          Registros Fotográficos
        </h3>
        <div class="grid grid-cols-2 gap-3">
    `;

    record.generalPhotos.forEach((src, idx) => {
      const caption = record.photoCaptions?.[`general_${idx}`] || `Foto ${idx + 1}`;
      out += `
        <figure class="border border-gray-200 rounded-lg p-2 bg-gray-50 flex flex-col items-center">
          <img src="${src}" alt="${escapeHtml(caption)}" class="max-h-56 max-w-full object-contain rounded mb-1.5" />
          <figcaption class="text-[11px] text-gray-600 text-center font-medium">${escapeHtml(caption)}</figcaption>
        </figure>
      `;
    });

    out += `
        </div>
      </section>
    `;
  }

  // General Conclusion & Notes
  if (record.generalNotes || record.conclusionOk || record.conclusionCorrections || record.conclusionLeak) {
    out += `
      <div class="border border-gray-300 rounded-md p-3 mb-4 bg-gray-50 text-xs">
        <h3 class="font-bold text-gray-900 mb-1.5">Conclusão da Inspeção:</h3>
        <div class="flex flex-wrap gap-2 mb-2">
          ${record.conclusionOk ? '<span class="bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">✔ Sistema em condições de uso</span>' : ''}
          ${record.conclusionCorrections ? '<span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">⚠ Necessita correções</span>' : ''}
          ${record.conclusionLeak ? '<span class="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">❌ Vazamento identificado</span>' : ''}
          ${record.conclusionRetest ? '<span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">🔄 Reinspeção recomendada</span>' : ''}
        </div>
        ${record.generalNotes ? `<p class="text-gray-700 leading-relaxed">${escapeHtml(record.generalNotes)}</p>` : ''}
      </div>
    `;
  }

  // Signatures
  out += `
    <div class="mt-8 pt-4 border-t-2 border-gray-300 grid grid-cols-2 gap-8 text-center text-xs">
      <div>
        <p class="font-bold text-gray-900 mb-1">Profissional Responsável Técnico</p>
        <div class="h-16 flex items-center justify-center">
          ${
            record.signatureImage
              ? `<img src="${record.signatureImage}" alt="Assinatura do Profissional" class="max-h-16 max-w-[200px] object-contain" />`
              : '<div class="text-gray-400 italic text-[11px]">(Assinatura digital)</div>'
          }
        </div>
        <div class="border-t border-gray-400 pt-1 mt-1 font-semibold text-gray-800">
          ${escapeHtml(record.signerName || record.inspector || 'Nivaldo Miranda Junior')}
        </div>
        <div class="text-[10px] text-gray-500">Técnico Responsável • GAS TECH</div>
      </div>

      <div>
        <p class="font-bold text-gray-900 mb-1">Acompanhante / Cliente</p>
        <div class="h-16 flex items-center justify-center">
          ${
            record.witnessSignatureImage
              ? `<img src="${record.witnessSignatureImage}" alt="Assinatura do Acompanhante" class="max-h-16 max-w-[200px] object-contain" />`
              : '<div class="text-gray-400 italic text-[11px]">(Assinatura digital)</div>'
          }
        </div>
        <div class="border-t border-gray-400 pt-1 mt-1 font-semibold text-gray-800">
          ${escapeHtml(record.witnessName || 'Acompanhante da inspeção')}
        </div>
        <div class="text-[10px] text-gray-500">Cliente / Morador / Síndico</div>
      </div>
    </div>
  </div>
  `;

  return out;
}
