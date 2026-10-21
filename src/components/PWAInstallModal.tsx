import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, Share2, HelpCircle, X, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#141518] via-[#24262b] to-[#303238] p-5 text-white flex items-center justify-between border-b-4 border-[#ffc928]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
              <img src="/pwa-192x192.png" alt="Logo GAS TECH" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white">
                Instalar GAS TECH
              </h3>
              <p className="text-xs text-gray-300">
                Instalação direta no celular (APK / PWA)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-gray-700">
          {installedSuccess ? (
            <div className="text-center py-4 space-y-2">
              <CheckCircle className="w-14 h-14 text-green-600 mx-auto animate-bounce" />
              <h4 className="font-bold text-lg text-gray-900">Aplicativo Instalado!</h4>
              <p className="text-sm text-gray-600">
                O ícone da GAS TECH foi adicionado à sua tela inicial.
              </p>
            </div>
          ) : isInstalled ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-green-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-green-900">Aplicativo já instalado</h4>
                <p className="text-xs text-green-700 mt-1">
                  Você já está executando o aplicativo no modo instalado (APK WebAPK / Standalone).
                  O sistema continuará funcionando offline sem necessidade de nova instalação.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  Vantagens do Aplicativo no Celular:
                </div>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Funciona 100% <strong>sem internet</strong> durante as vistorias;</li>
                  <li>Acesso rápido pela <strong>tela de início</strong> com ícone da GAS TECH;</li>
                  <li>Tela cheia sem barras de navegador;</li>
                  <li>Armazenamento seguro das fotos, laudos e assinaturas.</li>
                </ul>
              </div>

              {isInstallable ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-sm shadow-lg hover:from-red-700 hover:to-red-900 active:scale-98 transition cursor-pointer"
                >
                  <Download className="w-5 h-5 text-yellow-300" />
                  Instalar Agora no Aparelho (APK)
                </button>
              ) : isAndroid ? (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2 text-xs text-blue-900">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    Como instalar no Android:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior do navegador;</li>
                    <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>;</li>
                    <li>O Android gerará o <strong>APK nativo (WebAPK)</strong> diretamente na sua lista de aplicativos.</li>
                  </ol>
                </div>
              ) : isIOS ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-xs text-gray-800">
                  <div className="font-bold flex items-center gap-1.5 text-sm text-gray-900">
                    <Share2 className="w-4 h-4 text-red-600" />
                    Como instalar no iPhone / iPad (iOS):
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>No Safari, toque no botão <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima);</li>
                    <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>;</li>
                    <li>Toque em <strong>"Adicionar"</strong> no canto superior direito.</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    No computador ou tablet, clique no ícone de <strong>instalar aplicativo</strong> na barra de endereços do Chrome/Edge ou use o menu do navegador.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="pt-2 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
