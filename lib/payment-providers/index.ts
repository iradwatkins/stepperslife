import { PaymentProvider, IPaymentProvider } from "./types";
import { SquareProvider } from "./square-provider";

const providers: Map<PaymentProvider, IPaymentProvider> = new Map();

// Register providers
providers.set("square", new SquareProvider());

export function getPaymentProvider(provider: PaymentProvider): IPaymentProvider | null {
  return providers.get(provider) || null;
}

export function getAllProviders(): IPaymentProvider[] {
  return Array.from(providers.values());
}

export * from "./types";