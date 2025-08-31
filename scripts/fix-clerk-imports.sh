#!/bin/bash

# List of files that need to be updated (excluding AuthContext.tsx which is our new auth provider)
files=(
  "app/tickets/page.tsx"
  "app/admin/page.tsx"
  "app/seller/analytics/page.tsx"
  "app/scan/page.tsx"
  "app/seller/customers/page.tsx"
  "app/admin/events/page.tsx"
  "app/events/create-new/page.tsx"
  "app/test-crud/page.tsx"
  "app/claim/[token]/page.tsx"
  "app/dashboard/layout.tsx"
  "app/events/[eventId]/claim/page.tsx"
  "app/events/[eventId]/scan/page.tsx"
  "app/events/create/page.tsx"
  "app/seller/dashboard/page.tsx"
  "app/seller/earnings/page.tsx"
  "app/seller/events/[id]/tickets/setup/page.tsx"
  "app/seller/new-event/page.tsx"
  "app/seller/reports/page.tsx"
  "app/seller/settings/page.tsx"
  "app/tickets/[id]/page.tsx"
  "app/admin/payments/page.tsx"
  "components/dashboard/DashboardSidebar.tsx"
  "components/dashboard/DashboardHeader.tsx"
  "components/dashboard/DashboardWrapper.tsx"
  "components/AdminPaymentVerification.tsx"
  "components/AffiliateDashboard.tsx"
  "components/TableDistributionDashboard.tsx"
  "components/SellerTableManager.tsx"
  "components/SellerEventList.tsx"
  "components/SellerDashboard.tsx"
  "components/EventFormStepped.tsx"
  "components/EventForm.tsx"
  "components/PurchaseTicketWithQuantity.tsx"
  "components/PurchaseTicket.tsx"
  "components/EventsMap.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Replace import statement
    sed -i '' 's/import { useUser } from "@clerk\/nextjs";/import { useAuth } from "@\/hooks\/useAuth";/' "$file"
    sed -i '' 's/import { useUser, [^}]* } from "@clerk\/nextjs";/import { useAuth, SignInButton, UserButton } from "@\/hooks\/useAuth";/' "$file"
    
    # Replace useUser calls with useAuth
    sed -i '' 's/const { user[^}]* } = useUser();/const { user, isSignedIn } = useAuth();/' "$file"
    sed -i '' 's/const { isSignedIn[^}]* } = useUser();/const { user, isSignedIn } = useAuth();/' "$file"
    
    echo "✓ Updated $file"
  fi
done

echo "All files updated!"