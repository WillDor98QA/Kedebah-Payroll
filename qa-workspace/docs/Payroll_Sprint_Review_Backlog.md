# Page 1

PAYROLL SOFTWARE
Sprint Review Backlog: User Stories, Acceptance Criteria & Definition
of Done
Prepared for Stakeholder Sprint Review
Classification: Confidential — Internal Use Only


# Page 2

How This Backlog Is Structured
The source PRD defines 16 prioritised requirements (PRQ-001 to PRQ-016). Several of these
requirements — PRQ-004, PRQ-005, PRQ-007, PRQ-010, PRQ-012, and PRQ-014 — bundle
multiple independently testable and shippable pieces of functionality. To make this backlog
sprint-ready, each PRQ is retained as an Epic for traceability back to the PRD, and broken
down into right-sized User Stories below it. In total, the 16 PRQs map to 31 user stories.
PRQ-005 (Attendance Integration) is the largest item, split into 6 stories. PRQ-012 (Dynamic
Bonus Entry) is split into 4 stories, and its acceptance criteria have been reconciled — the
source PRD contained two overlapping AC blocks for this item, which have been merged
without duplication.
Two cross-cutting dependencies are worth flagging to stakeholders during planning: (1) PRQ-
013 (Combined Regular + Bonus Run) depends on PRQ-012 (Dynamic Bonus Entry) being
completed first, as it reuses the Bonus Entry Table directly; and (2) PRQ-005 (Attendance
Integration) and PRQ-015 (Payroll Lock After Approval) both define gating conditions on payroll
approval and should be reconciled if scheduled in overlapping sprints.
Each User Story below follows the standard format “As a [role], I want [goal], so that [benefit]”,
and is accompanied by Acceptance Criteria (in Given/When/Then form, drawn directly from the
PRD's functional and non-functional requirements).
Definition of Done is built in three layers: (1) a short process checklist applied to every story
(code reviewed, tested, deployed to QA, PO sign-off); (2) one verification item per Acceptance
Criterion above, generated directly from that criterion's expected outcome — so every AC has a
corresponding “done” check and nothing can be marked complete without being individually
verified; and (3) any story-specific additional checks (e.g. encryption review) not already
captured by an AC.
A coverage re-pass against the source PRD identified three acceptance criteria that were
implied by Non-Functional Requirements but not explicitly stated as testable AC in the first draft:
(1) PRQ-005 — the Review Queue's role restriction (only authenticated Payroll/HR
Administrators may review, edit, approve, or reject records, with all actions logged); (2) PRQ-
007 — the Budget Setup table must save within 2 seconds for up to 12 monthly/4 quarterly
periods, and budget create/edit/approve/unlock is restricted to Finance Admin/Super Admin;
and (3) PRQ-014 — the 10-second, 1,000-employee export performance target applies to the
GRA PAYE and SSNIT exports as well as the bank file. All three have been added below.


# Page 3

Table of Contents
How This Backlog Is Structured ................................................................................ 2
Table of Contents .................................................................................................... 3
PRQ-001: File Upload on Mark as Paid & Payroll History Summary ............................. 5
US-001 ............................................................................................................................. 5
PRQ-002: Third-Party Tax Payment File Import (GRA, SSNIT, Petra) ............................ 7
US-002 ............................................................................................................................. 7
PRQ-003: Standard Benefits Policy List (Ghana Jurisdiction) ...................................... 9
US-003a ........................................................................................................................... 9
US-003b .......................................................................................................................... 10
PRQ-004: Leave Policy Setup & With/Without Pay Integration with Payroll ................ 12
US-004a .......................................................................................................................... 12
US-004b .......................................................................................................................... 13
US-004c .......................................................................................................................... 14
US-004d .......................................................................................................................... 15
PRQ-005: Attendance Integration with Automated Insertion & Review Action ............ 16
US-005a .......................................................................................................................... 16
US-005b .......................................................................................................................... 17
US-005c .......................................................................................................................... 18
US-005d .......................................................................................................................... 18
US-005e .......................................................................................................................... 20
US-005f .......................................................................................................................... 21
PRQ-006: Dynamic Payment Frequency Periods at Setup ......................................... 22
US-006 ............................................................................................................................ 22
PRQ-007: Payroll Budget Setup & Processing Amount Deviation Trend Dashboard .... 24
US-007a .......................................................................................................................... 24
US-007b .......................................................................................................................... 25
PRQ-008: Employee Summary Dashboard by Employee Type ................................... 28


# Page 4

US-008 ............................................................................................................................ 28
PRQ-009: Penalties by Amount and Percentage in Tax & Statutory Setup .................. 30
US-009 ............................................................................................................................ 30
PRQ-010: Loan & Salary Advance Initiation from Staff PIM into Payroll ...................... 32
US-010a .......................................................................................................................... 32
US-010b .......................................................................................................................... 33
PRQ-011: Payslip Download Functionality ............................................................... 34
US-011 ............................................................................................................................ 34
PRQ-012: Dynamic Bonus Entry (Varying Amounts per Employee) ............................. 36
US-012a .......................................................................................................................... 36
US-012b .......................................................................................................................... 37
US-012c .......................................................................................................................... 38
US-012d .......................................................................................................................... 39
PRQ-013: Combined Regular + Bonus Payroll Run .................................................... 40
US-013 ............................................................................................................................ 40
PRQ-014: Bank Payment File Export, GRA PAYE Schedule & SSNIT Export ................. 42
US-014a .......................................................................................................................... 42
US-014b .......................................................................................................................... 43
US-014c .......................................................................................................................... 44
PRQ-015: Payroll Lock After Approval ...................................................................... 45
US-015 ............................................................................................................................ 45
PRQ-016: Bulk Salary Update Tool ........................................................................... 47
US-016 ............................................................................................................................ 47


# Page 5

PRQ-001: File Upload on Mark as Paid & Payroll History
Summary
Category Payroll Processing
Priority High
Story Count 1
US-001
As a HR Administrator, I want to attach supporting documents (e.g. bank
transfer receipts, payment confirmations) when marking a payroll run as paid,
User Story
so that I have an auditable record of payment evidence linked to that payroll
run.
• Given I am on the 'Mark as Paid' confirmation screen, when I open the file
upload control, then I can attach PDF, PNG, JPG, or XLSX files up to 10
MB each, and attach multiple files to a single run.
• Given I attempt to upload an unsupported file type or a file exceeding 10
MB, when I submit, then the system displays a clear error message and
blocks the upload.
• Given a payroll run has attachments, when I view the Payroll History
Summary, then an attachment indicator (e.g. paperclip icon) is displayed for
Acceptance
Criteria that run.
• Given I hold the Payroll Manager or Admin role, when I open a run with
attachments, then I can view, download, and delete the files; users without
this role cannot see the delete/download controls.
• Given any file is uploaded, viewed, or deleted, when the action completes,
then an audit log entry records the user, timestamp, and action performed.
• Given a 10 MB file is uploaded on a standard broadband connection, when
upload completes, then it finishes within 5 seconds.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
Definition of
Done ☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: I can attach PDF, PNG, JPG, or XLSX files up to 10 MB each, and
attach multiple files to a single run.
☐ Verified: The system displays a clear error message and blocks the upload.
☐ Verified: An attachment indicator (e.g. paperclip icon) is displayed for that
run.


# Page 6

☐ Verified: I can view, download, and delete the files; users without this role
cannot see the delete/download controls.
☐ Verified: An audit log entry records the user, timestamp, and action
performed.
☐ Verified: It finishes within 5 seconds.
Additional checks for this story
☐ Stored files confirmed encrypted at rest using AES-256 (security review
completed)


# Page 7

PRQ-002: Third-Party Tax Payment File Import (GRA, SSNIT,
Petra)
Category Integrations
Priority High
Story Count 1
US-002
As a HR / Finance user, I want to import tax payment records exported from
User Story Petra App or other GRA-aligned platforms, so that externally paid statutory
taxes are reflected in payroll without manual re-entry.
• Given the import interface, when I upload a CSV or XLSX file matching the
published template, then the system validates each row against Employee
ID, Tax Type, Period, Amount Paid, and Reference Number.
• Given a file contains rows with missing or invalid required fields, when I
submit it, then a line-by-line validation report is displayed and all errors
must be resolved before the import finalises.
• Given a file contains a tax payment reference number that already exists in
the system, when I import it, then that row is flagged as a duplicate and
Acceptance
blocked from import.
Criteria
• Given an import completes successfully, when I view the payroll run's tax
ledger or the employee tax summary, then the imported records are
reflected and traceable to their source file.
• Given any import is executed, when it completes, then an import history log
records the filename, date/time, importing user, and count of records
processed.
• Given a file containing up to 5,000 rows, when imported, then the system
processes it without performance degradation.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
Definition of ☐ No critical or high-severity defects open against this story
Done
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: The system validates each row against Employee ID, Tax Type,
Period, Amount Paid, and Reference Number.
☐ Verified: A line-by-line validation report is displayed and all errors must be
resolved before the import finalises.


# Page 8

☐ Verified: That row is flagged as a duplicate and blocked from import.
☐ Verified: The imported records are reflected and traceable to their source
file.
☐ Verified: An import history log records the filename, date/time, importing
user, and count of records processed.
☐ Verified: The system processes it without performance degradation.
Additional checks for this story
☐ Import template / format specification document published and accessible
within the application


# Page 9

PRQ-003: Standard Benefits Policy List (Ghana Jurisdiction)
Category Compliance & Statutory
Priority High
Story Count 2
US-003a
As a Super Admin, I want the system to ship with a pre-configured, Ghana-
User Story compliant list of statutory and common voluntary benefit types, so that new
payroll setups are compliant by default and consistent across the platform.
• Given a new system setup, when I open Benefits Setup, then Basic Salary,
Housing Allowance, Transport Allowance, Overtime Pay, End-of-Service
Benefit, SSNIT Contribution (Employee & Employer), PAYE Tax, Bonus,
and Overtime Allowance appear pre-loaded.
• Given any pre-loaded or custom benefit type, when I inspect it, then it has
defined Name, Category (Statutory/Voluntary), Taxability (Taxable/Exempt),
Calculation Method (Fixed/Percentage of Basic), and Default Value (if
applicable).
Acceptance • Given a payroll run is processed, when benefit configurations are applied,
Criteria
then calculations are correct without requiring manual overrides.
• Given I hold Super Admin permissions, when I add a custom benefit type,
then it becomes available and is applied in subsequent payroll runs.
• Given benefit rates change over time, when I view a historical payroll run,
then it references the benefit rates that were active at the time the run was
processed (version-controlled).
• Given benefit types are configured, when linked to the Tax & Statutory
Setup module, then they are usable for automated computation.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
Definition of ☐ Product Owner sign-off obtained
Done Acceptance criteria verification (1:1 with AC above)
☐ Verified: Basic Salary, Housing Allowance, Transport Allowance, Overtime
Pay, End-of-Service Benefit, SSNIT Contribution (Employee & Employer),
PAYE Tax, Bonus, and Overtime Allowance appear pre-loaded.
☐ Verified: It has defined Name, Category (Statutory/Voluntary), Taxability
(Taxable/Exempt), Calculation Method (Fixed/Percentage of Basic), and
Default Value (if applicable).
☐ Verified: Calculations are correct without requiring manual overrides.


# Page 10

☐ Verified: It becomes available and is applied in subsequent payroll runs.
☐ Verified: It references the benefit rates that were active at the time the run
was processed (version-controlled).
☐ Verified: They are usable for automated computation.
US-003b
As a Super Admin, I want to be alerted when a new payroll year begins and
User Story statutory rates may have changed, so that I can review and update rates (e.g.
SSNIT tiers) before the first payroll run of the new year is processed.
• Given the system date rolls over into a new payroll year, when the rollover
occurs, then an alert is displayed to Super Admin users prompting a
Acceptance statutory rate review.
Criteria
• Given the alert is acknowledged, when I open the Benefits/Tax & Statutory
Setup, then I can update rates directly from the alert workflow.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
Definition of
☐ No critical or high-severity defects open against this story
Done
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: An alert is displayed to Super Admin users prompting a statutory
rate review.
☐ Verified: I can update rates directly from the alert workflow.


# Page 11

Reference - [ https://www.playroll.com/employee-benefits/ghana ]


# Page 12

PRQ-004: Leave Policy Setup & With/Without Pay Integration
with Payroll
Category Leave & Payroll Integration
Priority High
Story Count 4
This requirement is delivered as four stories: policy configuration, standalone leave entry, HRM-
synced leave entry, and year-end balance processing.
US-004a
As a HR Administrator, I want to create and configure leave policies within
User Story Payroll Setup, without requiring a connected HRM, so that leave accrual and
pay rules are enforced consistently across the organisation.
• Given Setup & Configurations → Leave Policy Setup, when I create a new
policy, then I can define Leave Type Name (e.g. Annual, Sick, Maternity,
Paternity, Study), Pay Classification (With Pay / Without Pay / Partial Pay
with user-defined %), Earning Method (Yearly / Monthly / Proportional to
Hours Worked), Accrual Amount (HH:MM or days), Maximum Balance
(optional, HH:MM), and Year-End Balance Rule (Reset / Carry Over).
• Given Earning Method = 'At the Beginning of Each Year', when the
organisation's leave year starts, then the full accrual amount is credited to
each eligible employee on day one.
• Given Earning Method = 'At Each Paycheck', when payroll runs, then the
accrual amount is divided equally across pay periods and credited at each
run.
Acceptance
• Given Earning Method = 'Proportional to Hours Worked', when payroll runs,
Criteria
then accrual is computed as (Hours Worked in Period ÷ Standard Hours in
Period) × Accrual Rate.
• Given a configured policy, when I assign it to individual employees or
employee groups (Full-Time, Part-Time, Intern, NSS, Contract), then it
applies to all assigned employees.
• Given an employee's accrued balance reaches the Maximum Balance,
when further accrual would occur, then accrual pauses until the balance
drops below the cap.
• AC-01 (from PRD): An Annual Leave policy configured with 'At the
Beginning of Each Year', 80:00 hours accrual, 160:00 max balance, and
carry-over enabled saves correctly and credits the full 80 hours to assigned
employees at year start.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
Definition of ☐ Automated unit/integration tests written and passing for every acceptance
Done criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story


# Page 13

☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: I can define Leave Type Name (e.g. Annual, Sick, Maternity,
Paternity, Study), Pay Classification (With Pay / Without Pay / Partial Pay
with user-defined %), Earning Method (Yearly / Monthly / Proportional to
Hours Worked), Accrual Amount (HH:MM or days), Maximum Balance
(optional, HH:MM), and Year-End Balance Rule (Reset / Carry Over).
☐ Verified: The full accrual amount is credited to each eligible employee on
day one.
☐ Verified: The accrual amount is divided equally across pay periods and
credited at each run.
☐ Verified: Accrual is computed as (Hours Worked in Period ÷ Standard Hours
in Period) × Accrual Rate.
☐ Verified: It applies to all assigned employees.
☐ Verified: Accrual pauses until the balance drops below the cap.
☐ Verified: An Annual Leave policy configured with 'At the Beginning of Each
Year', 80:00 hours accrual, 160:00 max balance, and carry-over enabled
saves correctly and credits the full 80 hours to assigned employees at year
start.
US-004b
As a HR Administrator, I want to record employee leave usage directly within a
User Story payroll run when no HRM is connected (standalone mode), so that approved
leave correctly affects pay as earnings or deductions.
• Given standalone mode, when I enter leave type, number of days, and pay
classification for an employee within a payroll run, then the system applies
full pay, zero pay, or partial pay based on the configured policy.
• Given an employee has 3 days of Without Pay leave recorded, when payroll
is calculated, then the deduction = (Basic Salary ÷ Working Days in Period)
× Unpaid Leave Days, and appears as a separate 'Leave Without Pay
Deduction' line on the payslip.
Acceptance • Given Partial Pay is configured at X%, when leave is recorded, then the
Criteria deduction applies the configured percentage to the calculated amount and
is labelled 'Partial Leave Deduction' on the payslip.
• Given leave days entered exceed the employee's remaining leave balance
for that policy, when I save, then a warning is displayed (but does not block
save).
• Given the payroll run summary is viewed, when leave was recorded for the
period, then a 'Leave Adjustments' section lists affected employees, leave
type, days taken, balance remaining, and pay impact amount.
Definition of Process checklist
Done ☐ Code implemented, peer-reviewed, and merged to the release branch


# Page 14

☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: The system applies full pay, zero pay, or partial pay based on the
configured policy.
☐ Verified: The deduction = (Basic Salary ÷ Working Days in Period) × Unpaid
Leave Days, and appears as a separate 'Leave Without Pay Deduction' line
on the payslip.
☐ Verified: The deduction applies the configured percentage to the calculated
amount and is labelled 'Partial Leave Deduction' on the payslip.
☐ Verified: A warning is displayed (but does not block save).
☐ Verified: A 'Leave Adjustments' section lists affected employees, leave type,
days taken, balance remaining, and pay impact amount.
US-004c
As a HR Administrator, I want approved leave records from a connected HRM
User Story to sync automatically into the active payroll period, so that leave usage does
not require duplicate manual entry and remains accurate.
• Given an HRM is integrated, when a leave request is approved in the HRM,
then it syncs into the active payroll period within 2 minutes, pre-populating
leave type, days, and pay classification.
• Given synced leave records exist, when HR reviews the payroll run before
finalisation, then HR can review and override the synced records.
• Given synced leave exceeds the employee's remaining balance, when
displayed, then the same balance-exceeded warning shown in standalone
Acceptance
mode is presented.
Criteria
• Given any leave entry (manual or synced), when audited, then the source
(manual/HRM sync), entering or approving user, and timestamp are
captured.
• AC-03 (from PRD): An approved leave request syncs automatically into the
active payroll period within 2 minutes, pre-populates the correct leave type
and days, and the payslip reflects the correct pay classification without
manual re-entry.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
Definition of ☐ Automated unit/integration tests written and passing for every acceptance
Done criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story


# Page 15

☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: It syncs into the active payroll period within 2 minutes, pre-
populating leave type, days, and pay classification.
☐ Verified: HR can review and override the synced records.
☐ Verified: The same balance-exceeded warning shown in standalone mode
is presented.
☐ Verified: The source (manual/HRM sync), entering or approving user, and
timestamp are captured.
☐ Verified: An approved leave request syncs automatically into the active
payroll period within 2 minutes, pre-populates the correct leave type and
days, and the payslip reflects the correct pay classification without manual
re-entry.
US-004d
As a system, I want to automatically apply each leave policy's configured Year-
End Balance Rule during the payroll close cycle, so that leave balances reset or
User Story
carry over correctly without manual intervention, ready for the new leave year's
first run.
• Given a policy configured with the 'Reset' rule, when the leave year ends,
then balances reset to zero and this is reflected in the first payroll run of the
new leave year.
• Given a policy configured with the 'Carry Over' rule, when the leave year
Acceptance
ends, then the remaining balance carries forward and is reflected in the first
Criteria
run of the new leave year.
• Given year-end processing runs within the payroll close cycle, when it
completes, then the resulting balance changes are fully auditable (previous
balance, new balance, policy, timestamp).
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
Definition of
☐ Product Owner sign-off obtained
Done
Acceptance criteria verification (1:1 with AC above)
☐ Verified: Balances reset to zero and this is reflected in the first payroll run of
the new leave year.
☐ Verified: The remaining balance carries forward and is reflected in the first
run of the new leave year.
☐ Verified: The resulting balance changes are fully auditable (previous
balance, new balance, policy, timestamp).


# Page 16

PRQ-005: Attendance Integration with Automated Insertion &
Review Action
Category Integrations
Priority Medium
Story Count 6
This is the largest requirement in scope and is delivered as six stories covering global setup,
employee-level overrides, import, the review queue, payroll calculation integration, and exception
handling / audit summary. PRQ-005's payroll-blocking behaviour is a hard dependency for any sprint
that also touches payroll approval (PRQ-015).
US-005a
As a Payroll/HR Administrator, I want a global Attendance Integration
User Story configuration panel, so that I can control whether and how attendance data
feeds into payroll calculations organisation-wide.
• Given Setup & Configurations → Payroll Settings → Attendance Integration,
when I open the panel, then I can toggle 'Enable Attendance-Based Payroll'
on/off for all payroll processing.
• Given the panel, when I configure Data Source Type, then I can select
HRM Integration, API Integration (Third-Party), or File Import (CSV/XLSX).
• Given the panel, when I configure Import Frequency, then I can select
Acceptance
Manual, Daily, Weekly, or Per Payroll Run.
Criteria
• Given the panel, when I toggle Overtime Processing and Absence
Processing independently, then overtime and absence calculations derived
from attendance are enabled/disabled accordingly.
• Given the panel, when I enable the Payroll Blocking Rule, then payroll
approval is prevented while unreviewed attendance records or unresolved
exceptions exist for the period.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
Definition of
Done ☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: I can toggle 'Enable Attendance-Based Payroll' on/off for all payroll
processing.
☐ Verified: I can select HRM Integration, API Integration (Third-Party), or File
Import (CSV/XLSX).
☐ Verified: I can select Manual, Daily, Weekly, or Per Payroll Run.


# Page 17

☐ Verified: Overtime and absence calculations derived from attendance are
enabled/disabled accordingly.
☐ Verified: Payroll approval is prevented while unreviewed attendance
records or unresolved exceptions exist for the period.
US-005b
As a HR Administrator, I want to override attendance processing at the
individual employee level, so that exceptions (e.g. a contractor on a fixed
User Story
monthly retainer) are handled without changing global settings or the
employee's type.
• Given an employee profile, when I set Attendance Processing, then I can
choose 'Inherit from Employee Type Setting' (default), 'Attendance
Required (Override)', or 'Attendance Not Required (Override)'.
• Given an employee is set to 'Attendance Required (Override)', when payroll
runs, then attendance-based calculations apply to them regardless of their
employee type's default.
Acceptance
• Given an employee is set to 'Attendance Not Required (Override)', when
Criteria
payroll runs, then that employee is excluded from attendance-based payroll
processing.
• AC-04 (from PRD): Attendance calculations apply only to employees
configured as Attendance Required at either the employee type or
employee profile level; employees with Attendance Not Required are
excluded.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Definition of Acceptance criteria verification (1:1 with AC above)
Done ☐ Verified: I can choose 'Inherit from Employee Type Setting' (default),
'Attendance Required (Override)', or 'Attendance Not Required (Override)'.
☐ Verified: Attendance-based calculations apply to them regardless of their
employee type's default.
☐ Verified: That employee is excluded from attendance-based payroll
processing.
☐ Verified: Attendance calculations apply only to employees configured as
Attendance Required at either the employee type or employee profile level;
employees with Attendance Not Required are excluded.


# Page 18

US-005c
As a HR Administrator, I want to import attendance data via API integration or
User Story file upload (CSV/XLSX), so that actual time-and-attendance data is captured
and ready for review before it affects payroll.
• Given a CSV/XLSX file or API source, when attendance is imported, then
each record contains Employee ID, Attendance Date, Clock-In Time, Clock-
Out Time, Hours Worked, Overtime Hours, and Absence Flag.
• Given an import succeeds, when records are processed, then they are
automatically mapped to the active payroll period and assigned an initial
Acceptance status of 'Imported'.
Criteria • Given a record's Employee ID does not match a known employee, when
imported, then it is flagged as an 'Unmapped Exception' and excluded from
payroll until resolved by HR.
• Given up to 10,000 attendance records, when imported, then processing
completes within 30 seconds and records are available in the Review
Queue immediately upon completion.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Definition of
Acceptance criteria verification (1:1 with AC above)
Done
☐ Verified: Each record contains Employee ID, Attendance Date, Clock-In
Time, Clock-Out Time, Hours Worked, Overtime Hours, and Absence Flag.
☐ Verified: They are automatically mapped to the active payroll period and
assigned an initial status of 'Imported'.
☐ Verified: It is flagged as an 'Unmapped Exception' and excluded from
payroll until resolved by HR.
☐ Verified: Processing completes within 30 seconds and records are available
in the Review Queue immediately upon completion.
US-005d
As a HR Administrator, I want a structured Review Queue to edit, approve, or
User Story reject imported attendance records, so that only validated, corrected
attendance data feeds into payroll calculations.
• Given imported records, when viewed in the Review Queue, then they
progress through Imported → Under Review → Approved/Rejected,
Acceptance
grouped by employee, and the queue displays Attendance Date, Clock-In,
Criteria
Clock-Out, Hours Worked, Overtime Hours, Absence Flag, and current
Status.


# Page 19

• Given a record in 'Under Review', when I edit hours worked, correct
overtime hours, mark/unmark an absence, remove an incorrect entry, or
add a review note, then the previous value, new value, editing user, and
timestamp are captured.
• Given one or more records in 'Under Review', when I use 'Bulk Approve',
then only those records (not Approved/Rejected ones) transition to
'Approved'.
• Given I reject a record, when I confirm the rejection, then a rejection reason
is required before the action completes.
• Given Approved and Rejected records, when displayed in the queue, then
they are visually distinguished from records still under review.
• Given duplicate attendance entries exist (same Employee ID and
Attendance Date), when detected, then they are automatically flagged for
HR review and approval is blocked until resolved.
• Given the Attendance Review Queue, when any user attempts to review,
edit, approve, or reject a record, then only authenticated users holding the
Payroll Administrator or HR Administrator role can perform the action, and
the action is logged.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: They progress through Imported → Under Review →
Approved/Rejected, grouped by employee, and the queue displays
Definition of Attendance Date, Clock-In, Clock-Out, Hours Worked, Overtime Hours,
Done Absence Flag, and current Status.
☐ Verified: The previous value, new value, editing user, and timestamp are
captured.
☐ Verified: Only those records (not Approved/Rejected ones) transition to
'Approved'.
☐ Verified: A rejection reason is required before the action completes.
☐ Verified: They are visually distinguished from records still under review.
☐ Verified: They are automatically flagged for HR review and approval is
blocked until resolved.
☐ Verified: Only authenticated users holding the Payroll Administrator or HR
Administrator role can perform the action, and the action is logged.


# Page 20

US-005e
As a system, I want approved attendance records to automatically drive regular
User Story pay, overtime, and absence deductions within the payroll workflow, so that
payroll accurately reflects each employee's actual attendance for the period.
• Given the payroll run workflow, when a run progresses, then it enforces the
sequence: Create Payroll Run → Import Attendance → Attendance Review
Queue → Approve Attendance Records → Payroll Calculation → Payroll
Validation → Payroll Approval → Payslip Generation.
• Given approved hours worked, when payroll calculates, then they contribute
to Regular Pay.
• Given approved overtime hours, when payroll calculates, then Overtime
Pay = approved overtime hours × the configured overtime rate, and
appears as an 'Overtime Earnings' line item on the payslip.
Acceptance
Criteria • Given approved absence days, when payroll calculates, then Absence
Deduction = (Basic Salary ÷ Working Days in Period) × Absence Days, and
appears as an 'Absence Deduction' line item on the payslip.
• Given any record for the period remains in 'Imported' or 'Under Review'
status, when payroll approval is attempted, then it is blocked and a
descriptive message is shown (e.g. 'Payroll cannot proceed. 35 attendance
records remain pending review.').
• Given rejected records, when payroll is calculated, then they are fully
excluded from payroll results.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: It enforces the sequence: Create Payroll Run → Import
Attendance → Attendance Review Queue → Approve Attendance Records
Definition of → Payroll Calculation → Payroll Validation → Payroll Approval → Payslip
Done Generation.
☐ Verified: They contribute to Regular Pay.
☐ Verified: Overtime Pay = approved overtime hours × the configured
overtime rate, and appears as an 'Overtime Earnings' line item on the
payslip.
☐ Verified: Absence Deduction = (Basic Salary ÷ Working Days in Period) ×
Absence Days, and appears as an 'Absence Deduction' line item on the
payslip.
☐ Verified: It is blocked and a descriptive message is shown (e.g. 'Payroll
cannot proceed. 35 attendance records remain pending review.').
☐ Verified: They are fully excluded from payroll results.


# Page 21

Additional checks for this story
☐ Sequence dependency with PRQ-015 (Payroll Lock After Approval)
reviewed and confirmed compatible
US-005f
As a HR/Payroll Administrator, I want a payroll run Attendance Summary and a
User Story complete audit trail for all attendance events, so that I can verify attendance-
driven pay impacts at a glance and demonstrate compliance during audits.
• Given a payroll run, when I view the summary, then an 'Attendance
Summary' section shows, per employee: Hours Worked, Overtime Hours,
Absence Days, and Payroll Impact (earnings or deductions attributed to
attendance).
• Given the summary, when I select an employee, then I can drill into that
employee's attendance detail.
Acceptance
Criteria • Given a rejected record, when viewed in the run's Attendance Summary,
then its exclusion from payroll is visible.
• Given any attendance event (import, edit, review, approve, reject), when it
occurs, then the audit trail records import source, import date/time,
reviewing user, approval/rejection user, all field changes (previous and new
values), and the approval timestamp.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Definition of
Acceptance criteria verification (1:1 with AC above)
Done
☐ Verified: An 'Attendance Summary' section shows, per employee: Hours
Worked, Overtime Hours, Absence Days, and Payroll Impact (earnings or
deductions attributed to attendance).
☐ Verified: I can drill into that employee's attendance detail.
☐ Verified: Its exclusion from payroll is visible.
☐ Verified: The audit trail records import source, import date/time, reviewing
user, approval/rejection user, all field changes (previous and new values),
and the approval timestamp.


# Page 22

PRQ-006: Dynamic Payment Frequency Periods at Setup
Category Payroll Configuration
Priority Medium
Story Count 1
US-006
As a HR Administrator, I want to configure flexible pay frequency schedules at
setup and assign them per employee group, so that the organisation's diverse
User Story
pay cycles (weekly, bi-weekly, semi-monthly, monthly, custom) are accurately
supported.
• Given payroll setup, when I configure pay frequency, then I can choose
Weekly, Bi-Weekly (Fortnightly), Semi-Monthly (1st & 15th), Monthly, or
Custom.
• Given 'Custom' is selected, when I define specific pay dates and a cycle
length (e.g. every 4 weeks starting a specific date), then the system
generates correct pay period dates accordingly.
• Given different employee groups (e.g. Full-Time, Casual), when assigned
different frequencies, then each group is processed independently without
Acceptance conflict.
Criteria • Given a frequency configuration, when periods are generated, then pay
period start/end dates are auto-generated at least 12 months in advance
and displayed in a calendar view.
• Given I change a pay frequency, when I save, then a confirmation dialog
warns of downstream impacts on pending payroll runs, and already-
approved historical runs remain unaffected.
• Given an employee group's configured frequency, when periods are
generated, then the system prevents overlapping pay periods for that
group.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
Definition of ☐ No critical or high-severity defects open against this story
Done
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: I can choose Weekly, Bi-Weekly (Fortnightly), Semi-Monthly (1st &
15th), Monthly, or Custom.
☐ Verified: The system generates correct pay period dates accordingly.
☐ Verified: Each group is processed independently without conflict.


# Page 23

☐ Verified: Pay period start/end dates are auto-generated at least 12 months
in advance and displayed in a calendar view.
☐ Verified: A confirmation dialog warns of downstream impacts on pending
payroll runs, and already-approved historical runs remain unaffected.
☐ Verified: The system prevents overlapping pay periods for that group.


# Page 24

PRQ-007: Payroll Budget Setup & Processing Amount
Deviation Trend Dashboard
Category Analytics & Reporting
Priority Medium
Story Count 2
Delivered as two stories: the budget configuration module (Finance Admin-facing) and the
dashboard widget that visualises Budget vs Actual (broader role access). The dashboard story
depends on the budget data model from the setup story.
US-007a
As a Finance Admin, I want to define and manage payroll budgets at the
User Story organisation, department, or employee type level, so that I have a baseline to
compare actual payroll spend against.
• Given Setup & Configurations → Payroll Settings → Payroll Budget, when I
am Finance Admin or Super Admin, then I can create a budget record with
Budget Year, Budget Scope (Organisation-Wide / By Department / By
Employee Type), Period Breakdown (Monthly/Quarterly), Budget Amount
per period, and Notes/Description.
• Given a Budget Entry Table listing all periods, when I enter or edit an
amount per period, then a running Total Annual Budget figure updates
dynamically.
• Given a budget saved as 'Draft', when I edit it, then changes are allowed;
given it is saved as 'Approved', when I attempt to edit, then it is locked and
requires Finance Admin or Super Admin to unlock, with each change
tracked in version history.
• Given budget data prepared externally, when I import an XLSX with Period,
Department (if applicable), Employee Type (if applicable), and Budget
Acceptance
Amount columns, then the system validates and flags missing periods, non-
Criteria numeric amounts, or scope mismatches before saving.
• Given budgets and processed payroll exist for a period, when I view the
Budget vs Actual summary on the Budget Setup screen, then it shows
Budget Amount, Actual Processed Amount, Variance (Amount), and
Variance (%) per period.
• AC-05 (from PRD): An approved budget record is locked from editing; a
Finance Admin can unlock it, make a change, and the version history
reflects both the original and updated values with timestamps.
• Given a budget entry table with up to 12 monthly or 4 quarterly periods,
when I save my entries, then the save completes within 2 seconds.
• Given budget creation, editing, approval, or unlocking actions, when
attempted, then they are permitted only for users holding the Finance
Admin or Super Admin role, and all such actions are recorded in the audit
trail.
Definition of Process checklist
Done ☐ Code implemented, peer-reviewed, and merged to the release branch


# Page 25

☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: I can create a budget record with Budget Year, Budget Scope
(Organisation-Wide / By Department / By Employee Type), Period
Breakdown (Monthly/Quarterly), Budget Amount per period, and
Notes/Description.
☐ Verified: A running Total Annual Budget figure updates dynamically.
☐ Verified: Changes are allowed; given it is saved as 'Approved', when I
attempt to edit, then it is locked and requires Finance Admin or Super
Admin to unlock, with each change tracked in version history.
☐ Verified: The system validates and flags missing periods, non-numeric
amounts, or scope mismatches before saving.
☐ Verified: It shows Budget Amount, Actual Processed Amount, Variance
(Amount), and Variance (%) per period.
☐ Verified: An approved budget record is locked from editing; a Finance
Admin can unlock it, make a change, and the version history reflects both
the original and updated values with timestamps.
☐ Verified: The save completes within 2 seconds.
☐ Verified: They are permitted only for users holding the Finance Admin or
Super Admin role, and all such actions are recorded in the audit trail.
US-007b
As a Payroll Manager / Finance Admin / HR Admin, I want a 'Payroll Deviation
User Story Trend' chart on the main Payroll Dashboard, so that I can quickly spot months
where actual payroll spend deviates significantly from budget.
• Given the main Payroll Dashboard, when I have the Payroll Manager,
Finance Admin, HR Admin, or Super Admin role, then I see a 'Payroll
Deviation Trend' chart showing Budget vs Actual payroll on a monthly or
quarterly basis, with deviation amounts/percentages shown as data labels
or in a supporting summary table.
• Given a period where actual payroll exceeds the budgeted amount by more
Acceptance than the configured deviation threshold (default 5%), when the chart
Criteria renders, then that period is highlighted in red.
• Given Finance Admin or Super Admin changes the deviation threshold in
Budget Setup, when the dashboard reloads, then it reflects the new
threshold.
• Given the dashboard, when I filter by Department, Employee Type, or Date
Range (custom start/end month or quarter), then the chart and the
summary metrics row (Total Annual Budget, Total Actual YTD, Total


# Page 26

Variance Amount, Total Variance %) update accordingly, and my filter
selections persist within my session.
• Given filtered chart data, when I export to XLSX, then the file includes
Period, Department (if filtered), Employee Type (if filtered), Budget Amount,
Actual Amount, Variance Amount, and Variance (%).
• Given Finance Admin or Super Admin, when viewing the dashboard widget,
then a shortcut link is available to the Payroll Budget Setup screen.
• Given a dataset spanning up to 24 months, when the dashboard loads, then
it loads within 3 seconds.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: I see a 'Payroll Deviation Trend' chart showing Budget vs Actual
payroll on a monthly or quarterly basis, with deviation amounts/percentages
Definition of
shown as data labels or in a supporting summary table.
Done
☐ Verified: That period is highlighted in red.
☐ Verified: It reflects the new threshold.
☐ Verified: The chart and the summary metrics row (Total Annual Budget,
Total Actual YTD, Total Variance Amount, Total Variance %) update
accordingly, and my filter selections persist within my session.
☐ Verified: The file includes Period, Department (if filtered), Employee Type (if
filtered), Budget Amount, Actual Amount, Variance Amount, and Variance
(%).
☐ Verified: A shortcut link is available to the Payroll Budget Setup screen.
☐ Verified: It loads within 3 seconds.


# Page 27




# Page 28

PRQ-008: Employee Summary Dashboard by Employee Type
Category Analytics & Reporting
Priority Medium
Story Count 1
US-008
As a HR / Payroll Manager, I want the Employee Summary widget on the
User Story Payroll Dashboard to segment headcount and payroll cost by employee type,
so that I can analyse workforce composition and cost contribution by category.
• Given the Payroll Dashboard, when I view the Employee Summary widget,
then it shows a segmented breakdown by employee type (at minimum Full-
Time, Part-Time, Intern, NSS, and Contract) with headcount and
percentage contribution to payroll.
• Given the widget, when I switch view modes, then I can toggle between a
Acceptance tabular format and a donut/bar chart visualisation, both reflecting the same
Criteria
underlying data.
• Given a new employee type is added to the system, when the dashboard
refreshes, then it appears in the segmentation.
• Given I change the selected period, when the widget reloads, then the data
refreshes automatically for that period.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Definition of
Done Acceptance criteria verification (1:1 with AC above)
☐ Verified: It shows a segmented breakdown by employee type (at minimum
Full-Time, Part-Time, Intern, NSS, and Contract) with headcount and
percentage contribution to payroll.
☐ Verified: I can toggle between a tabular format and a donut/bar chart
visualisation, both reflecting the same underlying data.
☐ Verified: It appears in the segmentation.
☐ Verified: The data refreshes automatically for that period.


# Page 29




# Page 30

PRQ-009: Penalties by Amount and Percentage in Tax &
Statutory Setup
Category Compliance & Statutory
Priority Medium
Story Count 1
US-009
As a Finance Admin, I want to configure tiered penalties for late statutory
User Story payments (PAYE, SSNIT Tier 1-3), so that penalty obligations are automatically
calculated, applied, and tracked for audit purposes.
• Given the Tax & Statutory Setup screen, when I hold the Super Admin or
Finance Admin role, then I can configure a Penalties section per statutory
type (PAYE, SSNIT Tier 1, Tier 2, Tier 3) with Penalty Type (Fixed Amount /
Percentage), Penalty Value, Grace Period (days), and Effective Date.
• Given multiple penalty tiers (e.g. 5% for 1-30 days late, 10% after 30 days),
when configured, then each tier applies based on how many days the
payment is late.
• Given a statutory payment is recorded as late relative to its due date, when
payroll processes that obligation, then the configured penalty auto-applies
Acceptance
Criteria instantly and is calculated correctly.
• Given a penalty is applied, when viewed, then it appears as a separate line
item in the payroll statutory obligations report.
• Given HR/Finance wants to waive a penalty for a specific period, when they
submit a waiver with a documented reason, then it routes through an
approval workflow and the waiver is recorded in the audit log with the
approver and reason.
• Given penalty configuration changes occur over time, when I search by
effective date, then historical configurations are retrievable.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
Definition of ☐ No critical or high-severity defects open against this story
Done
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: I can configure a Penalties section per statutory type (PAYE,
SSNIT Tier 1, Tier 2, Tier 3) with Penalty Type (Fixed Amount /
Percentage), Penalty Value, Grace Period (days), and Effective Date.
☐ Verified: Each tier applies based on how many days the payment is late.


# Page 31

☐ Verified: The configured penalty auto-applies instantly and is calculated
correctly.
☐ Verified: It appears as a separate line item in the payroll statutory
obligations report.
☐ Verified: It routes through an approval workflow and the waiver is recorded
in the audit log with the approver and reason.
☐ Verified: Historical configurations are retrievable.


# Page 32

PRQ-010: Loan & Salary Advance Initiation from Staff PIM
into Payroll
Category Employee Self-Service & Payroll
Priority Medium
Story Count 2
Delivered as two stories: the request/approval/deduction flow, and the HR management & reporting
view.
US-010a
As a Employee / HR user, I want to submit a loan or salary advance request
from the PIM module that, once approved, automatically becomes a payroll
User Story
deduction, so that loan/advance recovery happens automatically without
manual payroll entry each cycle.
• Given the employee's PIM profile (also accessible to HR via the HR portal),
when I open 'Loans & Advances', then I can submit a request with Type
(Loan / Salary Advance), Amount Requested, Repayment Period (months),
an auto-calculated Monthly Deduction Amount, and Reason/Notes.
• Given a request is submitted, when it is routed, then it follows an approval
workflow to the Line Manager and HR Manager.
Acceptance
• Given a request is approved, when the next eligible payroll run occurs, then
Criteria
a recurring payroll deduction schedule is automatically created and appears
on the payslip as 'Loan Repayment' or 'Salary Advance Recovery'.
• Given an active deduction, when each payroll cycle runs, then the
outstanding balance updates automatically and deductions stop once the
balance reaches zero, correctly handling a partial final instalment when the
remaining balance is less than the monthly instalment.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Definition of
Acceptance criteria verification (1:1 with AC above)
Done
☐ Verified: I can submit a request with Type (Loan / Salary Advance), Amount
Requested, Repayment Period (months), an auto-calculated Monthly
Deduction Amount, and Reason/Notes.
☐ Verified: It follows an approval workflow to the Line Manager and HR
Manager.
☐ Verified: A recurring payroll deduction schedule is automatically created
and appears on the payslip as 'Loan Repayment' or 'Salary Advance
Recovery'.


# Page 33

☐ Verified: The outstanding balance updates automatically and deductions
stop once the balance reaches zero, correctly handling a partial final
instalment when the remaining balance is less than the monthly instalment.
US-010b
As a HR Administrator, I want to view, pause, modify, and close loan/advance
User Story records, and view an organisation-wide summary report, so that I can manage
employee loan obligations and provide visibility to Finance.
• Given the PIM module, when HR opens a loan/advance record, then HR
can view, pause, modify, or close it.
Acceptance
• Given active, completed, and pending loan/advance requests across the
Criteria
organisation, when I open the Loans & Advances summary report, then it
shows the correct status and outstanding balance for every record.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
Definition of
☐ No critical or high-severity defects open against this story
Done
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: HR can view, pause, modify, or close it.
☐ Verified: It shows the correct status and outstanding balance for every
record.


# Page 34

PRQ-011: Payslip Download Functionality
Category Employee Self-Service
Priority High
Story Count 1
US-011
As a Employee / HR user, I want to download individual or bulk payslips in PDF
User Story format for any processed and published payroll period, so that employees and
HR have official, branded records of pay for personal or administrative use.
• Given a processed and HR-published payroll period, when I (employee)
select 'Download Payslip' from my payroll history, or HR selects it from the
run summary, then a PDF is generated containing the organisation's logo,
name, and contact details; Employee Name, ID, Position, Department,
Period; all Earnings and Deductions line items; Gross Pay; Total
Deductions; Net Pay; and Employer SSNIT contributions.
• Given a payslip is downloaded, when generated, then it is digitally stamped
with the generation date and a unique reference number.
Acceptance • Given HR wants payslips for an entire run, when they select bulk download,
Criteria then a ZIP archive of correctly named PDFs for all employees in the run is
produced, completing within 60 seconds for up to 500 employees.
• Given an employee attempts to access another employee's payslip, when
the request is made, then access is denied.
• Given a payroll run has not yet been marked as paid / published by HR
Admin, when an employee attempts to download a payslip for that period,
then it is not accessible.
• Given a single payslip request, when generated, then it completes within 3
seconds.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
Definition of
☐ Product Owner sign-off obtained
Done
Acceptance criteria verification (1:1 with AC above)
☐ Verified: A PDF is generated containing the organisation's logo, name, and
contact details; Employee Name, ID, Position, Department, Period; all
Earnings and Deductions line items; Gross Pay; Total Deductions; Net Pay;
and Employer SSNIT contributions.
☐ Verified: It is digitally stamped with the generation date and a unique
reference number.


# Page 35

☐ Verified: A ZIP archive of correctly named PDFs for all employees in the run
is produced, completing within 60 seconds for up to 500 employees.
☐ Verified: Access is denied.
☐ Verified: It is not accessible.
☐ Verified: It completes within 3 seconds.


# Page 36

PRQ-012: Dynamic Bonus Entry (Varying Amounts per
Employee)
Category Payroll Processing
Priority High
Story Count 4
Delivered as four stories: bonus type selection & entry table, bulk actions & import/export, validation
& live summary, and downstream payroll/payslip/audit integration. Note: the source PRD contained
two conflicting Acceptance Criteria blocks for this PRQ (a Gherkin-style set and a numbered AC-
01/02/03 set with different wording); both have been reconciled into the AC below without duplication
or contradiction.
US-012a
As a HR Administrator, I want to choose between Fixed Amount, Percentage of
Basic Salary, or Dynamic Amounts when creating a bonus payroll run, with a
User Story per-employee entry table for the Dynamic mode, so that I can match the bonus
allocation method to the business scenario (discretionary, performance-based,
retention, etc.).
• Given a new bonus payroll run, when I select the bonus type, then I can
choose Fixed Amount (single amount applied to all selected employees),
Percentage of Basic Salary (single percentage applied to each selected
employee's own basic salary), or Dynamic Amounts (individual amounts per
employee).
• Given Dynamic Amounts is selected, when the Bonus Entry Table loads,
then it displays Employee Name, Employee ID, Department, Position, Basic
Salary, Bonus Amount (editable), Estimated Tax, and Estimated Net Bonus
Acceptance for all eligible employees.
Criteria
• Given the table, when I select all employees, select individually, or filter by
Department, Position, or Employment Status, then the table updates to
reflect the selection/filter.
• Given I edit a Bonus Amount cell, when I make a change, then the table
updates automatically without a page refresh.
• Given up to 1,000 employees, when the Bonus Entry Table loads, then it
loads within 3 seconds; for bonus runs of up to 10,000 employees, the table
remains usable via pagination and server-side processing.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
Definition of
Done ☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)


# Page 37

☐ Verified: I can choose Fixed Amount (single amount applied to all selected
employees), Percentage of Basic Salary (single percentage applied to each
selected employee's own basic salary), or Dynamic Amounts (individual
amounts per employee).
☐ Verified: It displays Employee Name, Employee ID, Department, Position,
Basic Salary, Bonus Amount (editable), Estimated Tax, and Estimated Net
Bonus for all eligible employees.
☐ Verified: The table updates to reflect the selection/filter.
☐ Verified: The table updates automatically without a page refresh.
☐ Verified: It loads within 3 seconds; for bonus runs of up to 10,000
employees, the table remains usable via pagination and server-side
processing.
US-012b
As a HR Administrator, I want bulk fill, increase/decrease, clear, and XLSX
User Story import/export actions for bonus amounts, so that I can efficiently populate and
adjust large bonus runs without entering every value manually.
• Given selected employees, when I use 'Fill All with Fixed Amount' (e.g.
GHS 500), then all selected employees' Bonus Amount is set to that value.
• Given selected employees, when I use 'Fill by Percentage of Basic Salary'
(e.g. 10%), then each employee's Bonus Amount is set to 10% of their own
basic salary (so Employee A and Employee B receive different amounts
based on their respective salaries).
• Given entered bonus amounts, when I use 'Clear All', then all bonus values
in the table are removed.
Acceptance
• Given entered bonus amounts, when I apply 'Increase / Decrease Existing
Criteria
Amounts' by a percentage (e.g. +15%), then each currently entered amount
is adjusted accordingly.
• Given the Bonus Entry Table, when I export to XLSX, then the file contains
Employee ID, Employee Name, Department, and Bonus Amount.
• Given a valid XLSX bonus file, when I import it, then employees are
matched by Employee ID, existing bonus amounts are updated, and
validation errors are reported before the import completes — for up to 1,000
employees, within 10 seconds.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
Definition of
☐ Deployed to QA/staging and demonstrated to the Product Owner
Done
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: All selected employees' Bonus Amount is set to that value.


# Page 38

☐ Verified: Each employee's Bonus Amount is set to 10% of their own basic
salary (so Employee A and Employee B receive different amounts based on
their respective salaries).
☐ Verified: All bonus values in the table are removed.
☐ Verified: Each currently entered amount is adjusted accordingly.
☐ Verified: The file contains Employee ID, Employee Name, Department, and
Bonus Amount.
☐ Verified: Employees are matched by Employee ID, existing bonus amounts
are updated, and validation errors are reported before the import completes
— for up to 1,000 employees, within 10 seconds.
US-012c
As a HR Administrator, I want all bonus entries to be validated and a live
User Story summary panel of totals to be available, so that I can catch entry errors before
processing and see run totals update in real time.
• Given a bonus amount that is negative, non-numeric, exceeds the
configured maximum bonus cap, or belongs to an inactive/ineligible
employee, when I attempt to save the run, then the save is blocked with a
validation error identifying the problem record(s).
• Given a bonus exceeds the configured cap, exceeds a defined percentage
of the employee's annual basic salary, or duplicate employee records are
Acceptance
detected during import, when this occurs, then a warning is displayed but
Criteria
does not prevent saving, unless an administrator has configured warnings
to be blocking.
• Given bonus entries exist in the table, when I view the live summary panel,
then it shows Total Employees Selected, Employees with Bonus Assigned,
Total Gross Bonus Amount, Estimated PAYE Tax, and Estimated Net
Bonus Payable, all updating immediately as values change.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
Definition of ☐ Product Owner sign-off obtained
Done Acceptance criteria verification (1:1 with AC above)
☐ Verified: The save is blocked with a validation error identifying the problem
record(s).
☐ Verified: A warning is displayed but does not prevent saving, unless an
administrator has configured warnings to be blocking.
☐ Verified: It shows Total Employees Selected, Employees with Bonus
Assigned, Total Gross Bonus Amount, Estimated PAYE Tax, and Estimated
Net Bonus Payable, all updating immediately as values change.


# Page 39

US-012d
As a system, I want approved bonus amounts to flow correctly into payroll
User Story processing, payslips, and the audit trail, so that bonuses are taxed correctly per
GRA rules and every change to a bonus run is traceable.
• Given an approved Dynamic Bonus payroll run, when payroll is processed,
then each employee's assigned bonus amount is treated as bonus
earnings, PAYE is calculated according to applicable Ghana Revenue
Authority bonus taxation rules, and bonus earnings are included in payroll
journals, reports, and statutory calculations where applicable.
Acceptance • Given a processed payslip, when viewed, then it displays a 'Bonus
Criteria Earnings' line item whose value matches the employee-specific amount
assigned within the bonus payroll run.
• Given any bonus run action (creation, modification of bonus amounts, file
import, approval, processing), when it occurs, then the audit log records the
bonus run creator, date/time of creation, the user who modified amounts,
imported file details, and all approval/processing actions.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Definition of Acceptance criteria verification (1:1 with AC above)
Done
☐ Verified: Each employee's assigned bonus amount is treated as bonus
earnings, PAYE is calculated according to applicable Ghana Revenue
Authority bonus taxation rules, and bonus earnings are included in payroll
journals, reports, and statutory calculations where applicable.
☐ Verified: It displays a 'Bonus Earnings' line item whose value matches the
employee-specific amount assigned within the bonus payroll run.
☐ Verified: The audit log records the bonus run creator, date/time of creation,
the user who modified amounts, imported file details, and all
approval/processing actions.


# Page 40

PRQ-013: Combined Regular + Bonus Payroll Run
Category Payroll Processing
Priority High
Story Count 1
Dependent on PRQ-012 (Dynamic Bonus Entry) being delivered first — the Combined run type
reuses the Bonus Entry Table directly.
US-013
As a HR Administrator, I want to process regular salary and bonuses together
User Story in a single combined payroll run, so that administrative steps are reduced and
employees receive one unified payslip covering both regular pay and bonus.
• Given a new payroll run, when I select the run type, then I can choose
'Regular', 'Bonus Only', or 'Regular + Bonus Combined'.
• Given a Combined run, when processing occurs, then all regular earnings
and deductions are calculated first, then bonus amounts are added per the
Dynamic Bonus Entry feature (PRQ-012).
• Given a Combined run's payslip, when generated, then Regular Pay
components and Bonus components are clearly separated into distinct
sections.
• Given a Combined run, when PAYE is calculated, then regular income and
Acceptance
bonus income for the period are aggregated to apply the correct marginal
Criteria
tax rate.
• Given the payroll run summary, when viewed for a Combined run, then it
shows sub-totals for Regular Pay and Bonus Pay separately, plus a
combined total.
• Given an approved Regular run already exists for a period, when a
Combined run is attempted for the same period (or vice versa), then the
system prevents it and presents a clear error message.
• Given 500 employees, when a Combined run is processed, then it
completes within 60 seconds.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
Definition of ☐ No critical or high-severity defects open against this story
Done
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: I can choose 'Regular', 'Bonus Only', or 'Regular + Bonus
Combined'.
☐ Verified: All regular earnings and deductions are calculated first, then bonus
amounts are added per the Dynamic Bonus Entry feature (PRQ-012).


# Page 41

☐ Verified: Regular Pay components and Bonus components are clearly
separated into distinct sections.
☐ Verified: Regular income and bonus income for the period are aggregated
to apply the correct marginal tax rate.
☐ Verified: It shows sub-totals for Regular Pay and Bonus Pay separately,
plus a combined total.
☐ Verified: The system prevents it and presents a clear error message.
☐ Verified: It completes within 60 seconds.


# Page 42

PRQ-014: Bank Payment File Export, GRA PAYE Schedule &
SSNIT Export
Category Compliance & Reporting
Priority High
Story Count 3
Delivered as three stories — one per export type — since each has a distinct format owner (banks,
GRA, SSNIT) and can be developed/tested independently.
US-014a
As a HR / Finance user, I want to export a bank payment file in the format
User Story required by major Ghanaian banks, so that net pay can be disbursed via the
bank's bulk payment upload process.
• Given an approved payroll run, when I open 'Export Files' and select Bank
Payment File, then I can choose from configurable templates for major
Ghanaian banks (GCB, Ecobank, Absa, Stanbic, etc.).
• Given a selected bank template, when the file is exported, then it contains
employee net pay details in the correct format for that bank, downloadable
as CSV or XLSX.
Acceptance • Given the export, when I view the confirmation screen before download,
Criteria then it displays the Total Bank Payment amount for reconciliation.
• Given bank file templates, when an administrator needs to update one, then
they can do so without requiring a code release.
• Given up to 1,000 employees, when the bank file is generated, then it
completes within 10 seconds.
• Given any export action, when completed, then it is logged with the user,
date/time, and payroll run reference.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
Definition of ☐ Product Owner sign-off obtained
Done
Acceptance criteria verification (1:1 with AC above)
☐ Verified: I can choose from configurable templates for major Ghanaian
banks (GCB, Ecobank, Absa, Stanbic, etc.).
☐ Verified: It contains employee net pay details in the correct format for that
bank, downloadable as CSV or XLSX.
☐ Verified: It displays the Total Bank Payment amount for reconciliation.
☐ Verified: They can do so without requiring a code release.


# Page 43

☐ Verified: It completes within 10 seconds.
☐ Verified: It is logged with the user, date/time, and payroll run reference.
US-014b
As a HR / Finance user, I want to export a GRA PAYE schedule from an
User Story approved payroll run, so that statutory tax filings to the Ghana Revenue
Authority are accurate and submission-ready.
• Given an approved payroll run, when I select GRA PAYE Schedule, then
the export is generated in the GRA's P9 or equivalent format, including
Employee Name, TIN, Gross Income, Statutory Deductions, Taxable
Income, PAYE Computed, and PAYE Withheld, downloadable as CSV or
XLSX.
• Given the confirmation screen, when displayed before download, then it
Acceptance shows the Total PAYE for reconciliation.
Criteria
• Given the exported file, when opened in Excel, then it passes a manual
cross-check against payroll totals.
• Given up to 1,000 employees, when the GRA PAYE schedule is generated,
then it completes within 10 seconds.
• Given any export action, when completed, then it is logged with the user,
date/time, and payroll run reference.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Definition of Acceptance criteria verification (1:1 with AC above)
Done
☐ Verified: The export is generated in the GRA's P9 or equivalent format,
including Employee Name, TIN, Gross Income, Statutory Deductions,
Taxable Income, PAYE Computed, and PAYE Withheld, downloadable as
CSV or XLSX.
☐ Verified: It shows the Total PAYE for reconciliation.
☐ Verified: It passes a manual cross-check against payroll totals.
☐ Verified: It completes within 10 seconds.
☐ Verified: It is logged with the user, date/time, and payroll run reference.


# Page 44

US-014c
As a HR / Finance user, I want to export an SSNIT contribution file from an
User Story approved payroll run, so that Tier 1 and Tier 2 contributions can be uploaded
directly to the SSNIT portal without reformatting.
• Given an approved payroll run, when I select SSNIT Contribution File, then
SSNIT Tier 1 and Tier 2 contribution data per employee is exported in the
format compatible with the SSNIT portal upload, downloadable as CSV or
XLSX.
• Given the confirmation screen, when displayed before download, then it
shows the Total SSNIT for reconciliation.
Acceptance
Criteria • Given the exported file, when uploaded to the SSNIT web portal, then it is
accepted without format errors.
• Given up to 1,000 employees, when the SSNIT contribution file is
generated, then it completes within 10 seconds.
• Given any export action, when completed, then it is logged with the user,
date/time, and payroll run reference.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
☐ Product Owner sign-off obtained
Definition of
Acceptance criteria verification (1:1 with AC above)
Done
☐ Verified: SSNIT Tier 1 and Tier 2 contribution data per employee is
exported in the format compatible with the SSNIT portal upload,
downloadable as CSV or XLSX.
☐ Verified: It shows the Total SSNIT for reconciliation.
☐ Verified: It is accepted without format errors.
☐ Verified: It completes within 10 seconds.
☐ Verified: It is logged with the user, date/time, and payroll run reference.


# Page 45

PRQ-015: Payroll Lock After Approval
Category Payroll Controls & Governance
Priority High
Story Count 1
Dependency note: this story's blocking behaviour must be reconciled with PRQ-005's payroll-
approval gating logic (both control whether a run can move to 'Approved').
US-015
As a Super Admin / Payroll Manager, I want approved payroll runs to be locked
User Story from further editing, so that the integrity of approved payroll data is preserved
and audit/compliance requirements are met.
• Given a payroll run reaches 'Approved' status, when any user attempts to
edit employee earnings/deductions, pay period dates, or bonus entries for
that run, then all edit functions are disabled and a 'Run is locked' message
is displayed.
• Given an approved run, when viewed, then a visual 'Locked' indicator
(padlock icon and status badge) is prominently displayed on the payroll run
summary.
• Given a Super Admin needs to correct an approved run, when they request
Acceptance
an unlock, then a mandatory reason and dual approval from a second
Criteria
Super Admin are required before edits become available.
• Given corrections are needed post-lock, when the user views their options,
then the system recommends creating an 'Adjustment Run' for the same
period rather than unlocking, to preserve the audit trail.
• Given any lock, unlock, or re-lock event, when it occurs, then it is recorded
in the audit trail with actor, timestamp, and reason.
• Given a run's status changes to 'Approved', when the change is committed,
then the lock takes effect immediately with no race-condition window.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
☐ No critical or high-severity defects open against this story
Definition of
☐ Product Owner sign-off obtained
Done
Acceptance criteria verification (1:1 with AC above)
☐ Verified: All edit functions are disabled and a 'Run is locked' message is
displayed.
☐ Verified: A visual 'Locked' indicator (padlock icon and status badge) is
prominently displayed on the payroll run summary.
☐ Verified: A mandatory reason and dual approval from a second Super
Admin are required before edits become available.


# Page 46

☐ Verified: The system recommends creating an 'Adjustment Run' for the
same period rather than unlocking, to preserve the audit trail.
☐ Verified: It is recorded in the audit trail with actor, timestamp, and reason.
☐ Verified: The lock takes effect immediately with no race-condition window.


# Page 47

PRQ-016: Bulk Salary Update Tool
Category HR & Payroll Administration
Priority Medium
Story Count 1
US-016
As a HR Administrator, I want to update salaries for multiple employees
simultaneously — via uniform percentage increase, uniform fixed amount, or
User Story
individual XLSX override, so that salary review cycles are processed efficiently
without individual profile edits.
• Given the Payroll Administration or HR Settings menu, when I open 'Bulk
Salary Update', then I can filter the employee list by Department, Employee
Type, Grade, and Location.
• Given a filtered employee list, when I choose an update method (Uniform
Percentage Increase, Uniform Fixed Amount Increase, or Individual Amount
Override via XLSX import), then the system applies that method to the
selected employees.
• Given an update is configured, when I view the preview table, then it shows
Employee Name, Current Salary, Proposed Salary, and Difference (Amount
Acceptance & %) for all affected employees, and I must explicitly confirm before
Criteria
changes are committed.
• Given an update is confirmed, when I set an Effective Date (immediate or
future), then payroll runs from that date onward use the new salary while
historical payroll runs remain unaffected.
• Given a bulk update completes, when I view the change log, then a full
before-and-after record is created and exportable as XLSX.
• Given up to 1,000 employee records, when a bulk update is applied, then it
processes within 15 seconds, and access to the tool is restricted to HR
Admin and Super Admin roles.
Process checklist
☐ Code implemented, peer-reviewed, and merged to the release branch
☐ Automated unit/integration tests written and passing for every acceptance
criterion below
☐ Deployed to QA/staging and demonstrated to the Product Owner
Definition of
☐ No critical or high-severity defects open against this story
Done
☐ Product Owner sign-off obtained
Acceptance criteria verification (1:1 with AC above)
☐ Verified: I can filter the employee list by Department, Employee Type,
Grade, and Location.
☐ Verified: The system applies that method to the selected employees.


# Page 48

☐ Verified: It shows Employee Name, Current Salary, Proposed Salary, and
Difference (Amount & %) for all affected employees, and I must explicitly
confirm before changes are committed.
☐ Verified: Payroll runs from that date onward use the new salary while
historical payroll runs remain unaffected.
☐ Verified: A full before-and-after record is created and exportable as XLSX.
☐ Verified: It processes within 15 seconds, and access to the tool is restricted
to HR Admin and Super Admin roles.
