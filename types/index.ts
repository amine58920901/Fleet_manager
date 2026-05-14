import type {
  Vehicle,
  Driver,
  Quote,
  Invoice,
  Contract,
  Organization,
  User,
  VehicleStatus,
  QuoteStatus,
  InvoiceStatus,
  ContractStatus,
  Role,
} from "@prisma/client"

export type {
  Vehicle,
  Driver,
  Quote,
  Invoice,
  Contract,
  Organization,
  User,
  VehicleStatus,
  QuoteStatus,
  InvoiceStatus,
  ContractStatus,
  Role,
}

// Extended types with relations
export type VehicleWithContracts = Vehicle & {
  contracts: Contract[]
}

export type DriverWithContracts = Driver & {
  contracts: (Contract & { vehicle: Vehicle })[]
}

export type ContractWithRelations = Contract & {
  vehicle: Vehicle
  driver: Driver
  invoice: Invoice | null
}

export type QuoteWithInvoice = Quote & {
  invoice: Invoice | null
}

export type InvoiceWithRelations = Invoice & {
  quote: Quote | null
  contract: Contract | null
}

// Form input types
export type CreateVehicleInput = {
  brand: string
  model: string
  year: number
  licensePlate: string
  vin?: string
  color?: string
  mileage?: number
  status?: VehicleStatus
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  depositAmount?: number
  imageUrl?: string
  notes?: string
}

export type UpdateVehicleInput = Partial<CreateVehicleInput>

export type CreateDriverInput = {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  licenseNumber: string
  licenseExpiry?: Date
  birthDate?: Date
  address?: string
  photoUrl?: string
  notes?: string
}

export type UpdateDriverInput = Partial<CreateDriverInput>

export type CreateQuoteInput = {
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  startDate: Date
  endDate: Date
  vehicleId?: string
  vehicleDesc: string
  rateType: string
  dailyRate: number
  days: number
  subtotal: number
  discountType: string
  discountValue: number
  discountAmount: number
  taxRate?: number
  taxAmount: number
  total: number
  billingMode: string
  installmentAmount?: number
  totalInstallments?: number
  notes?: string
  validUntil?: Date
}

export type CreateInvoiceInput = {
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  dueDate: Date
  subtotal: number
  taxRate?: number
  notes?: string
  quoteId?: string
}

export type CreateContractInput = {
  startDate: Date
  endDate: Date
  vehicleId: string
  driverId: string
  depositAmount?: number
  mileageStart?: number
  fuelLevelStart?: string
  conditionStart?: Record<string, { type: string; severity: string; note: string }>
  terms?: string
  invoiceId?: string
  quoteId?: string
  // Modalités financières
  paymentAmount?: number
  paymentTaxType?: string
  paymentDueDay?: number
  paymentMethod?: string
  depositReturnConditions?: string
  // Usage kilométrique
  mileageAllowance?: number
  extraMileageCost?: number
  // Assurance & entretien
  insuranceFranchise?: number
  insuranceInfo?: string
  maintenanceInfo?: string
  // Résiliation & restitution
  returnLocation?: string
  earlyTerminationConditions?: string
}

// Action response type
export type ActionResponse<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

// Dashboard stats
export type DashboardStats = {
  totalVehicles: number
  availableVehicles: number
  rentedVehicles: number
  maintenanceVehicles: number
  totalDrivers: number
  activeContracts: number
  pendingInvoices: number
  monthlyRevenue: number
}
