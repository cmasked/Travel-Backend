export interface UserResponse {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
