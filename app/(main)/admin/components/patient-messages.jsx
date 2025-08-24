"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Reply,
  Search,
  Filter,
  Loader2,
  Send,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import {
  getAllPatientMessages,
  updatePatientMessage,
  deletePatientMessage,
  getMessageStatistics
} from "@/actions/patient-messages";

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

export function PatientMessages() {
  const [messages, setMessages] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    messageType: "all",
    priority: "all",
    search: ""
  });
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const result = await getAllPatientMessages(filters);
      if (result.success) {
        setMessages(result.messages);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch messages",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await getMessageStatistics();
      if (result.success) {
        setStatistics(result.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStatistics();
  }, [filters]);

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
  };

  const handleRespondToMessage = (message) => {
    setSelectedMessage(message);
    setAdminResponse("");
    setNewStatus(message.status);
    setIsRespondDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedMessage || (!adminResponse.trim() && newStatus === selectedMessage.status)) {
      toast({
        title: "Error",
        description: "Please provide a response or change the status",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        status: newStatus,
        ...(adminResponse.trim() && { adminResponse: adminResponse.trim() })
      };

      const result = await updatePatientMessage(selectedMessage.id, updateData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Message updated successfully",
        });
        setIsRespondDialogOpen(false);
        fetchMessages();
        fetchStatistics();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await deletePatientMessage(messageId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Message deleted successfully",
        });
        fetchMessages();
        fetchStatistics();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.urgent}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.prescriptions}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESPONDED">Responded</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={filters.messageType} onValueChange={(value) => handleFilterChange('messageType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
                  <SelectItem value="MEDICAL_UPDATE">Medical Update</SelectItem>
                  <SelectItem value="APPOINTMENT">Appointment</SelectItem>
                  <SelectItem value="BILLING">Billing</SelectItem>
                  <SelectItem value="COMPLAINT">Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Messages Found
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                No patient messages match your current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => {
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
                        <span>From: {message.patient.name}</span>
                        <Badge className={messageTypeColors[message.messageType]}>
                          {message.messageType.replace('_', ' ')}
                        </Badge>
                        <Badge className={priorityColors[message.priority]}>
                          {message.priority}
                        </Badge>
                        <span>{format(new Date(message.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMessage(message)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRespondToMessage(message)}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Respond
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-700 line-clamp-2 mb-3">
                    {message.message}
                  </p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <FileText className="h-4 w-4" />
                      <span>{message.attachments.length} attachment(s)</span>
                    </div>
                  )}
                  
                  {/* Admin Response Hidden */}
                  {/* {message.adminResponse && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
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
          })
        )}
      </div>

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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
                    <span>From: {selectedMessage.patient.name} ({selectedMessage.patient.email})</span>
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
                    <div>
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
                  </>
                )} */}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Respond Dialog */}
      <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>Respond to Message</DialogTitle>
                <DialogDescription>
                  Responding to: {selectedMessage.subject} (#{selectedMessage.messageNumber})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESPONDED">Responded</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Admin Response (Optional)</label>
                  <Textarea
                    placeholder="Enter your response to the patient..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsRespondDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Update Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}