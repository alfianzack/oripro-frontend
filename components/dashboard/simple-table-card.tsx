'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SimpleTableCard() {
  const users = [
    { name: "John Doe", email: "john@example.com", status: "Active", plan: "Premium" },
    { name: "Jane Smith", email: "jane@example.com", status: "Inactive", plan: "Basic" },
    { name: "Bob Johnson", email: "bob@example.com", status: "Active", plan: "Pro" },
    { name: "Alice Brown", email: "alice@example.com", status: "Active", plan: "Premium" },
    { name: "Charlie Wilson", email: "charlie@example.com", status: "Inactive", plan: "Basic" }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Registered Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                  {user.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{user.plan}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
