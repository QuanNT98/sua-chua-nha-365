/**
 * Formula engine — TypeScript port of evaluateFormula / calculate / computeRow
 * from docs/index.html.
 *
 * The web version substituted column names into the formula text and ran it
 * through `Function(...)`. That allowed arbitrary code and broke when one column
 * name was a substring of another (e.g. `A` inside `AB`). This version parses
 * the formula instead: column names are whole identifier tokens, and only
 * arithmetic plus a small function whitelist is evaluated.
 *
 * Supported: numbers, + - * / % ^ (and ** as ^), parentheses, unary +/-,
 * column references, and abs/round/floor/ceil/min/max/sqrt/pow.
 */
import type { RecordContent, TableMeta } from '../types';

type Token =
  | { type: 'num'; value: number }
  | { type: 'id'; value: string }
  | { type: 'op'; value: string };

class FormulaError extends Error {}

const OPERATOR_CHARS = '+-*/%^(),';

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  abs: Math.abs,
  round: (x, digits = 0) => {
    const p = 10 ** digits;
    return Math.round(x * p) / p;
  },
  floor: Math.floor,
  ceil: Math.ceil,
  min: Math.min,
  max: Math.max,
  sqrt: Math.sqrt,
  pow: Math.pow,
};

function isSpace(ch: string) {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (isSpace(ch)) {
      i++;
      continue;
    }
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      const m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
      if (!m) throw new FormulaError(`Số không hợp lệ tại vị trí ${i}`);
      tokens.push({ type: 'num', value: parseFloat(m[0]) });
      i += m[0].length;
      continue;
    }
    if (ch === '*' && src[i + 1] === '*') {
      tokens.push({ type: 'op', value: '^' });
      i += 2;
      continue;
    }
    if (OPERATOR_CHARS.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    // Identifier: any run of characters that are not whitespace or operators.
    // Works for Unicode column names such as "Tên_bài".
    let j = i;
    while (j < src.length && !isSpace(src[j]) && !OPERATOR_CHARS.includes(src[j])) j++;
    tokens.push({ type: 'id', value: src.slice(i, j) });
    i = j;
  }
  return tokens;
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    const s = value.trim();
    return s === '' ? 0 : Number(s);
  }
  return NaN;
}

class Parser {
  private pos = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly row: RecordContent,
  ) {}

  parse(): number {
    const v = this.expr();
    if (this.pos < this.tokens.length) throw new FormulaError('Thừa ký tự cuối công thức');
    return v;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private isOp(value: string): boolean {
    const t = this.peek();
    return t?.type === 'op' && t.value === value;
  }

  private expect(value: string) {
    if (!this.isOp(value)) throw new FormulaError(`Thiếu "${value}"`);
    this.pos++;
  }

  private expr(): number {
    let v = this.term();
    while (this.isOp('+') || this.isOp('-')) {
      const op = (this.tokens[this.pos++] as { value: string }).value;
      const rhs = this.term();
      v = op === '+' ? v + rhs : v - rhs;
    }
    return v;
  }

  private term(): number {
    let v = this.unary();
    while (this.isOp('*') || this.isOp('/') || this.isOp('%')) {
      const op = (this.tokens[this.pos++] as { value: string }).value;
      const rhs = this.unary();
      v = op === '*' ? v * rhs : op === '/' ? v / rhs : v % rhs;
    }
    return v;
  }

  private unary(): number {
    if (this.isOp('-')) {
      this.pos++;
      return -this.unary();
    }
    if (this.isOp('+')) {
      this.pos++;
      return this.unary();
    }
    return this.power();
  }

  private power(): number {
    const base = this.primary();
    if (this.isOp('^')) {
      this.pos++;
      return base ** this.unary(); // right-associative
    }
    return base;
  }

  private primary(): number {
    const t = this.peek();
    if (!t) throw new FormulaError('Công thức kết thúc đột ngột');

    if (t.type === 'num') {
      this.pos++;
      return t.value;
    }

    if (t.type === 'id') {
      this.pos++;
      if (this.isOp('(')) {
        const fn = FUNCTIONS[t.value.toLowerCase()];
        if (!fn) throw new FormulaError(`Hàm không hỗ trợ: ${t.value}`);
        this.pos++;
        const args: number[] = [];
        if (!this.isOp(')')) {
          args.push(this.expr());
          while (this.isOp(',')) {
            this.pos++;
            args.push(this.expr());
          }
        }
        this.expect(')');
        return fn(...args);
      }
      if (!(t.value in this.row)) throw new FormulaError(`Không có cột: ${t.value}`);
      return toNumber(this.row[t.value]);
    }

    if (t.value === '(') {
      this.pos++;
      const v = this.expr();
      this.expect(')');
      return v;
    }

    throw new FormulaError(`Ký tự không mong đợi: ${t.value}`);
  }
}

/** Strip whitespace and a leading "=" (spreadsheet style). */
export function normalizeFormula(f: string | undefined | null): string {
  return (f ?? '').trim().replace(/^=/, '');
}

/** Evaluate a formula against a row. Returns NaN on any error, like the web app. */
export function evaluateFormula(row: RecordContent, formula: string): number {
  const src = normalizeFormula(formula);
  if (!src) return NaN;
  try {
    const result = new Parser(tokenize(src), row).parse();
    return Number.isFinite(result) ? result : NaN;
  } catch {
    return NaN;
  }
}

/** Explain why a formula fails, for the schema editor. Returns null when valid syntax. */
export function validateFormula(formula: string, columns: string[]): string | null {
  const src = normalizeFormula(formula);
  if (!src) return 'Công thức trống';
  const row = Object.fromEntries(columns.map((c) => [c, 1]));
  try {
    new Parser(tokenize(src), row).parse();
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

/**
 * Compute every formula column of a row. Runs up to 5 passes so formulas can
 * depend on other formula columns, stopping early once nothing changes.
 */
export function computeRow(row: RecordContent, meta: TableMeta): RecordContent {
  const result: RecordContent = { ...row };
  const formulaCols = Object.entries(meta).filter(([, cfg]) => cfg.type === 'formula');
  if (!formulaCols.length) return result;

  for (let pass = 0; pass < 5; pass++) {
    let changed = false;
    for (const [key, cfg] of formulaCols) {
      const next = evaluateFormula(result, cfg.formula ?? '');
      if (!Object.is(result[key], next)) {
        result[key] = next;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return result;
}
