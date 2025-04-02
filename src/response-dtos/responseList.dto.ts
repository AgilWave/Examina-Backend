import { PaginationInfo } from './pagination-response.dto';

export class ResponseList<T> {
  isSuccessful: boolean;
  message?: string;
  listContent: T[];
  paginationInfo?: PaginationInfo;
}
