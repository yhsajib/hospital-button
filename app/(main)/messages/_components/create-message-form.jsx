"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  Send,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const messageSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  messageType: z.enum(["GENERAL", "PRESCRIPTION", "MEDICAL_UPDATE", "APPOINTMENT", "BILLING", "COMPLAINT"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  message: z.string().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'image/webp'
];

export function CreateMessageForm() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      subject: "",
      messageType: "GENERAL",
      priority: "NORMAL",
      message: "",
    },
  });

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only PDF, JPEG, PNG, and WebP files are allowed.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 10MB limit.`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast({
        title: "File Upload Error",
        description: errors.join("\n"),
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    // Reset the input
    event.target.value = "";
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Add form data
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      // Add files
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/patient-messages', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      toast({
        title: "Message Sent Successfully",
        description: `Your message has been sent with ID: ${result.messageNumber}`,
      });

      // Reset form and files
      form.reset();
      setSelectedFiles([]);
      
      // Refresh the page to show the new message
      router.refresh();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send New Message</CardTitle>
        <CardDescription>
          Send a message to the admin or submit prescription files for review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="messageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select message type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GENERAL">General Inquiry</SelectItem>
                        <SelectItem value="PRESCRIPTION">Prescription Submission</SelectItem>
                        <SelectItem value="MEDICAL_UPDATE">Medical Update</SelectItem>
                        <SelectItem value="APPOINTMENT">Appointment Related</SelectItem>
                        <SelectItem value="BILLING">Billing Question</SelectItem>
                        <SelectItem value="COMPLAINT">Complaint</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter message subject"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of your message (max 200 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your message here..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed message content (max 2000 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Attachments (Optional)
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload prescription images or documents (PDF, JPEG, PNG, WebP - Max 10MB each)
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm font-medium">Click to upload files</span>
                  <span className="text-xs text-gray-500">
                    or drag and drop your files here
                  </span>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Selected Files:</h4>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {form.watch("messageType") === "PRESCRIPTION" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  For prescription submissions, please ensure all prescription images are clear and readable. 
                  Include all pages if your prescription spans multiple pages.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}