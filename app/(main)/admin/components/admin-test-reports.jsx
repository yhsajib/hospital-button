"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Plus, Edit, Trash2, Eye, Search, Filter, Download, Upload, X, File } from "lucide-react";
import { downloadTestReportPDF } from '@/lib/pdf-generator';
import { toast } from "sonner";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  REVIEWED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800"
};

const resultStatusColors = {
  NORMAL: "bg-green-100 text-green-800",
  ABNORMAL: "bg-orange-100 text-orange-800",
  HIGH: "bg-red-100 text-red-800",
  LOW: "bg-blue-100 text-blue-800",
  CRITICAL: "bg-red-200 text-red-900"
};

export function AdminTestReports() {
  const [testReports, setTestReports] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [testTypeFilter, setTestTypeFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateTypeDialogOpen, setIsCreateTypeDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Form states
  const [reportForm, setReportForm] = useState({
    patientId: "",
    testTypeId: "",
    testDate: "",
    reportDate: "",
    conductedBy: "",
    reviewedBy: "",
    summary: "",
    findings: "",
    recommendations: "",
    notes: "",
    status: "PENDING",
    testResults: [],
    attachments: []
  });

  const [typeForm, setTypeForm] = useState({
    name: "",
    category: "",
    description: "",
    normalRanges: "",
    isActive: true
  });

  // Fetch data
  useEffect(() => {
    fetchTestReports();
    fetchTestTypes();
    fetchPatients();
  }, []);

  const fetchTestReports = async () => {
    try {
      const response = await fetch('/api/test-reports');
      const data = await response.json();
      if (response.ok) {
        setTestReports(data.testReports || []);
      } else {
        toast.error(data.error || 'Failed to fetch test reports');
      }
    } catch (error) {
      toast.error('Failed to fetch test reports');
    }
  };

  // Handle file upload
  const handleFileUpload = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type. Please upload PDF, JPEG, or PNG files.`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      
      return true;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle PDF download
  const handleDownloadPDF = async (report) => {
    try {
      await downloadTestReportPDF(report);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const fetchTestTypes = async () => {
    try {
      const response = await fetch('/api/test-types?includeInactive=true');
      const data = await response.json();
      if (response.ok) {
        setTestTypes(data.testTypes || []);
      } else {
        toast.error(data.error || 'Failed to fetch test types');
      }
    } catch (error) {
      toast.error('Failed to fetch test types');
    }
  };

  const fetchPatients = async () => {
    try {
      // This would need to be implemented in your API
      // For now, we'll use a placeholder
      setPatients([]);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter test reports
  const filteredReports = testReports.filter(report => {
    const matchesSearch = report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.testType?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = testTypeFilter === "all" || report.testTypeId === testTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle create test report
  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      // First create the test report
      const response = await fetch('/api/test-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportForm),
      });
      
      const data = await response.json();
      if (response.ok) {
        const reportId = data.testReport.id;
        
        // Upload files if any
        if (uploadedFiles.length > 0) {
          const formData = new FormData();
          uploadedFiles.forEach(file => {
            formData.append('files', file);
          });
          formData.append('reportId', reportId);
          
          const uploadResponse = await fetch('/api/test-reports/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json();
            toast.error(`Report created but file upload failed: ${uploadError.error}`);
          } else {
            toast.success('Test report created successfully with attachments');
          }
        } else {
          toast.success('Test report created successfully');
        }
        
        setIsCreateDialogOpen(false);
        setReportForm({
          patientId: "",
          testTypeId: "",
          testDate: "",
          reportDate: "",
          conductedBy: "",
          reviewedBy: "",
          summary: "",
          findings: "",
          recommendations: "",
          notes: "",
          status: "PENDING",
          testResults: [],
          attachments: []
        });
        setUploadedFiles([]);
        fetchTestReports();
      } else {
        toast.error(data.error || 'Failed to create test report');
      }
    } catch (error) {
      toast.error('Failed to create test report');
    }
  };

  // Handle create test type
  const handleCreateType = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/test-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typeForm),
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success('Test type created successfully');
        setIsCreateTypeDialogOpen(false);
        setTypeForm({
          name: "",
          category: "",
          description: "",
          normalRanges: "",
          isActive: true
        });
        fetchTestTypes();
      } else {
        toast.error(data.error || 'Failed to create test type');
      }
    } catch (error) {
      toast.error('Failed to create test type');
    }
  };

  // Handle delete test report
  const handleDeleteReport = async (reportId) => {
    try {
      const response = await fetch(`/api/test-reports/${reportId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success('Test report deleted successfully');
        fetchTestReports();
      } else {
        toast.error(data.error || 'Failed to delete test report');
      }
    } catch (error) {
      toast.error('Failed to delete test report');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading test reports...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Test Reports Management</h2>
          <p className="text-muted-foreground">Manage test reports and test types</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateTypeDialogOpen} onOpenChange={setIsCreateTypeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Test Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Test Type</DialogTitle>
                <DialogDescription>
                  Add a new test type to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateType} className="space-y-4">
                <div>
                  <Label htmlFor="typeName">Name</Label>
                  <Input
                    id="typeName"
                    value={typeForm.name}
                    onChange={(e) => setTypeForm({...typeForm, name: e.target.value})}
                    placeholder="e.g., Blood Test"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="typeCategory">Category</Label>
                  <Select value={typeForm.category} onValueChange={(value) => setTypeForm({...typeForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Pathology">Pathology</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="typeDescription">Description</Label>
                  <Textarea
                    id="typeDescription"
                    value={typeForm.description}
                    onChange={(e) => setTypeForm({...typeForm, description: e.target.value})}
                    placeholder="Test description..."
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateTypeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Test Type</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Test Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Test Report</DialogTitle>
                <DialogDescription>
                  Add a new test report to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateReport} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input
                      id="patientId"
                      value={reportForm.patientId}
                      onChange={(e) => setReportForm({...reportForm, patientId: e.target.value})}
                      placeholder="Patient ID"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="testTypeId">Test Type</Label>
                    <Select value={reportForm.testTypeId} onValueChange={(value) => setReportForm({...reportForm, testTypeId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        {testTypes.filter(type => type.isActive).map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} ({type.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testDate">Test Date</Label>
                    <Input
                      id="testDate"
                      type="datetime-local"
                      value={reportForm.testDate}
                      onChange={(e) => setReportForm({...reportForm, testDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reportDate">Report Date</Label>
                    <Input
                      id="reportDate"
                      type="datetime-local"
                      value={reportForm.reportDate}
                      onChange={(e) => setReportForm({...reportForm, reportDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="conductedBy">Conducted By</Label>
                    <Input
                      id="conductedBy"
                      value={reportForm.conductedBy}
                      onChange={(e) => setReportForm({...reportForm, conductedBy: e.target.value})}
                      placeholder="Doctor name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={reportForm.status} onValueChange={(value) => setReportForm({...reportForm, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="REVIEWED">Reviewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={reportForm.summary}
                    onChange={(e) => setReportForm({...reportForm, summary: e.target.value})}
                    placeholder="Test summary..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="findings">Findings</Label>
                  <Textarea
                    id="findings"
                    value={reportForm.findings}
                    onChange={(e) => setReportForm({...reportForm, findings: e.target.value})}
                    placeholder="Test findings..."
                  />
                </div>
                
                {/* File Upload Section */}
                <div>
                  <Label>Upload Test Report Files</Label>
                  <div
                    className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Supported formats: PDF, JPEG, PNG (Max 10MB each)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                  
                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Report</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by report number, patient name, or test type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by test type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Test Types</SelectItem>
                {testTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Test Reports List */}
      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No test reports found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{report.reportNumber}</h3>
                      <Badge className={statusColors[report.status]}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Patient:</strong> {report.patient?.name || 'Unknown'}</p>
                      <p><strong>Test Type:</strong> {report.testType?.name} ({report.testType?.category})</p>
                      <p><strong>Test Date:</strong> {new Date(report.testDate).toLocaleDateString()}</p>
                      {report.conductedBy && <p><strong>Conducted By:</strong> {report.conductedBy}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(report)}
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setReportForm({
                          patientId: report.patientId,
                          testTypeId: report.testTypeId,
                          testDate: report.testDate.split('T')[0],
                          reportDate: report.reportDate?.split('T')[0] || '',
                          conductedBy: report.conductedBy || '',
                          reviewedBy: report.reviewedBy || '',
                          summary: report.summary || '',
                          findings: report.findings || '',
                          recommendations: report.recommendations || '',
                          notes: report.notes || '',
                          status: report.status,
                          testResults: report.testResults || []
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Test Report</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this test report? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteReport(report.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Report Number</Label>
                  <p className="font-medium">{selectedReport.reportNumber}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={statusColors[selectedReport.status]}>
                    {selectedReport.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Patient</Label>
                  <p>{selectedReport.patient?.name}</p>
                </div>
                <div>
                  <Label>Test Type</Label>
                  <p>{selectedReport.testType?.name} ({selectedReport.testType?.category})</p>
                </div>
                <div>
                  <Label>Test Date</Label>
                  <p>{new Date(selectedReport.testDate).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Report Date</Label>
                  <p>{selectedReport.reportDate ? new Date(selectedReport.reportDate).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
              
              {selectedReport.summary && (
                <div>
                  <Label>Summary</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedReport.summary}</p>
                </div>
              )}
              
              {selectedReport.findings && (
                <div>
                  <Label>Findings</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedReport.findings}</p>
                </div>
              )}
              
              {selectedReport.recommendations && (
                <div>
                  <Label>Recommendations</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedReport.recommendations}</p>
                </div>
              )}
              
              {selectedReport.testResults && selectedReport.testResults.length > 0 && (
                <div>
                  <Label>Test Results</Label>
                  <div className="mt-2 space-y-2">
                    {selectedReport.testResults.map((result) => (
                      <div key={result.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <div>
                          <p className="font-medium">{result.parameterName}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.value} {result.unit}
                            {result.referenceRange && ` (Normal: ${result.referenceRange})`}
                          </p>
                        </div>
                        <Badge className={resultStatusColors[result.status]}>
                          {result.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}