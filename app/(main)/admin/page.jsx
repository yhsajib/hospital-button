import { TabsContent } from "@/components/ui/tabs";
import { PendingDoctors } from "./components/pending-doctors";
import { VerifiedDoctors } from "./components/verified-doctors";
import { PendingPayouts } from "./components/pending-payouts";
import { AdminOrders } from "./components/admin-orders";
import { AdminCabins } from "./components/admin-cabins";
import AdminMedicinePage from "./medicine";
import { AdminTestReports } from "./components/admin-test-reports";
import {
  getPendingDoctors,
  getVerifiedDoctors,
  getPendingPayouts,
} from "@/actions/admin";

export default async function AdminPage() {
  // Fetch all data in parallel
  const [pendingDoctorsData, verifiedDoctorsData, pendingPayoutsData] =
    await Promise.all([
      getPendingDoctors(),
      getVerifiedDoctors(),
      getPendingPayouts(),
    ]);

  return (
    <>
      <TabsContent value="pending" className="border-none p-0">
        <PendingDoctors doctors={pendingDoctorsData.doctors || []} />
      </TabsContent>

      <TabsContent value="doctors" className="border-none p-0">
        <VerifiedDoctors doctors={verifiedDoctorsData.doctors || []} />
      </TabsContent>

      <TabsContent value="payouts" className="border-none p-0">
        <PendingPayouts payouts={pendingPayoutsData.payouts || []} />
      </TabsContent>

      <AdminMedicinePage />

      <TabsContent value="orders" className="border-none p-0">
        <AdminOrders />
      </TabsContent>

      <TabsContent value="cabins" className="border-none p-0">
        <AdminCabins />
      </TabsContent>

      <TabsContent value="test-reports" className="border-none p-0">
        <AdminTestReports />
      </TabsContent>
    </>
  );
}
