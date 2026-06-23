import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { paymentsApi } from '../services/api';
import type { Payment } from '../types';
import { useAuth } from '../context/AuthContext';

export default function PaymentsPage() {
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  const load = () => {
    const api = isAdmin ? paymentsApi.getAll() : paymentsApi.getMy();
    api.then((r) => setPayments(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [isAdmin]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-500/10 text-green-400',
      pending: 'bg-amber-500/10 text-amber-400',
      overdue: 'bg-red-500/10 text-red-400',
    };
    const labels: Record<string, string> = { paid: 'Pagado', pending: 'Pendiente', overdue: 'Vencido' };
    return <span className={`text-xs px-2 py-1 rounded-full ${styles[status]}`}>{labels[status]}</span>;
  };

  const handlePay = async (id: number) => {
    const method = prompt('Método de pago (Efectivo, Transferencia, Tarjeta):', 'Efectivo');
    if (!method) return;
    await paymentsApi.pay(id, { paymentMethod: method });
    load();
  };

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-bold mb-6">{isAdmin ? 'Pagos' : 'Mis pagos'}</h1>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2d1f42]">
              {isAdmin && <th className="table-header">Estudiante</th>}
              <th className="table-header">Clase</th>
              <th className="table-header">Monto</th>
              <th className="table-header">Vencimiento</th>
              <th className="table-header">Estado</th>
              {isAdmin && <th className="table-header">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-[#2d1f42]/50">
                {isAdmin && <td className="table-cell">{p.student_name}</td>}
                <td className="table-cell">{p.class_name}</td>
                <td className="table-cell font-medium">{formatCurrency(p.amount)}</td>
                <td className="table-cell">{new Date(p.due_date).toLocaleDateString('es-CO')}</td>
                <td className="table-cell">{statusBadge(p.status)}</td>
                {isAdmin && (
                  <td className="table-cell">
                    {p.status === 'pending' && (
                      <button onClick={() => handlePay(p.id)} className="text-green-400 hover:text-green-300 flex items-center gap-1 text-sm">
                        <CheckCircle className="w-4 h-4" /> Registrar pago
                      </button>
                    )}
                    {p.status === 'paid' && (
                      <span className="text-gray-500 text-sm">{p.payment_method} · {p.paid_date && new Date(p.paid_date).toLocaleDateString('es-CO')}</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="text-center text-gray-500 py-8">No hay pagos registrados</p>}
      </div>
    </DashboardLayout>
  );
}
