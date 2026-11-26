import { IsIn, IsInt, IsOptional, IsString, Length } from 'class-validator';

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export const STATUSES = ['OPEN', 'IN_PROGRESS', 'DONE'] as const;
export type Status = (typeof STATUSES)[number];

export class CreateTicketDto {
  @IsString()
  @Length(3, 100)
  title: string;

  @IsOptional()
  @IsIn(PRIORITIES)
  priority?: (typeof PRIORITIES)[number];

  @IsOptional()
  @IsInt()
  assigneeId?: number;
}
