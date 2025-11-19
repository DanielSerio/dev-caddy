export type LogColor = 'red' | 'blue' | 'green' | 'yellow' | 'white';
export type LogType = 'info' | 'warn' | 'error' | 'log';

export type InfoLogValue<Type extends object> = Type | Type[];

/* Parameters for constructing a `DevCaddy` log */
export interface ConstructLogParams<LType extends LogType, OType extends object = Record<string, unknown>> {
  /* The type of log. non-strings should use 'info'. */
  type?: LType; // defaults to 'log'
  /* Print an emoji at the end of the line? */
  emoji?: string;
  /*prints "[DavCaddy] " at the beginning of the line */
  printTag?: boolean; // defaults to true
  /* Specify colors for the log */
  colors?: {
    line?: LogColor;
    tag?: LogColor;
  };
  /* The value to log */
  value: LType extends 'info' ? InfoLogValue<OType> : string;
}