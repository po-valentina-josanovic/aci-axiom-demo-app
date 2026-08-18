// ─────────────────────────────────────────────────────────────────────────────
// Trade → Phase Code Division Association — seed data.
//
// Three tables are rendered from these, in order: General, Shop, Field.
// Scope codes come from the Vista PC Scope Trades lookup; inactive ones
// (active: 'N') are legacy two-letter codes kept for historical mapping only.
// ─────────────────────────────────────────────────────────────────────────────

export const SCOPE_CODES = [
  { code: 'CIVIL',      description: 'Civil',                        keyId: 36, active: 'Y' },
  { code: 'CV',         description: 'Civil',                        keyId: 30, active: 'N' },
  { code: 'EL',         description: 'Electrical',                   keyId: 21, active: 'N' },
  { code: 'ELEC',       description: 'Electrical',                   keyId: 35, active: 'Y' },
  { code: 'ELECSHOP',   description: 'Electrical Shop',              keyId: 32, active: 'Y' },
  { code: 'FIREPR',     description: 'Fire Protection',              keyId: 43, active: 'Y' },
  { code: 'FP',         description: 'Fire Protection',              keyId: 23, active: 'N' },
  { code: 'HV',         description: 'HVAC (including Sheetmetal)',  keyId: 24, active: 'N' },
  { code: 'HVAC',       description: 'HVAC (including Sheetmetal)',  keyId: 39, active: 'Y' },
  { code: 'IRONWRK',    description: 'Ironworkers',                  keyId: 41, active: 'Y' },
  { code: 'IW',         description: 'Ironworkers',                  keyId: 25, active: 'N' },
  { code: 'MILLWRIGHT', description: 'Millwright / Rigging',         keyId: 42, active: 'Y' },
  { code: 'MW',         description: 'Millwright / Rigging',         keyId: 26, active: 'N' },
  { code: 'PI',         description: 'Piping',                       keyId: 27, active: 'N' },
  { code: 'PIPESHOP',   description: 'Piping Shop',                  keyId: 33, active: 'Y' },
  { code: 'PIPING',     description: 'Piping',                       keyId: 37, active: 'Y' },
  { code: 'PL',         description: 'Plumbing',                     keyId: 28, active: 'N' },
  { code: 'PLUMBING',   description: 'Plumbing',                     keyId: 38, active: 'Y' },
  { code: 'PLUMBSHOP',  description: 'Plumbing Shop',                keyId: 31, active: 'Y' },
  { code: 'SHEETMTL',   description: 'Sheetmetal',                   keyId: 40, active: 'Y' },
  { code: 'SM',         description: 'Sheetmetal',                   keyId: 29, active: 'N' },
  { code: 'SMSHOP',     description: 'Sheet Metal Shop',             keyId: 34, active: 'Y' },
];

export const BLANK_ROW_EXTRA = {
  dailyProduction: [],
  masterManpower: [],
  nonProductive: false,
  active: true,
  scopeMappings: [],
};

export const INITIAL_GENERAL = [
  { id: 1, prefixFrom: '10000', prefixTo: '10999', trade: 'General Conditions', tradeAbbr: 'GC',         ...BLANK_ROW_EXTRA },
  { id: 2, prefixFrom: '40000', prefixTo: '40999', trade: 'Equipment Rented',   tradeAbbr: 'Equip Rent', ...BLANK_ROW_EXTRA },
  { id: 3, prefixFrom: '41000', prefixTo: '41999', trade: 'Equipment Owned',    tradeAbbr: 'Equip Owned',...BLANK_ROW_EXTRA },
  { id: 4, prefixFrom: '50000', prefixTo: '50999', trade: 'Materials - Rough',  tradeAbbr: 'MTL RI',     ...BLANK_ROW_EXTRA },
  { id: 5, prefixFrom: '55000', prefixTo: '55999', trade: 'Materials - Equip',  tradeAbbr: 'MTL Equip',  ...BLANK_ROW_EXTRA },
  { id: 6, prefixFrom: '60000', prefixTo: '60999', trade: 'Subs',               tradeAbbr: 'SUB',        ...BLANK_ROW_EXTRA },
  { id: 7, prefixFrom: '90000', prefixTo: '90999', trade: 'Contingency and OH', tradeAbbr: 'Cont',       ...BLANK_ROW_EXTRA },
];

export const INITIAL_SHOP = [
  { id: 1, prefixFrom: '11000', prefixTo: '11999', trade: 'VDC',              tradeAbbr: 'VDC',       dailyProduction: [], masterManpower: ['9905'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 2, prefixFrom: '12000', prefixTo: '12999', trade: 'Plumbing Shop',    tradeAbbr: 'PL Shop',   dailyProduction: [], masterManpower: ['9920'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 3, prefixFrom: '13000', prefixTo: '13999', trade: 'Pipe Shop',        tradeAbbr: 'Pipe Shop', dailyProduction: [], masterManpower: ['0010,9930'], nonProductive: false, active: true,  scopeMappings: [] },
  { id: 4, prefixFrom: '14000', prefixTo: '14999', trade: 'Sheet Metal Shop', tradeAbbr: 'SM Shop',   dailyProduction: [], masterManpower: ['9940'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 5, prefixFrom: '15000', prefixTo: '15999', trade: 'Steel Shop',       tradeAbbr: 'STL Shop',  dailyProduction: [], masterManpower: ['0028'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 6, prefixFrom: '16000', prefixTo: '16999', trade: 'Paint/Blast Shop', tradeAbbr: 'PB Shop',   dailyProduction: [], masterManpower: ['9910'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 7, prefixFrom: '17000', prefixTo: '17999', trade: '17 OPEN',          tradeAbbr: '',          dailyProduction: [], masterManpower: [],            nonProductive: false, active: false, scopeMappings: [] },
  { id: 8, prefixFrom: '18000', prefixTo: '18999', trade: 'Electrical Shop',  tradeAbbr: 'EL Shop',   dailyProduction: [], masterManpower: ['9980'],      nonProductive: false, active: true,  scopeMappings: [] },
  { id: 9, prefixFrom: '19000', prefixTo: '19999', trade: 'Tool deliveries',  tradeAbbr: '',          dailyProduction: [], masterManpower: [],            nonProductive: false, active: true,  scopeMappings: [] },
];

export const INITIAL_FIELD = [
  { id: 1,  prefixFrom: '20000', prefixTo: '20999', trade: 'Field Supervision/Support', tradeAbbr: 'NP',    dailyProduction: ['9910'],                     masterManpower: ['9910'],            nonProductive: true,  active: true, scopeMappings: [] },
  { id: 2,  prefixFrom: '22000', prefixTo: '22999', trade: 'Plumbing',                  tradeAbbr: 'PL',    dailyProduction: ['9920,9930'],                masterManpower: ['9920'],            nonProductive: false, active: true, scopeMappings: [] },
  { id: 3,  prefixFrom: '23000', prefixTo: '23999', trade: 'Pipe',                      tradeAbbr: 'Pipe',  dailyProduction: ['9920,9930'],                masterManpower: ['0005P,0602,9930'], nonProductive: false, active: true, scopeMappings: [] },
  { id: 4,  prefixFrom: '24000', prefixTo: '24999', trade: 'Sheet Metal',               tradeAbbr: 'SM',    dailyProduction: ['9940'],                     masterManpower: ['9940'],            nonProductive: false, active: true, scopeMappings: [] },
  { id: 5,  prefixFrom: '25000', prefixTo: '25190', trade: 'Ironworkers (Steel)',       tradeAbbr: 'IW',    dailyProduction: ['0005,0028,0079'],           masterManpower: ['0005,0028,0079'],  nonProductive: false, active: true, scopeMappings: [] },
  { id: 6,  prefixFrom: '25300', prefixTo: '25399', trade: 'Millwrights',               tradeAbbr: 'MW',    dailyProduction: ['0715,1402'],                masterManpower: ['0715,1402'],       nonProductive: false, active: true, scopeMappings: [] },
  { id: 7,  prefixFrom: '26000', prefixTo: '26999', trade: '26 OPEN',                   tradeAbbr: '',      dailyProduction: [],                           masterManpower: [],                  nonProductive: false, active: true, scopeMappings: [] },
  { id: 8,  prefixFrom: '27000', prefixTo: '27999', trade: 'Fire Protection',           tradeAbbr: 'FP',    dailyProduction: ['9970'],                     masterManpower: ['9970'],            nonProductive: false, active: true, scopeMappings: [] },
  { id: 9,  prefixFrom: '28000', prefixTo: '28999', trade: 'Electrical',                tradeAbbr: 'EL',    dailyProduction: ['9980'],                     masterManpower: ['9980'],            nonProductive: false, active: true, scopeMappings: [] },
  { id: 10, prefixFrom: '29000', prefixTo: '29999', trade: 'Equipment Setting',         tradeAbbr: 'Equip', dailyProduction: ['9910,9920,9930,9940,9970'], masterManpower: [],                  nonProductive: false, active: true, scopeMappings: [] },
];
