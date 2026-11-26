import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ListTicketsQuery } from './dto/list-tickets.query';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  list(@Query() query: ListTicketsQuery) {
    return this.tickets.list(query);
  }

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.tickets.create(dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    return this.tickets.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tickets.remove(id);
  }
}
