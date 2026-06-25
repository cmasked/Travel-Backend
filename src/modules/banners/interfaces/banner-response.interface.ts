import { Banner } from '../entities/banner.entity';
import { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';

export type BannerListResponse = PaginatedResponse<Banner>;
