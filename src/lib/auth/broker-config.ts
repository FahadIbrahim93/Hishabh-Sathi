/** Broker federation is enabled only when BOTH credentials are explicitly supplied. */
export function brokerCredentialsReady(input: {
  authDisabled: boolean;
  clientId?: string;
  clientSecret?: string;
}): boolean {
  return !input.authDisabled && Boolean(input.clientId?.trim() && input.clientSecret?.trim());
}
