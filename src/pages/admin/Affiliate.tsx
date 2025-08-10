import { AdminGuard } from '@/hooks/useAdminGuard';
import AdminAffiliate from '@/pages/AdminAffiliate';

export default function AffiliatePage() {
  return (
    <AdminGuard>
      <AdminAffiliate />
    </AdminGuard>
  );
}
