import { builder } from '../builder'

export interface PaymentMethodInfoData {
  id: string
  cardLast4: string
  cardType: string
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
}

export const PaymentMethodInfoType = builder.objectRef<PaymentMethodInfoData>('PaymentMethodInfo')

builder.objectType(PaymentMethodInfoType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    cardLast4: t.exposeString('cardLast4'),
    cardType: t.exposeString('cardType'),
    expiryMonth: t.exposeString('expiryMonth'),
    expiryYear: t.exposeString('expiryYear'),
    isDefault: t.exposeBoolean('isDefault'),
  }),
})
