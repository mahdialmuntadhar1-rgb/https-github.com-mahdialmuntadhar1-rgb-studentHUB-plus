#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'out');

const SCHOLARSHIP_COLUMNS = {
  title: 'Official Scholarship Name',
  organization: 'Host Country / Sponsoring Institution',
  url: 'Official Website URL',
  degree: 'Degree Levels',
  deadline: 'Typical Application Deadline',
  description: 'General Eligibility Requirements',
};

const JOB_COLUMNS = {
  id: 'Job_ID',
  governorate: 'Governorate',
  location: 'City_Center',
  organization: 'Employer_Company',
  title: 'Job_Title',
  description: 'Industry_Sector',
  sourcePlatform: 'Primary_Source_Platform',
  experience: 'Experience_Required',
  workplaceType: 'Employment_Type',
  verificationNote: 'Verification_Status',
};

const OUTPUT_COLUMNS = [
  'id',
  'source_row',
  'source_file',
  'category',
  'status',
  'title',
  'titleEN',
  'titleAR',
  'titleKU',
  'description',
  'contentEN',
  'contentAR',
  'contentKU',
  'organization',
  'country',
  'governorate',
  'governorateId',
  'location',
  'deadline',
  'application_link',
  'original_source_url',
  'salary',
  'degreeInfo',
  'workplaceType',
  'whoCanApply',
  'experience',
  'sourcePlatform',
  'verificationNote',
  'published_date',
  'imageUrl',
  'savedCount',
  'universityAppliedCount',
  'companyVerified',
  'duplicate_key',
  'reject_reason',
];

const GOVERNORATE_ALIASES = new Map([
  ['all', 'all'],
  ['all iraq', 'all'],
  ['iraq', 'all'],
  ['baghdad', 'baghdad'],
  ['بغداد', 'baghdad'],
  ['erbil', 'erbil'],
  ['hawler', 'erbil'],
  ['هەولێر', 'erbil'],
  ['اربيل', 'erbil'],
  ['أربيل', 'erbil'],
  ['sulaymaniyah', 'sulaymaniyah'],
  ['sulaimani', 'sulaymaniyah'],
  ['sulaymaniya', 'sulaymaniyah'],
  ['slemani', 'sulaymaniyah'],
  ['سلێمانی', 'sulaymaniyah'],
  ['السليمانية', 'sulaymaniyah'],
  ['duhok', 'duhok'],
  ['dohuk', 'duhok'],
  ['دهوك', 'duhok'],
  ['دهۆک', 'duhok'],
  ['nineveh', 'nineveh'],
  ['ninawa', 'nineveh'],
  ['mosul', 'nineveh'],
  ['نينوى', 'nineveh'],
  ['الموصل', 'nineveh'],
  ['kirkuk', 'kirkuk'],
  ['كركوك', 'kirkuk'],
  ['کەرکووک', 'kirkuk'],
  ['basra', 'basra'],
  ['البصرة', 'basra'],
  ['babil', 'babil'],
  ['babylon', 'babil'],
  ['بابل', 'babil'],
  ['karbala', 'karbala'],
  ['كربلاء', 'karbala'],
  ['najaf', 'najaf'],
  ['النجف', 'najaf'],
  ['diyala', 'diyala'],
  ['ديالى', 'diyala'],
  ['anbar', 'anbar'],
  ['الانبار', 'anbar'],
  ['الأنبار', 'anbar'],
  ['wasit', 'wasit'],
  ['واسط', 'wasit'],
  ['salah al-din', 'salahuddin'],
  ['salahaddin', 'salahuddin'],
  ['salahuddin', 'salahuddin'],
  ['صلاح الدين', 'salahuddin'],
  ['qadisiyah', 'qadisiyah'],
  ['diwaniyah', 'qadisiyah'],
  ['الديوانية', 'qadisiyah'],
  ['ذي قار', 'dhiqar'],
  ['dhi qar', 'dhiqar'],
  ['dhiqar', 'dhiqar'],
  ['nasiriyah', 'dhiqar'],
  ['maysan', 'maysan'],
  ['ميسان', 'maysan'],
  ['muthanna', 'muthanna'],
  ['المثنى', 'muthanna'],
  ['halabja', 'halabja'],
  ['حلبجة', 'halabja'],
  ['هەڵەبجە', 'halabja'],
]);

function parseArgs(argv) {
  const args = {
    mode: 'full',
    scholarships: [],
    jobs: [],
    inputs: [],
    outDir: OUT_DIR,
  };

  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === '--mode' && next) {
      args.mode = next.toLowerCase();
      i++;
    } else if (token === '--test') {
      args.mode = 'test';
    } else if ((token === '--scholarships' || token === '--scholarship') && next) {
      args.scholarships.push(next);
      i++;
    } else if (token === '--jobs' && next) {
      args.jobs.push(next);
      i++;
    } else if ((token === '--input' || token === '--file') && next) {
      args.inputs.push(next);
      i++;
    } else if (token === '--out' && next) {
      args.outDir = path.resolve(next);
      i++;
    } else if (!token.startsWith('--')) {
      args.inputs.push(token);
    }
  }

  if (!['full', 'test'].includes(args.mode)) {
    throw new Error(`Invalid --mode "${args.mode}". Use "test" or "full".`);
  }

  return args;
}

function clean(value) {
  return String(value ?? '')
    .replace(/\uFEFF/g, '')
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeHeader(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[\s_\-/()]+/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function get(row, exactName) {
  if (Object.prototype.hasOwnProperty.call(row, exactName)) return clean(row[exactName]);
  const wanted = normalizeHeader(exactName);
  for (const [key, value] of Object.entries(row)) {
    if (normalizeHeader(key) === wanted) return clean(value);
  }
  return '';
}

function hasColumns(row, columns) {
  const keys = new Set(Object.keys(row).map(normalizeHeader));
  return Object.values(columns).some((column) => keys.has(normalizeHeader(column)));
}

function parseCSV(text) {
  const rows = [];
  let field = '';
  let row = [];
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i++;
      row.push(field);
      rows.push(row);
      field = '';
      row = [];
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((r) => r.some((cell) => clean(cell)));
  if (nonEmptyRows.length === 0) return [];

  const headers = nonEmptyRows[0].map(clean);
  return nonEmptyRows.slice(1).map((cells, index) => {
    const obj = { __rowNumber: index + 2 };
    headers.forEach((header, columnIndex) => {
      obj[header] = clean(cells[columnIndex]);
    });
    return obj;
  });
}

function readExcelRows(filePath) {
  let xlsx;
  try {
    xlsx = require('xlsx');
  } catch (error) {
    throw new Error(
      `Excel file detected but the "xlsx" package is not installed. Run "npm install" first. File: ${filePath}`
    );
  }

  const workbook = xlsx.readFile(filePath, { cellDates: false });
  const rows = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetRows = xlsx.utils.sheet_to_json(sheet, { defval: '', raw: false });
    sheetRows.forEach((row, index) => rows.push({ ...row, __rowNumber: index + 2, __sheetName: sheetName }));
  }
  return rows;
}

function readRows(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.xlsx' || extension === '.xls') {
    return readExcelRows(filePath);
  }
  if (extension === '.csv' || extension === '.txt') {
    return parseCSV(fs.readFileSync(filePath, 'utf8'));
  }
  if (extension === '.json') {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(parsed) ? parsed.map((row, index) => ({ ...row, __rowNumber: index + 1 })) : [];
  }
  return [];
}

function findCandidateFiles(explicitFiles) {
  const searchRoots = [ROOT, path.join(ROOT, 'data'), path.join(ROOT, 'input'), path.join(ROOT, 'imports')];
  const extensions = new Set(['.csv', '.xlsx', '.xls', '.json', '.txt']);
  const found = new Set(explicitFiles.map((file) => path.resolve(file)));

  for (const root of searchRoots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      const full = path.join(root, entry.name);
      if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
        found.add(full);
      }
    }
  }

  return [...found].filter((file) => fs.existsSync(file));
}

function resolveGovernorate(value) {
  const raw = clean(value).toLowerCase();
  if (!raw) return 'all';
  if (GOVERNORATE_ALIASES.has(raw)) return GOVERNORATE_ALIASES.get(raw);
  for (const [alias, id] of GOVERNORATE_ALIASES.entries()) {
    if (raw.includes(alias)) return id;
  }
  return 'all';
}

function stableId(prefix, values) {
  const hash = crypto
    .createHash('sha1')
    .update(values.map((value) => clean(value).toLowerCase()).join('|'))
    .digest('hex')
    .slice(0, 12);
  return `${prefix}-${hash}`;
}

function duplicateKeyFor(item) {
  if (item.category === 'job' && clean(item.id)) return `job-id:${clean(item.id).toLowerCase()}`;
  return [
    item.category,
    clean(item.title).toLowerCase(),
    clean(item.organization).toLowerCase(),
    clean(item.governorateId).toLowerCase(),
    clean(item.location).toLowerCase(),
    clean(item.application_link).toLowerCase(),
  ].join('|');
}

function mapScholarship(row, filePath) {
  const title = get(row, SCHOLARSHIP_COLUMNS.title);
  const organization = get(row, SCHOLARSHIP_COLUMNS.organization);
  const url = get(row, SCHOLARSHIP_COLUMNS.url);
  const degreeInfo = get(row, SCHOLARSHIP_COLUMNS.degree);
  const deadline = get(row, SCHOLARSHIP_COLUMNS.deadline);
  const description = get(row, SCHOLARSHIP_COLUMNS.description);

  const item = {
    id: stableId('scholarship', [title, organization, url]),
    source_row: row.__rowNumber || '',
    source_file: path.relative(ROOT, filePath),
    category: 'scholarship',
    status: 'approved',
    title,
    titleEN: title,
    titleAR: '',
    titleKU: '',
    description,
    contentEN: description,
    contentAR: '',
    contentKU: '',
    organization,
    country: 'International',
    governorate: 'All Iraq',
    governorateId: 'all',
    location: organization,
    deadline,
    application_link: url,
    original_source_url: url,
    salary: degreeInfo,
    degreeInfo,
    workplaceType: '',
    whoCanApply: description,
    experience: '',
    sourcePlatform: 'Official Scholarship Website',
    verificationNote: 'Manual scholarship import',
    published_date: new Date().toISOString().slice(0, 10),
    imageUrl: '',
    savedCount: 0,
    universityAppliedCount: 0,
    companyVerified: 1,
  };
  item.duplicate_key = duplicateKeyFor(item);
  item.reject_reason = '';
  return item;
}

function mapJob(row, filePath) {
  const jobId = get(row, JOB_COLUMNS.id);
  const governorate = get(row, JOB_COLUMNS.governorate);
  const location = get(row, JOB_COLUMNS.location);
  const organization = get(row, JOB_COLUMNS.organization);
  const title = get(row, JOB_COLUMNS.title);
  const description = get(row, JOB_COLUMNS.description);
  const sourcePlatform = get(row, JOB_COLUMNS.sourcePlatform);
  const experience = get(row, JOB_COLUMNS.experience);
  const workplaceType = get(row, JOB_COLUMNS.workplaceType);
  const verificationNote = get(row, JOB_COLUMNS.verificationNote);
  const governorateId = resolveGovernorate(governorate);

  const item = {
    id: jobId || stableId('job', [title, organization, governorate, location]),
    source_row: row.__rowNumber || '',
    source_file: path.relative(ROOT, filePath),
    category: 'job',
    status: 'approved',
    title,
    titleEN: title,
    titleAR: '',
    titleKU: '',
    description,
    contentEN: description,
    contentAR: '',
    contentKU: '',
    organization,
    country: 'Iraq',
    governorate,
    governorateId,
    location,
    deadline: '',
    application_link: '',
    original_source_url: '',
    salary: '',
    degreeInfo: '',
    workplaceType,
    whoCanApply: experience,
    experience,
    sourcePlatform,
    verificationNote,
    published_date: new Date().toISOString().slice(0, 10),
    imageUrl: '',
    savedCount: 0,
    universityAppliedCount: 0,
    companyVerified: verificationNote ? 1 : 0,
  };
  item.duplicate_key = duplicateKeyFor(item);
  item.reject_reason = '';
  return item;
}

function classifyRows(rows, filePath, forcedType) {
  if (rows.length === 0) return [];
  const firstMeaningful = rows.find((row) => Object.keys(row).some((key) => key !== '__rowNumber' && clean(row[key])));
  if (!firstMeaningful) return [];

  let type = forcedType;
  if (!type) {
    if (hasColumns(firstMeaningful, JOB_COLUMNS)) type = 'job';
    if (hasColumns(firstMeaningful, SCHOLARSHIP_COLUMNS)) type = 'scholarship';
  }

  if (type === 'job') return rows.map((row) => mapJob(row, filePath));
  if (type === 'scholarship') return rows.map((row) => mapScholarship(row, filePath));
  return [];
}

function csvEscape(value) {
  const text = clean(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCSV(filePath, rows) {
  const lines = [OUTPUT_COLUMNS.join(',')];
  for (const row of rows) {
    lines.push(OUTPUT_COLUMNS.map((column) => csvEscape(row[column])).join(','));
  }
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function writeSummary(filePath, summary) {
  fs.writeFileSync(filePath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}

function run() {
  const args = parseArgs(process.argv);
  const explicitFiles = [...args.inputs, ...args.scholarships, ...args.jobs];
  const candidateFiles = findCandidateFiles(explicitFiles);

  if (candidateFiles.length === 0) {
    throw new Error('No input files found. Pass --scholarships <file.xlsx> and/or --jobs <file.csv>, or place files in ./data, ./input, or ./imports.');
  }

  const cleanRows = [];
  const rejectedRows = [];
  const duplicateRows = [];
  const seen = new Map();
  const files = [];
  const testLimit = args.mode === 'test' ? 30 : Number.POSITIVE_INFINITY;

  for (const filePath of candidateFiles) {
    const resolved = path.resolve(filePath);
    const forcedType = args.jobs.map((file) => path.resolve(file)).includes(resolved)
      ? 'job'
      : args.scholarships.map((file) => path.resolve(file)).includes(resolved)
        ? 'scholarship'
        : '';

    const rawRows = readRows(resolved);
    const mappedRows = classifyRows(rawRows, resolved, forcedType);
    if (mappedRows.length === 0) {
      files.push({ file: path.relative(ROOT, resolved), detected_type: 'unknown', total_rows: rawRows.length, clean_rows: 0, rejected_rows: 0, duplicate_rows: 0 });
      continue;
    }

    let fileClean = 0;
    let fileRejected = 0;
    let fileDuplicates = 0;

    for (const item of mappedRows) {
      if (cleanRows.length >= testLimit) break;

      if (!clean(item.title)) {
        item.reject_reason = 'missing_title';
        rejectedRows.push(item);
        fileRejected++;
        continue;
      }

      if (seen.has(item.duplicate_key)) {
        item.reject_reason = `duplicate_of_row_${seen.get(item.duplicate_key)}`;
        duplicateRows.push(item);
        rejectedRows.push(item);
        fileDuplicates++;
        fileRejected++;
        continue;
      }

      seen.set(item.duplicate_key, item.source_row || cleanRows.length + 1);
      cleanRows.push(item);
      fileClean++;
    }

    files.push({
      file: path.relative(ROOT, resolved),
      detected_type: mappedRows[0]?.category || 'unknown',
      total_rows: rawRows.length,
      clean_rows: fileClean,
      rejected_rows: fileRejected,
      duplicate_rows: fileDuplicates,
    });
  }

  fs.mkdirSync(args.outDir, { recursive: true });
  writeCSV(path.join(args.outDir, 'manual_import_clean.csv'), cleanRows);
  writeCSV(path.join(args.outDir, 'manual_import_rejected.csv'), rejectedRows);
  writeCSV(path.join(args.outDir, 'manual_import_duplicates.csv'), duplicateRows);

  const summary = {
    mode: args.mode,
    generated_at: new Date().toISOString(),
    output_dir: path.relative(ROOT, args.outDir) || '.',
    files,
    totals: {
      clean: cleanRows.length,
      rejected: rejectedRows.length,
      duplicates: duplicateRows.length,
      missing_title: rejectedRows.filter((row) => row.reject_reason === 'missing_title').length,
    },
    rules: {
      only_reject_if: ['missing title', 'duplicate'],
      jobs_application_link: 'empty string when no direct URL is present',
      deadline_required: false,
      arabic_kurdish_required: false,
      default_governorateId: 'all',
      status: 'approved',
    },
  };
  writeSummary(path.join(args.outDir, 'manual_import_summary.json'), summary);

  console.log(JSON.stringify(summary, null, 2));
}

try {
  run();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
