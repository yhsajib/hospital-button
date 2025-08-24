import { verifyAdmin } from "@/actions/admin";
import { redirect } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, AlertCircle, Users, CreditCard, Pill, Package, Bed, FileText, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Admin Settings - MediMeet",
  description: "Manage doctors, patients, and platform settings",
};

export default async function AdminLayout({ children }) {
  // Verify the user has admin access
  const isAdmin = await verifyAdmin();

  // Redirect if not an admin
  if (!isAdmin) {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader icon={<ShieldCheck />} title="Admin Settings" />

      {/* Vertical tabs on larger screens / Horizontal tabs on mobile */}
      <Tabs
        defaultValue="pending"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <TabsList className="md:col-span-1 bg-muted/30 border h-14 md:h-80 flex sm:flex-row md:flex-col w-full p-2 md:p-1 rounded-md md:space-y-2 sm:space-x-2 md:space-x-0 sticky top-24 md:top-28 z-10">
          <TabsTrigger
            value="pending"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <AlertCircle className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Pending Verification</span>
          </TabsTrigger>
          <TabsTrigger
            value="doctors"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Users className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Doctors</span>
          </TabsTrigger>

          <TabsTrigger
            value="medicine"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Pill className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Medicine</span>
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Package className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger
            value="cabins"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Bed className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Cabins</span>
          </TabsTrigger>
          <TabsTrigger
            value="test-reports"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <FileText className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Test Reports</span>
          </TabsTrigger>
          {/* Messages Tab Hidden */}
          {/* <TabsTrigger
            value="messages"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <MessageSquare className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Messages</span>
          </TabsTrigger> */}
        </TabsList>
        <div className="md:col-span-3">
          {/* Render tab content based on selected value */}
          {/* Example: Use a router or conditional rendering for tab content */}
          {children}
        </div>
      </Tabs>
    </div>
  );
}
