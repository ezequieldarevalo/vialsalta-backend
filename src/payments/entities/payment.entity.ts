// Enums for Payment
// Entity migrated to Prisma - see prisma/schema.prisma

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}
