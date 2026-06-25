import { UserAccount } from '../entities/user-account.entity';
import { PaginatedQuery } from '../../../shared/interfaces/common.interface';
import { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';

export interface UserListQuery extends PaginatedQuery {
  userType?: string;
  status?: string;
  roleId?: string;
  fromDate?: string;
  toDate?: string;
}

export type UserListResponse = PaginatedResponse<Partial<UserAccount>>;
