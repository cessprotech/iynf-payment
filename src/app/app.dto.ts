import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

const CreateTransaction = extendApi(
  z.object({
    creatorId: z.string().min(1),
    influencerId: z.string().min(1),
    jobId: z.string().min(1),
    bidId: z.string().min(1),
    amount: z.number(),

  }),
  {
    title: 'Transaction Data',
    description: 'Transaction Data'
  }
);

export class CreateTransactionDto extends createZodDto(CreateTransaction.strict()) { };

// export type CreateTransactionDto = DeepRequired<CreateTransactionDtoClass>

export class UpdateTransactionDto extends createZodDto(CreateTransaction.deepPartial()) { }





