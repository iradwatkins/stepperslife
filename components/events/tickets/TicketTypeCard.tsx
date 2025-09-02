import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { Switch } from "@/components/forms/Select";
import { Trash2, DollarSign, Calendar, Info } from "lucide-react";
import type { TicketType } from "@/types/events";

interface TicketTypeCardProps {
  ticket: TicketType;
  index: number;
  eventDate?: string;
  canDelete?: boolean;
  errors?: Record<string, string>;
  onChange: (field: keyof TicketType, value: any) => void;
  onDelete?: () => void;
}

export function TicketTypeCard({
  ticket,
  index,
  eventDate,
  canDelete = true,
  errors = {},
  onChange,
  onDelete,
}: TicketTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDefaultEarlyBirdDate = () => {
    if (!eventDate) return "";
    const date = new Date(eventDate);
    date.setDate(date.getDate() - 14); // 2 weeks before event
    return date.toISOString().split("T")[0];
  };

  const calculateRevenue = () => {
    const regularRevenue = ticket.quantity * ticket.price;
    const earlyBirdRevenue = ticket.hasEarlyBird && ticket.earlyBirdPrice
      ? ticket.quantity * ticket.earlyBirdPrice
      : 0;
    return { regularRevenue, earlyBirdRevenue };
  };

  const { regularRevenue, earlyBirdRevenue } = calculateRevenue();

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Ticket Type {index + 1}
        </h4>
        {canDelete && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 dark:text-red-400 p-1"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label="Name"
          name={`ticket-${index}-name`}
          required
          error={errors[`ticket-${index}-name`]}
        >
          <Input
            value={ticket.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="e.g., General Admission"
            error={!!errors[`ticket-${index}-name`]}
          />
        </FormField>

        <FormField
          label="Quantity"
          name={`ticket-${index}-quantity`}
          required
          error={errors[`ticket-${index}-quantity`]}
        >
          <Input
            type="number"
            value={ticket.quantity}
            onChange={(e) => onChange("quantity", parseInt(e.target.value) || 0)}
            min="0"
            placeholder="100"
            error={!!errors[`ticket-${index}-quantity`]}
          />
        </FormField>

        <FormField
          label="Regular Price"
          name={`ticket-${index}-price`}
          required
          error={errors[`ticket-${index}-price`]}
        >
          <Input
            type="number"
            value={ticket.price}
            onChange={(e) => onChange("price", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="25.00"
            icon={<DollarSign className="w-4 h-4" />}
            error={!!errors[`ticket-${index}-price`]}
          />
        </FormField>
      </div>

      {/* Early Bird Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <Switch
          label="Enable Early Bird Pricing"
          checked={ticket.hasEarlyBird}
          onChange={(checked) => {
            onChange("hasEarlyBird", checked);
            if (!checked) {
              onChange("earlyBirdPrice", undefined);
              onChange("earlyBirdEndDate", undefined);
            }
          }}
        />

        {ticket.hasEarlyBird && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded">
            <FormField
              label="Early Bird Price"
              name={`ticket-${index}-earlybird`}
              required
              error={errors[`ticket-${index}-earlybird`]}
              hint={`Suggested: $${(ticket.price * 0.8).toFixed(2)}`}
            >
              <Input
                type="number"
                value={ticket.earlyBirdPrice || ""}
                onChange={(e) => onChange("earlyBirdPrice", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder={(ticket.price * 0.8).toFixed(2)}
                icon={<DollarSign className="w-4 h-4" />}
                error={!!errors[`ticket-${index}-earlybird`]}
              />
            </FormField>

            <FormField
              label="Early Bird Ends"
              name={`ticket-${index}-earlydate`}
              required
              error={errors[`ticket-${index}-earlydate`]}
            >
              <Input
                type="date"
                value={ticket.earlyBirdEndDate || getDefaultEarlyBirdDate()}
                onChange={(e) => onChange("earlyBirdEndDate", e.target.value)}
                max={eventDate}
                icon={<Calendar className="w-4 h-4" />}
                error={!!errors[`ticket-${index}-earlydate`]}
              />
            </FormField>
          </div>
        )}
      </div>

      {/* Revenue Projection */}
      {ticket.quantity > 0 && ticket.price > 0 && (
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p>
              Potential revenue: <span className="font-semibold">${regularRevenue.toFixed(2)}</span>
            </p>
            {ticket.hasEarlyBird && ticket.earlyBirdPrice && (
              <p>
                Early bird revenue: <span className="font-semibold">${earlyBirdRevenue.toFixed(2)}</span>
                {" "}
                <span className="text-green-600 dark:text-green-400">
                  (Save ${(regularRevenue - earlyBirdRevenue).toFixed(2)})
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}