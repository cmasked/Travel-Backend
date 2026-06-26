import {
  ConflictException,
  Injectable,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Markup } from './entities/markup.entity';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { UpdateMarkupDto } from './dto/update-markup.dto';
import { ErrorCodes } from '../../shared/constants/error-codes';
import { MarkupsRepository } from './markups.repository';
import { MessageResponse } from '../../shared/interfaces';

@Injectable()
export class MarkupsService {
  private readonly logger = new Logger(MarkupsService.name);

  constructor(
    private readonly markupsRepository: MarkupsRepository,
  ) {}

  /** Create a new markup */
  async create(dto: CreateMarkupDto, adminId: string): Promise<Markup> {
    try {
      // Check if a markup with the same name and module already exists
      const existing = await this.markupsRepository.findByNameAndModule(dto.markupName, dto.markupModule);
      if (existing) {
        throw new ConflictException({
          message: 'A markup with this name already exists for the selected module',
          code: ErrorCodes.MARKUP_ALREADY_EXISTS,
        });
      }

      // Create the entity object in memory
      const markup = this.markupsRepository.create({
        markupName: dto.markupName,
        markupModule: dto.markupModule,
        markupFrom: dto.markupFrom,
        markupTo: dto.markupTo,
        markupType: dto.markupType,
        createdBy: adminId,
      });

      // Save it to the database and return the saved object
      return this.markupsRepository.save(markup);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  /** Get all markups */
  async findAll(name?: string): Promise<Markup[]> {
    try {
      return this.markupsRepository.findAll(name);
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  /** Get a single markup by its ID */
  async findById(markupId: string): Promise<Markup> {
    try {
      const markup = await this.markupsRepository.findById(markupId);
      if (!markup) {
        throw new NotFoundException({
          message: 'Markup not found',
          code: ErrorCodes.MARKUP_NOT_FOUND,
        });
      }
      return markup;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  /** Update an existing markup */
  async update(markupId: string, dto: UpdateMarkupDto, adminId: string): Promise<Markup> {
    try {
      // First, find the existing markup (this will throw NotFoundException if not found)
      const markup = await this.findById(markupId);

      // Only update the fields that the frontend actually sent
      if (dto.markupName !== undefined) markup.markupName = dto.markupName;
      if (dto.markupModule !== undefined) markup.markupModule = dto.markupModule;
      if (dto.markupFrom !== undefined) markup.markupFrom = dto.markupFrom;
      if (dto.markupTo !== undefined) markup.markupTo = dto.markupTo;
      if (dto.markupType !== undefined) markup.markupType = dto.markupType;

      // Track who made this update
      markup.updatedBy = adminId;

      return this.markupsRepository.save(markup);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  /** Delete a markup */
  async remove(markupId: string): Promise<MessageResponse> {
    try {
      const markup = await this.findById(markupId);
      await this.markupsRepository.remove(markup);
      return { message: 'Markup deleted successfully' };
    } catch (error) {
      this.handleError(error, 'remove');
    }
  }

  /** Centralized error handler — re-throws known HTTP errors, wraps unknown ones */
  private handleError(error: unknown, method: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`MarkupsService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected markup service error');
  }
}
