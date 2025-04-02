export class ResponseContent<T> {
  isSuccessful: boolean;
  message?: string;
  content: T[] | T | null;
}
