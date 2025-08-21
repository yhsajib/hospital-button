"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Search, Download, Eye, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { downloadTestReportPDF } from "@/lib/pdf-generator";

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

export default function TestReportsPage() {
  const { user, isLoaded } = useUser();
  const [testReports, setTestReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [testTypeFilter, setTestTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [testTypes, setTestTypes] = useState([]);

  // Fetch test reports
  useEffect(() => {
    if (isLoaded && user) {
      fetchTestReports();
      fetchTestTypes();
    }
  }, [isLoaded, user]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchTestTypes = async () => {
    try {
      const response = await fetch('/api/test-types');
      const data = await response.json();
      if (response.ok) {
        setTestTypes(data.testTypes || []);
      }
    } catch (error) {
      console.error('Failed to fetch test types:', error);
    }
  };

  // Filter test reports
  const filteredReports = testReports.filter(report => {
    const matchesSearch = report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.testType?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = testTypeFilter === "all" || report.testTypeId === testTypeFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const reportDate = new Date(report.testDate);
      const now = new Date();
      const daysDiff = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "7days":
          matchesDate = daysDiff <= 7;
          break;
        case "30days":
          matchesDate = daysDiff <= 30;
          break;
        case "90days":
          matchesDate = daysDiff <= 90;
          break;
        case "1year":
          matchesDate = daysDiff <= 365;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Sort reports by test date (newest first)
  const sortedReports = filteredReports.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));

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

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your test reports...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Please sign in to view your test reports</p>
              <p className="text-muted-foreground">You need to be logged in to access your medical test reports.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Test Reports</h1>
            <p className="text-muted-foreground">View and download your medical test reports</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{sortedReports.length} report{sortedReports.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                  Search Reports
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by report number or test type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status-filter" className="text-sm font-medium mb-2 block">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type-filter" className="text-sm font-medium mb-2 block">
                  Test Type
                </Label>
                <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="All test types" />
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
              
              <div>
                <Label htmlFor="date-filter" className="text-sm font-medium mb-2 block">
                  Date Range
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="date-filter">
                    <SelectValue placeholder="All dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 3 months</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Reports List */}
        <div className="space-y-4">
          {sortedReports.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-48">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No test reports found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all" || testTypeFilter !== "all" || dateFilter !== "all"
                      ? "Try adjusting your filters to see more results."
                      : "You don't have any test reports yet. Your reports will appear here once they're available."}
                  </p>
                  {(searchTerm || statusFilter !== "all" || testTypeFilter !== "all" || dateFilter !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setTestTypeFilter("all");
                        setDateFilter("all");
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            sortedReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{report.reportNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            {report.testType?.name} • {report.testType?.category}
                          </p>
                        </div>
                        <Badge className={statusColors[report.status]}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Test Date:</span>
                          <span className="font-medium">{new Date(report.testDate).toLocaleDateString()}</span>
                        </div>
                        
                        {report.reportDate && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Report Date:</span>
                            <span className="font-medium">{new Date(report.reportDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {report.conductedBy && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Conducted by:</span>
                            <span className="font-medium">{report.conductedBy}</span>
                          </div>
                        )}
                      </div>
                      
                      {report.summary && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Summary</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{report.summary}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedReport(report);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      
                      {report.status === 'COMPLETED' || report.status === 'REVIEWED' ? (
                        <Button onClick={() => handleDownloadPDF(report)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      ) : (
                        <Button disabled variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          PDF Pending
                        </Button>
                      )}
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
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Test Report Details
              </DialogTitle>
              <DialogDescription>
                Detailed view of your test report
              </DialogDescription>
            </DialogHeader>
            
            {selectedReport && (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Report Number</Label>
                      <p className="font-semibold text-lg">{selectedReport.reportNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge className={statusColors[selectedReport.status]}>
                          {selectedReport.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Test Type</Label>
                      <p className="font-medium">{selectedReport.testType?.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedReport.testType?.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Test Date</Label>
                      <p className="font-medium">{new Date(selectedReport.testDate).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Report Content */}
                <div className="space-y-4">
                  {selectedReport.summary && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Summary</Label>
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm leading-relaxed">{selectedReport.summary}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedReport.findings && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Findings</Label>
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm leading-relaxed">{selectedReport.findings}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedReport.recommendations && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Recommendations</Label>
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm leading-relaxed">{selectedReport.recommendations}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Test Results */}
                {selectedReport.testResults && selectedReport.testResults.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Test Results</Label>
                    <div className="mt-3 space-y-3">
                      {selectedReport.testResults.map((result) => (
                        <div key={result.id} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{result.parameterName}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>
                                <strong>Value:</strong> {result.value} {result.unit}
                              </span>
                              {result.referenceRange && (
                                <span>
                                  <strong>Normal Range:</strong> {result.referenceRange}
                                </span>
                              )}
                            </div>
                            {result.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{result.notes}</p>
                            )}
                          </div>
                          <Badge className={resultStatusColors[result.status]}>
                            {result.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {selectedReport.conductedBy && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Conducted By</Label>
                      <p className="font-medium">{selectedReport.conductedBy}</p>
                    </div>
                  )}
                  {selectedReport.reviewedBy && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Reviewed By</Label>
                      <p className="font-medium">{selectedReport.reviewedBy}</p>
                    </div>
                  )}
                  {selectedReport.reportDate && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Report Date</Label>
                      <p className="font-medium">{new Date(selectedReport.reportDate).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                
                {selectedReport.notes && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium text-muted-foreground">Additional Notes</Label>
                    <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm leading-relaxed">{selectedReport.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}