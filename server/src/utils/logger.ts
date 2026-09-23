type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatMessage = (level: LogLevel, message: string, meta?: unknown): string => {
  const timestamp = new Date().toISOString();
  let metaString = '';
  if (meta !== undefined) {
    metaString = typeof meta === 'object' ? ` ${JSON.stringify(meta)}` : ` ${String(meta)}`;
  }
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}`;
};

export const logger = {
  info: (message: string, meta?: unknown): void => console.log(formatMessage('info', message, meta)),
  warn: (message: string, meta?: unknown): void => console.warn(formatMessage('warn', message, meta)),
  error: (message: string, meta?: unknown): void => console.error(formatMessage('error', message, meta)),
  debug: (message: string, meta?: unknown): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', message, meta));
    }
  }
};
