import { IsIn } from 'class-validator';
import { STATUSES, Status } from './create-ticket.dto';

export class UpdateStatusDto {
  @IsIn(STATUSES)
  status: Status;
}
