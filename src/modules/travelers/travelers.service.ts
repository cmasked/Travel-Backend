import {
  Injectable,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { Traveler } from './entities/traveler.entity';
import { CreateTravelerDto } from './dto/create-traveler.dto';
import { UpdateTravelerDto } from './dto/update-traveler.dto';
import { ErrorCodes } from '../../shared/constants/error-codes';
import { TravelersRepository } from './travelers.repository';
import { MessageResponse } from '../../shared/interfaces';
import { EncryptionService } from '../../shared/services/encryption.service';

const MAX_TRAVELERS = 10;

@Injectable()
export class TravelersService {
  private readonly logger = new Logger(TravelersService.name);

  constructor(
    private readonly travelersRepository: TravelersRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * FR-US-028 — List all non-deleted travelers.
   * Ordered by primary_traveler desc, created_at asc.
   * document_number is NOT decrypted in list view.
   */
  async findAll(userId: string, name?: string): Promise<Partial<Traveler>[]> {
    try {
      const travelers = await this.travelersRepository.findAll(userId, name);
      return travelers.map((t) => this.sanitize(t, false));
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  /**
   * FR-US-029 — Create traveler. Max 10 per user.
   * FR-US-032: document_number encrypted with AES-256-GCM.
   */
  async create(userId: string, dto: CreateTravelerDto): Promise<Partial<Traveler>> {
    try {
      const count = await this.travelersRepository.countByUser(userId);

      if (count >= MAX_TRAVELERS) {
        throw new UnprocessableEntityException({
          message: `Maximum ${MAX_TRAVELERS} travelers allowed per user`,
          code: ErrorCodes.TRAVELER_LIMIT_EXCEEDED,
        });
      }

      const traveler = this.travelersRepository.create({
        userId,
        title: dto.title,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dob: dto.dob,
        gender: dto.gender,
        mobileNo: dto.mobileNo,
        dialCode: dto.dialCode,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber ? this.encryptionService.encrypt(dto.documentNumber) : null,
        documentExpiryDate: dto.documentExpiryDate ? new Date(dto.documentExpiryDate) : null,
        documentPhoto: dto.documentPhoto,
        nationality: dto.nationality,
        foodPreference: dto.foodPreference,
        primaryTraveler: false,
      });

      const saved = await this.travelersRepository.save(traveler);
      return this.sanitize(saved, false);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  /**
   * FR-US-030 — Full update traveler (PUT).
   * primary_traveler flag cannot be changed.
   */
  async update(userId: string, travelerId: string, dto: UpdateTravelerDto): Promise<Partial<Traveler>> {
    try {
      const traveler = await this.travelersRepository.findOneById(userId, travelerId);

      if (!traveler) {
        throw new NotFoundException({ message: 'Traveler not found', code: ErrorCodes.TRAVELER_NOT_FOUND });
      }

      traveler.title = dto.title;
      traveler.firstName = dto.firstName;
      traveler.lastName = dto.lastName;
      traveler.dob = dto.dob;
      traveler.gender = dto.gender ?? null;
      traveler.mobileNo = dto.mobileNo ?? null;
      traveler.dialCode = dto.dialCode ?? null;
      traveler.documentType = dto.documentType ?? null;
      traveler.documentNumber = dto.documentNumber ? this.encryptionService.encrypt(dto.documentNumber) : null;
      traveler.documentExpiryDate = dto.documentExpiryDate ? new Date(dto.documentExpiryDate) : null;
      traveler.documentPhoto = dto.documentPhoto ?? null;
      traveler.nationality = dto.nationality ?? null;
      traveler.foodPreference = dto.foodPreference ?? null;

      const saved = await this.travelersRepository.save(traveler);
      return this.sanitize(saved, false);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  /**
   * GET /users/me/travelers/:id — with decrypted document_number.
   * FR-US-032: decryption only on explicit GET by owning user.
   */
  async findOne(userId: string, travelerId: string): Promise<Partial<Traveler>> {
    try {
      const traveler = await this.travelersRepository.findOneById(userId, travelerId);

      if (!traveler) {
        throw new NotFoundException({ message: 'Traveler not found', code: ErrorCodes.TRAVELER_NOT_FOUND });
      }

      return this.sanitize(traveler, true);
    } catch (error) {
      this.handleError(error, 'findOne');
    }
  }

  /**
   * FR-US-031 — Soft delete. Primary traveler protected.
   */
  async remove(userId: string, travelerId: string): Promise<MessageResponse> {
    try {
      const traveler = await this.travelersRepository.findOneById(userId, travelerId);

      if (!traveler) {
        throw new NotFoundException({ message: 'Traveler not found', code: ErrorCodes.TRAVELER_NOT_FOUND });
      }

      if (traveler.primaryTraveler) {
        throw new UnprocessableEntityException({
          message: 'Primary traveler cannot be deleted',
          code: ErrorCodes.PRIMARY_TRAVELER_CANNOT_BE_DELETED,
        });
      }

      traveler.isDeleted = true;
      traveler.isActive = false;
      await this.travelersRepository.save(traveler);

      return { message: 'Traveler deleted successfully' };
    } catch (error) {
      this.handleError(error, 'remove');
    }
  }

  /**
   * Strip internal fields. Optionally decrypt document_number.
   */
  private sanitize(traveler: Traveler, decryptDoc: boolean): Partial<Traveler> {
    const result: Record<string, unknown> = { ...traveler };

    if (traveler.documentNumber && decryptDoc) {
      try {
        result['documentNumber'] = this.encryptionService.decrypt(traveler.documentNumber);
      } catch {
        result['documentNumber'] = null;
      }
    } else if (traveler.documentNumber) {
      result['documentNumber'] = '***ENCRYPTED***';
    }

    delete result['isDeleted'];
    return result as Partial<Traveler>;
  }

  private handleError(error: unknown, method: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`TravelersService.${method} failed`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException('Unexpected traveler service error');
  }
}
