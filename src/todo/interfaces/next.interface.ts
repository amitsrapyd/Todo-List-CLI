export interface Next {
  onSuccess: Function;
  onError?: (errorMessage: string) => void;
}
