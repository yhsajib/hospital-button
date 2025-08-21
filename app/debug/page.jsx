import { DebugUser } from '@/components/debug-user';
import { PageHeader } from '@/components/page-header';
import { Bug } from 'lucide-react';

export const metadata = {
  title: 'Debug User - MediMeet',
  description: 'Debug user role and permissions',
};

export default function DebugPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        icon={<Bug />} 
        title="User Debug Information" 
        description="Check your user role and database information"
      />
      
      <div className="mt-8">
        <DebugUser />
      </div>
      
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Copy your Clerk User ID from above</li>
            <li>Open terminal in your project directory</li>
            <li>Run: <code className="bg-yellow-100 px-1 rounded">node scripts/make-admin.js [YOUR_CLERK_ID]</code></li>
            <li>Refresh this page to verify the role change</li>
            <li>Try accessing the admin dashboard again</li>
          </ol>
        </div>
      </div>
    </div>
  );
}