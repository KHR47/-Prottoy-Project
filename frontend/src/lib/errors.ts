import { isAxiosError } from "axios";

type ApiErrorResponse = {
  message?: string | string[];
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    return message || fallback;
  }

  return fallback;
}
