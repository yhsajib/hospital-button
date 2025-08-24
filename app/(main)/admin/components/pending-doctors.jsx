"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, User, Medal, FileText, ExternalLink, Clock, Calendar, Stethoscope } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { updateDoctorStatus } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { useEffect } from "react";
import { BarLoader } from "react-spinners";

export function PendingDoctors({ doctors }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Custom hook for approve/reject server action
  const {
    loading,
    data,
    fn: submitStatusUpdate,
  } = useFetch(updateDoctorStatus);

  // Open doctor details dialog
  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
  };

  // Close doctor details dialog
  const handleCloseDialog = () => {
    setSelectedDoctor(null);
  };

  // Handle approve or reject doctor
  const handleUpdateStatus = async (doctorId, status) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("status", status);

    await submitStatusUpdate(formData);
  };

  useEffect(() => {
    if (data && data?.success) {
      handleCloseDialog();
    }
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 rounded-xl border border-emerald-900/20 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-500/20 rounded-lg p-2">
            <Clock className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pending Doctor Verifications
            </h1>
            <p className="text-emerald-200/80 mt-1">
              Review and approve doctor applications • {doctors.length} pending
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div>
        {doctors.length === 0 ? (
          <Card className="bg-muted/10 border-dashed border-2 border-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-muted/20 rounded-full p-4 mb-4">
                <Stethoscope className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                No pending verification requests at this time. New doctor applications will appear here for review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {doctors.map((doctor, index) => (
              <Card
                key={doctor.id}
                className="group bg-gradient-to-r from-background to-muted/5 border-emerald-900/20 hover:border-emerald-700/40 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Doctor Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                        <User className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {doctor.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-xs px-2 py-1 animate-pulse"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Medal className="h-4 w-4 text-emerald-400" />
                            <span>{doctor.specialty}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-emerald-400" />
                            <span>{doctor.experience} years experience</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                           Applied on {format(new Date(doctor.createdAt), "MMM dd, yyyy")}
                         </p>
                       </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleViewDetails(doctor)}
                         className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-200 group-hover:scale-105"
                       >
                         <FileText className="h-4 w-4 mr-2" />
                         Review Application
                       </Button>
                       <div className="flex gap-2">
                         <Button
                           size="sm"
                           onClick={() => handleUpdateStatus(doctor.id, "REJECTED")}
                           disabled={loading}
                           className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
                           variant="outline"
                         >
                           <X className="h-4 w-4" />
                         </Button>
                         <Button
                           size="sm"
                           onClick={() => handleUpdateStatus(doctor.id, "VERIFIED")}
                           disabled={loading}
                           className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-200"
                           variant="outline"
                         >
                           <Check className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
       </div>

      {/* Doctor Details Dialog */}
      {selectedDoctor && (
        <Dialog open={!!selectedDoctor} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-3">
                  <User className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white mb-1">
                    {selectedDoctor.name}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Review the doctor's information carefully before making a decision
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-8 py-6">
              {/* Basic Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/10 border-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-sm font-medium text-emerald-400">
                        Full Name
                      </h4>
                    </div>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedDoctor.name}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/10 border-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-sm font-medium text-emerald-400">
                        Email Address
                      </h4>
                    </div>
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {selectedDoctor.email}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/10 border-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-sm font-medium text-emerald-400">
                        Application Date
                      </h4>
                    </div>
                    <p className="text-base font-semibold text-gray-900">
                      {format(new Date(selectedDoctor.createdAt), "MMM dd, yyyy")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Professional Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 rounded-lg p-2">
                    <Medal className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Professional Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border-emerald-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="h-4 w-4 text-emerald-400" />
                        <h4 className="text-sm font-medium text-emerald-400">
                          Medical Specialty
                        </h4>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{selectedDoctor.specialty}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border-emerald-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <h4 className="text-sm font-medium text-emerald-400">
                          Experience
                        </h4>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedDoctor.experience} years
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-blue-500/20 md:col-span-2">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <h4 className="text-sm font-medium text-blue-400">
                          Medical Credentials
                        </h4>
                      </div>
                      <Button
                        variant="outline"
                        asChild
                        className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50"
                      >
                        <a
                          href={selectedDoctor.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Credentials Document
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 rounded-lg p-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Service Description
                  </h3>
                </div>
                <Card className="bg-gradient-to-br from-purple-500/5 to-purple-600/5 border-purple-500/20">
                  <CardContent className="p-4">
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {selectedDoctor.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {loading && <BarLoader width={"100%"} color="#36d7b7" />}

            <DialogFooter className="flex gap-3 pt-6 border-t border-emerald-900/20">
              <Button
                variant="outline"
                onClick={() =>
                  handleUpdateStatus(selectedDoctor.id, "REJECTED")
                }
                disabled={loading}
                className="flex-1 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : "Reject Application"}
              </Button>
              <Button
                onClick={() =>
                  handleUpdateStatus(selectedDoctor.id, "VERIFIED")
                }
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
              >
                <Check className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : "Approve Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
