import { Request, Response, NextFunction } from 'express';
import { stripJsonComments } from '../utils/validation.js';

export interface TolerantJsonOptions {
  limit?: string;
  type?: string;
}

/**
 * Dev-only JSON body parser that strips `//` and block comments (and trailing
 * commas) before parsing. Never mounted when NODE_ENV=production, so production
 * keeps the strict `express.json()` behaviour.
 *
 * An empty or missing body yields `req.body = {}` so downstream validation can
 * report every missing required field instead of failing to parse.
 */
export const tolerantJsonParser = (options: TolerantJsonOptions = {}) => {
  const limitBytes = options.limit ? parseLimit(options.limit) : 1024 * 1024;
  const contentType = options.type ?? 'application/json';

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.headers['content-type']?.includes(contentType)) {
      next();
      return;
    }

    let raw = '';
    let finished = false;

    const done = (err?: Error): void => {
      if (finished) return;
      finished = true;
      next(err);
    };

    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString('utf8');
      if (Buffer.byteLength(raw, 'utf8') > limitBytes) {
        res.status(413).json({ success: false, statusCode: 413, message: 'Request body too large' });
        done();
      }
    });

    req.on('end', () => {
      if (finished) return;

      if (raw.trim() === '') {
        req.body = {};
        done();
        return;
      }

      try {
        req.body = JSON.parse(stripJsonComments(raw));
        done();
      } catch (error) {
        done(error as Error);
      }
    });

    req.on('error', done);
  };
};

const parseLimit = (limit: string): number => {
  const match = /^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/i.exec(limit.trim());
  if (!match) return 1024 * 1024;

  const value = Number(match[1]);
  const unit = (match[2] ?? 'b').toLowerCase();
  const multiplier = unit === 'b' ? 1 : unit === 'kb' ? 1024 : unit === 'mb' ? 1024 * 1024 : 1024 * 1024 * 1024;

  return value * multiplier;
};
