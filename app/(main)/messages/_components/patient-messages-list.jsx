"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Download,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESPONDED: "bg-green-100 text-green-800",
  RESOLVED: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  NORMAL: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

const messageTypeColors = {
  GENERAL: "bg-gray-100 text-gray-800",
  PRESCRIPTION: "bg-purple-100 text-purple-800",
  MEDICAL_UPDATE: "bg-green-100 text-green-800",
  APPOINTMENT: "bg-blue-100 text-blue-800",
  BILLING: "bg-yellow-100 text-yellow-800",
  COMPLAINT: "bg-red-100 text-red-800",
};

const statusIcons = {
  PENDING: Clock,
  IN_PROGRESS: AlertCircle,
  RESPONDED: CheckCircle,
  RESOLVED: CheckCircle,
  CLOSED: CheckCircle,
};

export function PatientMessagesList({ messages }) {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
  };

  const handleDownloadAttachment = (attachment) => {
    try {
      const attachmentData = typeof attachment === 'string' ? JSON.parse(attachment) : attachment;
      const link = document.createElement('a');
      link.href = attachmentData.path;
      link.download = attachmentData.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Messages Yet
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            You haven't sent any messages to the admin yet. Use the "New Message" tab to start a conversation or submit a prescription.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {messages.map((message) => {
          const StatusIcon = statusIcons[message.status];
          
          return (
            <Card key={message.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{message.subject}</CardTitle>
                      <Badge className={statusColors[message.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {message.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>#{message.messageNumber}</span>
                      <Badge className={messageTypeColors[message.messageType]}>
                        {message.messageType.replace('_', ' ')}
                      </Badge>
                      <Badge className={priorityColors[message.priority]}>
                        {message.priority}
                      </Badge>
                      <span>{format(new Date(message.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewMessage(message)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-700 line-clamp-2 mb-3">
                  {message.message}
                </p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{message.attachments.length} attachment(s)</span>
                  </div>
                )}
                
                {/* Admin Response Hidden */}
                {/* {message.adminResponse && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Admin Response
                      </span>
                      {message.respondedAt && (
                        <span className="text-xs text-green-600">
                          {format(new Date(message.respondedAt), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-green-700 line-clamp-2">
                      {message.adminResponse}
                    </p>
                  </div>
                )} */}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <DialogTitle className="text-xl">
                    {selectedMessage.subject}
                  </DialogTitle>
                  <Badge className={statusColors[selectedMessage.status]}>
                    {selectedMessage.status.replace('_', ' ')}
                  </Badge>
                </div>
                <DialogDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <span>#{selectedMessage.messageNumber}</span>
                    <Badge className={messageTypeColors[selectedMessage.messageType]}>
                      {selectedMessage.messageType.replace('_', ' ')}
                    </Badge>
                    <Badge className={priorityColors[selectedMessage.priority]}>
                      {selectedMessage.priority}
                    </Badge>
                    <span>{format(new Date(selectedMessage.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Message</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment, index) => {
                        const attachmentData = typeof attachment === 'string' ? JSON.parse(attachment) : attachment;
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium">
                                {attachmentData.originalName}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({(attachmentData.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadAttachment(attachment)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Admin Response Hidden */}
                  {/* {selectedMessage.adminResponse && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">Admin Response</h4>
                        {selectedMessage.respondedAt && (
                          <span className="text-sm text-gray-600">
                            {format(new Date(selectedMessage.respondedAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        )}
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-700 whitespace-pre-wrap">
                          {selectedMessage.adminResponse}
                        </p>
                      </div>
                    </div>
                  </> */}
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}