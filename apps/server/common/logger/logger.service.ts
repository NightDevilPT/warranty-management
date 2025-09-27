// src/common/logger/logger.service.ts
import { Injectable } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogMetadata {
  [key: string]: any;
}

@Injectable()
export class LoggerService {
  private logger: Logger;
  private context?: string;

  constructor() {
    this.initializeLogger();
  }

  private initializeLogger() {
    const consoleFormat = format.combine(
      format.colorize(),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(({ timestamp, level, message, context, trace }) => {
        return `${timestamp} [${context || 'App'}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
      }),
    );

    const fileFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.json(),
    );

    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json(),
      ),
      defaultMeta: { service: 'nestjs-app' },
      transports: [
        // Console transport
        new transports.Console({
          format: consoleFormat,
        }),

        // Daily rotate file for errors
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: fileFormat,
          maxSize: '20m',
          maxFiles: '14d',
        }),

        // Daily rotate file for all logs
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          format: fileFormat,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  error(message: string, trace?: string, context?: string, meta?: LogMetadata) {
    this.logger.error({
      message,
      context: context || this.context,
      trace,
      ...meta,
    });
  }

  warn(message: string, context?: string, meta?: LogMetadata) {
    this.logger.warn({
      message,
      context: context || this.context,
      ...meta,
    });
  }

  log(message: string, context?: string, meta?: LogMetadata) {
    this.logger.info({
      message,
      context: context || this.context,
      ...meta,
    });
  }

  info(message: string, context?: string, meta?: LogMetadata) {
    this.logger.info({
      message,
      context: context || this.context,
      ...meta,
    });
  }

  debug(message: string, context?: string, meta?: LogMetadata) {
    this.logger.debug({
      message,
      context: context || this.context,
      ...meta,
    });
  }

  verbose(message: string, context?: string, meta?: LogMetadata) {
    this.logger.verbose({
      message,
      context: context || this.context,
      ...meta,
    });
  }

  // Method to create child logger with context
  createChildLogger(context: string): LoggerService {
    const childLogger = new LoggerService();
    childLogger.setContext(context);
    return childLogger;
  }
}
