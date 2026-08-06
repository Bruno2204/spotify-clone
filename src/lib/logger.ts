type Level = 'debug' | 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown> | undefined;

const COLORS = {
  debug: '\x1b[90m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  reset: '\x1b[0m',
} as const;

const LEVEL_RANK: Record<Level, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const activeRank: number = import.meta.env.DEV
  ? LEVEL_RANK.debug
  : LEVEL_RANK.info;

function shouldLog(level: Level): boolean {
  return LEVEL_RANK[level] >= activeRank;
}

function timestamp(): string {
  return new Date().toISOString();
}

function formatDev(level: Level, msg: string, meta: LogMeta): string {
  const color = COLORS[level];
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${color}[${timestamp()}] [${level.toUpperCase()}]${COLORS.reset} ${msg}${metaStr}`;
}

function formatProd(level: Level, msg: string, meta: LogMeta): string {
  return JSON.stringify({ ts: timestamp(), level, msg, ...(meta ?? {}) });
}

function log(level: Level, msg: string, meta?: LogMeta): void {
  if (!shouldLog(level)) return;
  if (import.meta.env.DEV) {
    const line = formatDev(level, msg, meta);
    if (level === 'error' || level === 'warn') {
      console.error(line);
    } else {
      console.log(line);
    }
    return;
  }
  console.error(formatProd(level, msg, meta));
}

export const logger = {
  debug(msg: string, meta?: LogMeta): void {
    log('debug', msg, meta);
  },
  info(msg: string, meta?: LogMeta): void {
    log('info', msg, meta);
  },
  warn(msg: string, meta?: LogMeta): void {
    log('warn', msg, meta);
  },
  error(msg: string, meta?: LogMeta): void {
    log('error', msg, meta);
  },
};
