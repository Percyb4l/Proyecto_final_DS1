import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../components/AdminLayout';
import { salesApi, dashboardApi } from '../services/api';
import { formatPrice } from '../types';

interface Sale {
  id: number;
  total_amount: number | string;
  payment_method: string;
  status: string;
  billing_name: string;
  client_name?: string;
  created_at: string;
  items: { choreography_title: string; price: number | string }[];
}

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [monthly, setMonthly] = useState<{ month: string; amount: number }[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, count: 0 });

  useEffect(() => {
    salesApi.allSales().then((r) => {
      setSales(r.data);
      const total = r.data.reduce((s: number, sale: Sale) => s + Number(sale.total_amount), 0);
      setMetrics({ total, count: r.data.length });
    }).catch(() => {});
    dashboardApi.admin().then((r) => setMonthly(r.data.monthly_sales)).catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-display text-4xl tracking-wide mb-8">GESTIÓN DE VENTAS</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-light p-6">
          <p className="text-sm text-gray-400 mb-2">Total registrado</p>
          <p className="font-display text-4xl text-[#FF6B1A]">{formatPrice(metrics.total)}</p>
        </div>
        <div className="card-light p-6">
          <p className="text-sm text-gray-400 mb-2">Transacciones</p>
          <p className="font-display text-4xl text-[#FF6B1A]">{metrics.count}</p>
        </div>
        <div className="card-light p-6">
          <p className="text-sm text-gray-400 mb-2">Este mes</p>
          <p className="font-display text-4xl text-[#FF6B1A]">
            {formatPrice(monthly[monthly.length - 1]?.amount || 0)}
          </p>
        </div>
        <div className="card-light p-6">
          <p className="text-sm text-gray-400 mb-2">Método principal</p>
          <p className="font-display text-2xl text-[#FF6B1A]">Tarjeta / PSE</p>
        </div>
      </div>

      <div className="card-light p-6 mb-8">
        <h2 className="font-display text-xl tracking-wide mb-4">VENTAS MENSUALES</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip contentStyle={{ background: '#242424', border: '1px solid #333', borderRadius: 8 }} />
            <Bar dataKey="amount" fill="#FF6B1A" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card-light p-6">
        <h2 className="font-display text-xl tracking-wide mb-4">TRANSACCIONES RECIENTES</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#333] text-left text-xs text-gray-500 uppercase">
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Producto</th>
                <th className="pb-3">Monto</th>
                <th className="pb-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-[#333]/50 hover:bg-[#1A1A1A]">
                  <td className="py-4 text-sm text-gray-400">
                    {new Date(sale.created_at).toLocaleString('es-CO')}
                  </td>
                  <td className="py-4">{sale.client_name || sale.billing_name}</td>
                  <td className="py-4 text-gray-400">
                    {sale.items.map((i) => i.choreography_title).join(', ')}
                  </td>
                  <td className="py-4 font-display text-[#FF6B1A]">{formatPrice(sale.total_amount)}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full text-xs bg-green-900/30 text-green-400 capitalize">
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">Sin ventas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
