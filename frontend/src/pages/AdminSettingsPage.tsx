import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

const PAYMENT_METHODS = [
  { name: 'Tarjeta de crédito/débito', enabled: true },
  { name: 'PSE', enabled: true },
  { name: 'PayPal', enabled: false },
  { name: 'Transferencia bancaria', enabled: false },
];

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('RitmoFlow');
  const [contactEmail, setContactEmail] = useState('contacto@ritmoflow.com');
  const [taxRate, setTaxRate] = useState('19');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-4xl tracking-wide mb-8">CONFIGURACIÓN DEL SISTEMA</h1>

      <div className="card-light p-6 max-w-2xl">
        <h2 className="font-display text-xl tracking-wide mb-6">CONFIGURACIÓN GENERAL</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg mb-4 text-[#E91E8C]">Información del sitio</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre del sitio</label>
                <input
                  className="input-field"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email de contacto</label>
                <input
                  type="email"
                  className="input-field"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#333] pt-6">
            <h3 className="text-lg mb-4 text-[#E91E8C]">Métodos de pago</h3>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <div key={method.name} className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl">
                  <span>{method.name}</span>
                  <span className={`px-4 py-2 rounded-lg text-sm ${
                    method.enabled ? 'bg-green-900/30 text-green-400' : 'bg-[#333] text-gray-400'
                  }`}>
                    {method.enabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#333] pt-6">
            <h3 className="text-lg mb-4 text-[#E91E8C]">Impuestos</h3>
            <label className="block text-sm text-gray-400 mb-2">IVA (%)</label>
            <input
              type="number"
              className="input-field max-w-xs"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>

          <div className="border-t border-[#333] pt-6 flex items-center gap-4">
            <button onClick={handleSave} className="gradient-btn">
              Guardar cambios
            </button>
            {saved && <span className="text-sm text-green-400">Cambios guardados</span>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
