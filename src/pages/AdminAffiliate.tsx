import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Row = { id: string; timestamp: string; user_id: string|null; partner_name: string; order_url: string; status: string|null };

export default function AdminAffiliate() {
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState({ clicks: 0, orders: 0, commissions: 0 });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('affiliate_clicks')
        .select('id,timestamp,user_id,partner_name,order_url,status')
        .order('timestamp', { ascending: false })
        .limit(200);
      if (!error && data) {
        setRows(data as any);
        const clicks = data.length;
        const orders = data.filter(r => r.status === 'complete').length;
        const commissions = 0; // if you start recording commission_estimate, sum here
        setSummary({ clicks, orders, commissions });
      }
    })();
  }, []);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Clicks" value={summary.clicks} />
        <Card title="Orders" value={summary.orders} />
        <Card title="Est. Commissions" value={`$${summary.commissions.toFixed(2)}`} />
      </div>
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3">Time</th>
              <th className="p-3">User</th>
              <th className="p-3">Partner</th>
              <th className="p-3">URL</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{new Date(r.timestamp).toLocaleString()}</td>
                <td className="p-3">{r.user_id ?? '—'}</td>
                <td className="p-3 capitalize">{r.partner_name}</td>
                <td className="p-3 truncate max-w-xs">{r.order_url}</td>
                <td className="p-3">{r.status ?? 'clicked'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string|number }) {
  return (
    <div className="border rounded-xl p-4">
      <div className="text-gray-500 text-xs uppercase">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
