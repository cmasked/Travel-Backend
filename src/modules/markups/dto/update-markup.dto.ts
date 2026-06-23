import { PartialType } from '@nestjs/mapped-types';
import { CreateMarkupDto } from './create-markup.dto';

/**
 * Data Transfer Object for updating an existing Markup.
 * By extending PartialType(CreateMarkupDto), we automatically make all fields
 * from CreateMarkupDto optional for updates!
 */
export class UpdateMarkupDto extends PartialType(CreateMarkupDto) {}
