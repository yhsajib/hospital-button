import { getPatientMessages } from "@/actions/patient-messages";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { MessageSquare } from "lucide-react";
import { PatientMessagesList } from "./_components/patient-messages-list";
import { CreateMessageForm } from "./_components/create-message-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Messages - MediMeet",
  description: "Communicate with admin and submit prescriptions",
};

export default async function MessagesPage() {
  // Check if user is authenticated and is a patient
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  // Fetch patient messages
  const { messages } = await getPatientMessages();

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        icon={<MessageSquare />} 
        title="Messages" 
        description="Communicate with admin and submit prescriptions"
      />

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messages">My Messages</TabsTrigger>
          <TabsTrigger value="new">New Message</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="mt-6">
          <PatientMessagesList messages={messages} />
        </TabsContent>
        
        <TabsContent value="new" className="mt-6">
          <CreateMessageForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}