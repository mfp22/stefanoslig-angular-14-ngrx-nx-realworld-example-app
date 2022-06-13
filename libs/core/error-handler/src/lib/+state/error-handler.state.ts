export interface ErrorHandlerState {
  status: number;
  message: string | undefined;
}

export const errorHandlerInitialState: ErrorHandlerState = {
  message: undefined,
  status: -1,
};
