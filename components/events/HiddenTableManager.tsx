"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  Table,
  Eye,
  EyeOff,
  Link,
  Copy,
  Mail,
  CheckCircle
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface TableConfig {
  _id: Id<"tableConfigurations">
  eventId: Id<"events">
  name: string
  seatCount: number
  price: number
  description?: string
  isHidden?: boolean
  shareableLink?: string
  shareToken?: string
  soldCount: number
  maxTables?: number
  isActive: boolean
}

interface HiddenTableManagerProps {
  eventId: Id<"events">
  tables: TableConfig[]
  onTableUpdate?: () => void
}

export function HiddenTableManager({ 
  eventId, 
  tables, 
  onTableUpdate 
}: HiddenTableManagerProps) {
  const { toast } = useToast()
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null)
  const [emailRecipient, setEmailRecipient] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  // Mutations would need to be created in Convex
  // For now, we'll use placeholder functions
  const toggleTableVisibility = async (tableId: Id<"tableConfigurations">, isHidden: boolean) => {
    try {
      // This would call a Convex mutation to update the table
      // await updateTableVisibility({ tableId, isHidden })
      
      toast({
        title: isHidden ? "Table Hidden" : "Table Made Public",
        description: isHidden 
          ? "This table is now only accessible via direct link" 
          : "This table is now publicly visible",
      })
      
      if (onTableUpdate) onTableUpdate()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update table visibility",
      })
    }
  }

  const generateShareableLink = (table: TableConfig): string => {
    // Generate a shareable link for the table
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const token = table.shareToken || Math.random().toString(36).substring(7)
    return `${baseUrl}/events/${eventId}/table/${table._id}?token=${token}`
  }

  const copyToClipboard = async (text: string, tableId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(tableId)
      setTimeout(() => setCopiedLink(null), 2000)
      toast({
        title: "Link Copied",
        description: "The shareable link has been copied to your clipboard",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link",
      })
    }
  }

  const sendEmailInvite = async (table: TableConfig) => {
    if (!emailRecipient || !emailMessage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter email and message",
      })
      return
    }

    try {
      // This would call an API to send the email
      // await sendTableInvite({ 
      //   tableId: table._id,
      //   recipientEmail: emailRecipient,
      //   message: emailMessage,
      //   link: generateShareableLink(table)
      // })
      
      toast({
        title: "Invite Sent",
        description: `Table invite sent to ${emailRecipient}`,
      })
      
      setEmailRecipient("")
      setEmailMessage("")
      setSelectedTable(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invite",
      })
    }
  }

  const hiddenTables = tables.filter(t => t.isHidden)
  const publicTables = tables.filter(t => !t.isHidden)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Table className="w-5 h-5 text-blue-600" />
          Table Management
        </h3>

        {tables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Table className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No tables configured yet</p>
            <p className="text-sm mt-2">Create tables after setting up ticket types</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Public Tables */}
            {publicTables.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Public Tables
                </h4>
                <div className="space-y-2">
                  {publicTables.map((table) => (
                    <TableRow 
                      key={table._id} 
                      table={table} 
                      onToggleVisibility={toggleTableVisibility}
                      onCopyLink={copyToClipboard}
                      onSendInvite={() => setSelectedTable(table)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hidden Tables */}
            {hiddenTables.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  Hidden Tables (Private Sales)
                </h4>
                <div className="space-y-2">
                  {hiddenTables.map((table) => (
                    <TableRow 
                      key={table._id} 
                      table={table} 
                      onToggleVisibility={toggleTableVisibility}
                      onCopyLink={copyToClipboard}
                      onSendInvite={() => setSelectedTable(table)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Invite Dialog */}
      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Table Invite</DialogTitle>
            <DialogDescription>
              Send a private link to purchase "{selectedTable?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedTable(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedTable && sendEmailInvite(selectedTable)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface TableRowProps {
  table: TableConfig
  onToggleVisibility: (tableId: Id<"tableConfigurations">, isHidden: boolean) => void
  onCopyLink: (link: string, tableId: string) => void
  onSendInvite: () => void
}

function TableRow({ table, onToggleVisibility, onCopyLink, onSendInvite }: TableRowProps) {
  const shareableLink = `${window.location.origin}/events/${table.eventId}/table/${table._id}`
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h5 className="font-medium">{table.name}</h5>
          {table.isHidden && (
            <Badge variant="secondary" className="text-xs">
              <EyeOff className="w-3 h-3 mr-1" />
              Hidden
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {table.seatCount} seats · ${table.price} · {table.soldCount}/{table.maxTables || '∞'} sold
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {table.isHidden && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyLink(shareableLink, table._id)}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onSendInvite}
            >
              <Mail className="w-4 h-4" />
            </Button>
          </>
        )}
        
        <Switch
          checked={table.isHidden || false}
          onCheckedChange={(checked) => onToggleVisibility(table._id, checked)}
        />
      </div>
    </div>
  )
}