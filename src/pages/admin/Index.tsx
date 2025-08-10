import { Link } from 'react-router-dom';
import { AdminGuard } from '@/hooks/useAdminGuard';

export default function AdminIndex() {
  return (
    <AdminGuard>
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <ul className="list-disc ml-6 space-y-2">
          <li><Link className="text-green-700 underline" to="/admin/affiliate">Affiliate Dashboard</Link></li>
        </ul>
      </main>
    </AdminGuard>
  );
}
