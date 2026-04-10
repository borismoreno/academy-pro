import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateFieldDto } from './dto/create-field.dto.js';
import { FieldResponseDto } from './dto/field-response.dto.js';
import { UpdateFieldDto } from './dto/update-field.dto.js';

@Injectable()
export class FieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(academyId: string, dto: CreateFieldDto): Promise<FieldResponseDto> {
    const duplicate = await this.prisma.field.findFirst({
      where: { academyId, name: dto.name, isActive: true },
    });

    if (duplicate) {
      throw new ConflictException('Ya existe una cancha con ese nombre en la academia');
    }

    return this.prisma.field.create({
      data: {
        academyId,
        name: dto.name,
        location: dto.location,
      },
    });
  }

  async findAll(academyId: string): Promise<FieldResponseDto[]> {
    return this.prisma.field.findMany({
      where: { academyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(academyId: string, id: string): Promise<FieldResponseDto> {
    const field = await this.prisma.field.findFirst({
      where: { id, academyId },
    });

    if (!field) {
      throw new NotFoundException('Cancha no encontrada');
    }

    return field;
  }

  async update(academyId: string, id: string, dto: UpdateFieldDto): Promise<FieldResponseDto> {
    const field = await this.prisma.field.findFirst({
      where: { id, academyId },
    });

    if (!field) {
      throw new NotFoundException('Cancha no encontrada');
    }

    if (dto.name && dto.name !== field.name) {
      const duplicate = await this.prisma.field.findFirst({
        where: { academyId, name: dto.name, isActive: true, NOT: { id } },
      });

      if (duplicate) {
        throw new ConflictException('Ya existe una cancha con ese nombre en la academia');
      }
    }

    return this.prisma.field.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.location !== undefined && { location: dto.location }),
      },
    });
  }

  async remove(academyId: string, id: string): Promise<void> {
    const field = await this.prisma.field.findFirst({
      where: { id, academyId },
    });

    if (!field) {
      throw new NotFoundException('Cancha no encontrada');
    }

    const activeSchedules = await this.prisma.teamSchedule.count({
      where: { fieldId: id },
    });

    if (activeSchedules > 0) {
      throw new BadRequestException(
        'No se puede eliminar una cancha que tiene horarios asignados. Reasigna los horarios primero.',
      );
    }

    await this.prisma.field.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
