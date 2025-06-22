import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from 'winston';

export class LoggerService {
  private readonly logger: WinstonLogger;
  private context: string;

  constructor(context = 'App') {
    this.context = context;

    this.logger = createLogger({
      level: 'debug',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, message, stack }) => {
          const colors: Record<string, string> = {
            info: '\x1b[34m', // blue
            warn: '\x1b[33m', // yellow
            error: '\x1b[31m', // red
            debug: '\x1b[35m', // magenta
            verbose: '\x1b[36m', // cyan
          };

          const reset = '\x1b[0m';
          const color = colors[level] || '\x1b[37m'; // default white

          let log = `${color}[${timestamp}] [${level.toUpperCase()}] [${this.context}]: ${message}${reset}`;

          if (stack) {
            log += `\n${color}Stack:${reset} ${stack}`;
          }

          return log;
        }),
      ),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: format.combine(format.uncolorize(), format.json()),
        }),
        new transports.File({
          filename: 'logs/combined.log',
          format: format.combine(format.uncolorize(), format.json()),
        }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(`[ERROR] [${this.context}]: ${message}`);
    if (trace) {
      if (process.env.NODE_ENV === 'development') {
        this.logger.error(`Stack Trace: ${trace}`);
      }
    }
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }

  setContext(context: string) {
    this.context = context;
  }
}
