"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DebugUser() {
  const { user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDbUser = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/debug-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clerkUserId: user.id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDbUser(data.user);
      } else {
        console.error('Failed to fetch user from database');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchDbUser();
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return <div>Loading user info...</div>;
  }

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>User Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Clerk User Info:</h3>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</div>
            <div><strong>Name:</strong> {user.fullName}</div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Database User Info:</h3>
          {loading ? (
            <div>Loading database info...</div>
          ) : dbUser ? (
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              <div><strong>Database ID:</strong> {dbUser.id}</div>
              <div><strong>Clerk ID:</strong> {dbUser.clerkUserId}</div>
              <div><strong>Email:</strong> {dbUser.email}</div>
              <div><strong>Name:</strong> {dbUser.name || 'Not set'}</div>
              <div><strong>Role:</strong> <span className={dbUser.role === 'ADMIN' ? 'text-green-600 font-bold' : 'text-red-600'}>{dbUser.role}</span></div>
              <div><strong>Created:</strong> {new Date(dbUser.createdAt).toLocaleString()}</div>
            </div>
          ) : (
            <div className="bg-red-100 p-3 rounded text-sm">
              User not found in database. Please make sure you've logged in at least once.
            </div>
          )}
        </div>
        
        <div className="pt-4">
          <Button onClick={fetchDbUser} disabled={loading}>
            Refresh Database Info
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>To make this user an admin:</strong></p>
          <div className="bg-gray-100 p-2 rounded font-mono text-xs mt-1">
            node scripts/make-admin.js {user.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}