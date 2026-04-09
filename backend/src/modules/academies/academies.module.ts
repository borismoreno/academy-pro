import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Academy } from './entities/academy.entity';
import { UserAcademyRole } from './entities/user-academy-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Academy, UserAcademyRole])],
  exports: [TypeOrmModule],
})
export class AcademiesModule {}
