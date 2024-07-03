import { BaseResponses } from "@app/common/helpers";

export const TRANSACTION_RESPONSE = {
  ...BaseResponses('Transaction'),

  ERROR: {
    NOT_FOUND: 'Transaction not found.',
    EXIST: 'Transaction exists.',
  },

  LOG: {
    CREATE: 'Transaction created.',
    VERIFIED: 'Transaction verified.'
  }
};