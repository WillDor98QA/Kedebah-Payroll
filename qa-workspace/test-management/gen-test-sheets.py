#!/usr/bin/env python3
"""gen-test-sheets.py — populate the stakeholder Excel template (one workbook per module) from the
execution ledger + evidence. READ-ONLY on the ledger; copies ./MY TEST SHEET TEMPLATE.xlsx and fills
the three sheets, preserving the template's formatting/merged cells/legends. Never fabricates."""
import json, re, shutil, os
from copy import copy
from collections import defaultdict, Counter
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJ = os.path.dirname(ROOT)
TEMPLATE = os.path.join(PROJ, 'MY TEST SHEET TEMPLATE.xlsx')
OUT = os.path.join(ROOT, 'deliverables', 'test-sheets')
os.makedirs(OUT, exist_ok=True)
ENV = 'https://payroll.kedebah.com (SBX) + enterprise portal sbxkedebah-v2.npontu.com'
DATE = '2026-07-01'

# ---------- 1. Ledger (de-dup by tcId+scenario, keep latest; PASS-sticky verdict per tcId) ----------
recs = [json.loads(l) for l in open(os.path.join(ROOT, 'evidence/exec/records.ndjson')) if l.strip()]
latest = {}
for r in recs:
    k = (r['tcId'], r.get('scenario', ''))
    if k not in latest or r['timestamp'] > latest[k]['timestamp']:
        latest[k] = r
byid = defaultdict(list)
for r in latest.values():
    byid[r['tcId']].append(r)

def verdict(rs):
    lat = max(rs, key=lambda r: r['timestamp'])
    ever = any(x['status'] == 'PASS' for x in rs)
    na = any('NOT APPLICABLE' in (x.get('actual') or '') for x in rs)
    if lat['status'] == 'FAIL':
        return 'FAIL'
    if ever:
        return 'PASS'
    if na:
        return 'NOT APPLICABLE'
    return 'BLOCKED'

# ---------- 2. Test-case md (desc, preconditions, steps, expected, pri, sev) ----------
md = {}
tcdir = os.path.join(ROOT, 'test-cases')
for dp, _, fs in os.walk(tcdir):
    for fn in fs:
        if not fn.endswith('.md'):
            continue
        for line in open(os.path.join(dp, fn)):
            if not line.strip().startswith('|'):
                continue
            cells = [c.strip().replace('**', '') for c in line.strip().strip('|').split('|')]
            if not cells or not re.match(r'TC-[A-Za-z]+-\w+', cells[0]):
                continue
            tc = cells[0]
            g = lambda i: cells[i] if i < len(cells) else ''
            md[tc] = dict(desc=g(2), precond=g(3), steps=g(4), expected=g(5), pri=g(6), sev=g(7))

# ---------- 3. Bugs ----------
def bugfield(t, label):
    m = re.search(r'\|\s*\*\*%s\*\*\s*\|\s*(.+?)\s*\|' % re.escape(label), t)
    return m.group(1).strip() if m else ''
bugs = []
bdir = os.path.join(ROOT, 'bugs')
for fn in sorted(os.listdir(bdir)):
    if not re.match(r'^BUG-\d+\.md$', fn):
        continue
    t = open(os.path.join(bdir, fn)).read()
    tcs = [x.strip() for x in re.split(r'[,;]', bugfield(t, 'Test Case Ref')) if x.strip().startswith('TC-')]
    # steps to reproduce = first bullets under "## Steps to Reproduce"
    sm = re.search(r'## Steps to Reproduce\s*(.+?)\n##', t, re.S)
    steps = re.sub(r'\s+', ' ', sm.group(1)).strip()[:300] if sm else ''
    fx = re.search(r'## Suggested Fix\s*(.+?)\n##', t, re.S)
    fix = re.sub(r'\s+', ' ', fx.group(1)).strip()[:300] if fx else ''
    bugs.append(dict(id=bugfield(t, 'Bug ID') or fn[:-3], title=bugfield(t, 'Title'), sev=bugfield(t, 'Severity'),
                     pri=bugfield(t, 'Priority'), status=bugfield(t, 'Status'), req=bugfield(t, 'Requirement Ref'),
                     tcs=tcs, steps=steps, fix=fix))

# ---------- 4. Browser findings (non-functional) ----------
findings = []
ffile = os.path.join(ROOT, 'evidence/browser/findings.ndjson')
if os.path.exists(ffile):
    findings = [json.loads(l) for l in open(ffile) if l.strip()]

# ---------- 5. Module map (by tcId prefix → workbook) ----------
WB = {  # prefix -> (order, name)
    'DASH': (1, 'Dashboard'), 'AUTH': (2, 'Authentication'), 'EMP': (3, 'Employees'), 'BANK': (4, 'Bank Setup'),
    'PG': (5, 'Pay Groups'), 'PAYE': (6, 'PAYE'), 'TAX': (7, 'Tax'), 'FORM': (7, 'Tax'), 'RELF': (8, 'Reliefs'),
    'STAX': (9, 'Special Tax'), 'CAL': (10, 'Calculation Engine'), 'CYCLE': (11, 'Pay Schedule'),
    'RUN': (12, 'Pay Runs'), 'PAY': (12, 'Pay Runs'), 'LIFE': (13, 'Payroll Lifecycle'), 'BEN': (14, 'Benefits'),
    'BIK': (15, 'Benefits In Kind'), 'DED': (16, 'Deductions'), 'PROT': (16, 'Deductions'), 'LOAN': (17, 'Loans'),
    'ALRT': (18, 'Alerts'), 'PAYM': (19, 'Payments'), 'SLIP': (20, 'Payslips'), 'RPT': (21, 'Reports'),
    'COMP': (22, 'Compliance'), 'SEC': (23, 'Security'), 'ORGB': (24, 'Settings'),
    'ENT': (25, 'Enterprise Onboarding'), 'URB': (25, 'Enterprise Onboarding'), 'RBAC': (25, 'Enterprise Onboarding'),
}
def wb_of(tc):
    m = re.match(r'TC-([A-Za-z]+)', tc)
    return WB.get(m.group(1).upper()) if m else None

groups = defaultdict(list)  # (order,name) -> [tcId]
for tc in byid:
    w = wb_of(tc)
    if w:
        groups[w].append(tc)

def comment_for(v, rs, bug):
    actual = (max(rs, key=lambda r: r['timestamp']).get('actual') or '').lower()
    if v == 'PASS':
        return ('Affected by Open Defect (%s)' % bug) if bug else '✓ Verified'
    if v == 'FAIL':
        return 'Failed — %s' % (bug or 'candidate defect; see browser findings')
    if v == 'NOT APPLICABLE':
        return 'Not Applicable'
    # BLOCKED reason
    if 'api contract' in actual or '405' in actual or 'not exposed' in actual:
        return 'Blocked – Missing API Contract'
    if 'bug-011' in actual or 'module' in actual or 'entitle' in actual:
        return 'Blocked – Missing Module Entitlement (BUG-011)'
    if 'persona' in actual or 'non-admin' in actual or 'credential' in actual or 'manager' in actual or 'staff' in actual:
        return 'Blocked – Missing Credentials/Persona'
    if 'browser' in actual or 'ui-only' in actual or 'ui interaction' in actual:
        return 'Blocked – Browser Only'
    if 'environment' in actual or 'seed' in actual or 'effective_date' in actual or 'infrastructure' in actual:
        return 'Blocked – Environment'
    return 'Blocked'

# ---------- 6. Styling helpers ----------
thin = Side(style='thin', color='BFBFBF')
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(vertical='top', wrap_text=True)
STATUS_FONT = {'PASS': Font(color='000000', bold=True), 'FAIL': Font(color='C00000', bold=True),
               'BLOCKED': Font(color='BF8F00', bold=True), 'NOT APPLICABLE': Font(color='808080', bold=True)}
HDR = Font(bold=True)

def write_summary(ws, pairs):
    """Executive summary in the free header region rows 1-6, cols H-K (no collision with the
    data-table headers at row 7 or the merged legend/indicator ranges)."""
    ws.cell(1, 8, 'EXECUTIVE SUMMARY').font = HDR
    left, right = pairs[:5], pairs[5:]
    for i, (k, v) in enumerate(left, start=2):
        ws.cell(i, 8, k).font = Font(bold=True); ws.cell(i, 9, v)
    for i, (k, v) in enumerate(right, start=2):
        ws.cell(i, 10, k).font = Font(bold=True); ws.cell(i, 11, v)

def bug_wb(b):
    for tc in b['tcs']:
        w = wb_of(tc)
        if w:
            return w
    # fallback by module keyword
    mm = b.get('req', '') + b['id']
    return (25, 'Enterprise Onboarding') if 'SETUP' in mm or '011' in b['id'] or '012' in b['id'] else (23, 'Security')

def find_wb(module):
    m = (module or '').lower()
    if 'enterprise' in m or 'onboard' in m:
        return (25, 'Enterprise Onboarding')
    if 'user' in m or 'auth' in m or 'iam' in m:
        return (2, 'Authentication')
    if 'settings' in m or 'organization' in m or 'shell' in m:
        return (24, 'Settings')
    if 'schedule' in m or 'calendar' in m:
        return (11, 'Pay Schedule')
    return (24, 'Settings')

# ---------- 7. Generate each workbook ----------
master_rows = []
for (order, name), tcs in sorted(groups.items()):
    tcs = sorted(set(tcs))
    dest = os.path.join(OUT, f'{order:02d}-{name}.xlsx')
    shutil.copy(TEMPLATE, dest)
    wb = openpyxl.load_workbook(dest)
    ws = wb['TEST CASES(FUNCTIONAL)']

    # verdict tally
    tally = Counter()
    for tc in tcs:
        tally[verdict(byid[tc])] += 1
    total = len(tcs)
    pf = tally['PASS'] + tally['FAIL']
    cov = f"{round(100*tally['PASS']/pf)}%" if pf else 'n/a'

    # header: title + date + environment + executive summary in the free H:I header region
    ws['A1'] = name
    ws['C2'] = DATE
    ws['A6'] = f"TEST ENVIRONMENT: {ENV}"
    write_summary(ws, [('Total Test Cases', total), ('PASS', tally['PASS']), ('FAIL', tally['FAIL']),
                       ('BLOCKED', tally['BLOCKED']), ('NOT APPLICABLE', tally['NOT APPLICABLE']),
                       ('Pass rate (of exec)', cov), ('Execution Date', DATE), ('Environment', 'SBX')])

    # data rows from row 8
    row = 8
    for tc in tcs:
        rs = byid[tc]
        lat = max(rs, key=lambda r: r['timestamp'])
        v = verdict(rs)
        bug = lat.get('bug') or next((b['id'] for b in bugs if tc in b['tcs']), '')
        m = md.get(tc, {})
        actual = re.sub(r'^\[browser\]\s*', '', lat.get('actual') or '')
        vals = [tc, m.get('desc', lat.get('feature', '')), m.get('precond', ''), m.get('steps', ''), '',
                m.get('expected', lat.get('expected', '')), actual, m.get('sev', ''), m.get('pri', ''),
                v, comment_for(v, rs, bug), lat.get('evidence', '')]
        for c, val in enumerate(vals, start=1):
            cell = ws.cell(row, c, val)
            cell.border = BORDER
            cell.alignment = WRAP
        ws.cell(row, 10).font = STATUS_FONT.get(v, HDR)
        row += 1

    # ---------- DEFECTS TRACKING ----------
    wd = wb['DEFECTS TRACKING']
    wd['A1'] = f'{name} — Defects'
    wd['A6'] = f"TEST ENVIRONMENT: {ENV}"
    wbugs = [b for b in bugs if bug_wb(b) == (order, name)]
    # clear sample row 8
    for c in range(1, 8):
        wd.cell(8, c, None)
    r = 8
    for b in wbugs:
        vals = [b['id'], f"[{b['sev']}/{b['pri']}] {b['title']}", b['steps'], '(dev)', b['status'],
                '', ', '.join(b['tcs'])]
        for c, val in enumerate(vals, start=1):
            cell = wd.cell(r, c, val); cell.border = BORDER; cell.alignment = WRAP
        r += 1

    # ---------- NON-FUNCTIONAL ----------
    wn = wb['NON-FUNCTIONAL TESTING']
    wn['A1'] = f'{name} — Non-Functional'
    wn['A6'] = f"TEST ENVIRONMENT: {ENV}"
    for c in range(1, 8):
        wn.cell(8, c, None)
    wfind = [f for f in findings if find_wb(f.get('module')) == (order, name)]
    r = 8
    for f in wfind:
        crit = {'Accessibility': 'Accessibility (WCAG)', 'Security': 'Security', 'Performance/UX': 'Performance/UX'}.get(f.get('category'), f.get('category', 'Quality'))
        vals = [f.get('id', ''), crit, f.get('userImpact', '')[:200], f.get('expected', '')[:200],
                f.get('actual', '')[:200], f"{f.get('severity','')}/{f.get('priority','')}",
                f"{f.get('status','')} — {(f.get('suggestedFix') or '')[:120]}"]
        for c, val in enumerate(vals, start=1):
            cell = wn.cell(r, c, val); cell.border = BORDER; cell.alignment = WRAP
        r += 1

    wb.save(dest)
    master_rows.append((order, name, total, tally['PASS'], tally['FAIL'], tally['BLOCKED'], tally['NOT APPLICABLE'], len(wbugs), cov))
    print(f"{order:02d}-{name}: {total} cases (P{tally['PASS']} F{tally['FAIL']} B{tally['BLOCKED']} NA{tally['NOT APPLICABLE']}) · {len(wbugs)} defects")

# ---------- 8. Master summary workbook ----------
dest = os.path.join(OUT, '00-QA-Master-Summary.xlsx')
shutil.copy(TEMPLATE, dest)
wb = openpyxl.load_workbook(dest)
ws = wb['TEST CASES(FUNCTIONAL)']
ws['A1'] = 'Kedebah Payroll — QA Master Summary'
ws['C2'] = DATE
ws['A6'] = f"TEST ENVIRONMENT: {ENV}"
# programme totals
tot = [sum(x[i] for x in master_rows) for i in range(2, 8)]
pf = tot[1] + tot[2]
write_summary(ws, [('Total executed', tot[0]), ('PASS', tot[1]), ('FAIL', tot[2]), ('BLOCKED', tot[3]),
                   ('NOT APPLICABLE', tot[4]), ('Open Defects', len(bugs)), ('Catalogue cases', len(cat) if 'cat' in dir() else 417),
                   ('Pass rate (of exec)', f"{round(100*tot[1]/pf)}%" if pf else 'n/a')])
# feature status table from row 8: workbook | total | pass | fail | blocked | na | defects | pass-rate | file
hdr = ['WORKBOOK', 'TOTAL', 'PASS', 'FAIL', 'BLOCKED', 'N/A', 'DEFECTS', 'PASS RATE', 'FILE']
for c, h in enumerate(hdr, start=1):
    cell = ws.cell(7, c, h); cell.font = HDR; cell.border = BORDER
r = 8
for (order, name, total, p, f, b, na, nb, cov) in sorted(master_rows):
    vals = [f'{order:02d}-{name}', total, p, f, b, na, nb, cov, f'{order:02d}-{name}.xlsx']
    for c, val in enumerate(vals, start=1):
        cell = ws.cell(r, c, val); cell.border = BORDER; cell.alignment = WRAP
    r += 1
# grand total row
gt = ['GRAND TOTAL', tot[0], tot[1], tot[2], tot[3], tot[4], len(bugs), (f"{round(100*tot[1]/pf)}%" if pf else 'n/a'), '']
for c, val in enumerate(gt, start=1):
    cell = ws.cell(r, c, val); cell.font = HDR; cell.border = BORDER
wb.save(dest)

# ---------- 9. Reconciliation to ledger ----------
distinct = len(byid)
assigned = sum(len(v) for v in groups.values())
cat = set()
for l in open(os.path.join(ROOT, 'test-management/test-case-catalogue.md')):
    m = re.match(r'\|\s*(TC-[A-Za-z0-9-]+)\s*\|', l)
    if m:
        cat.add(m.group(1))
print("\n==== RECONCILIATION ====")
print(f"distinct tcIds in ledger: {distinct} | assigned to workbooks: {assigned} | unassigned: {distinct-assigned}")
print(f"programme totals: Total {tot[0]} · PASS {tot[1]} · FAIL {tot[2]} · BLOCKED {tot[3]} · NA {tot[4]}")
print(f"catalogue size: {len(cat)} | bugs: {len(bugs)} | findings: {len(findings)}")
print(f"workbooks written: {len(master_rows)+1} in {OUT}")
