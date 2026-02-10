

# Enhanced Clinical Risk Logic & Inputs

## Overview
Update the risk prediction system with 7 new/refined clinical inputs and improved risk calculation logic. No UI layout redesign -- only extend existing form steps and risk engine.

## Changes by File

### 1. `src/types/patient.ts` -- Add New Fields

- **SurgeryDetails**: Replace `intraoperativeIssues: boolean` with `intraoperativeComplicationType: 'none' | 'posterior-capsule-rupture' | 'zonular-weakness' | 'vitreous-loss'`
- **ClinicalMeasurements**: Add `inflammationGrade: '0' | '1+' | '2+' | '3+'` and `cornealEdemaSeverity: 'none' | 'mild' | 'moderate' | 'severe'`
- **PatientAssessment**: Add new top-level fields:
  - `complianceScore: 'good' | 'moderate' | 'poor'`
  - `timeSinceSurgery: { value: number; unit: 'hours' | 'days' }`
  - `followUpTrend: 'improving' | 'stable' | 'worsening'`
  - `doctorRiskOverride: 'increase' | 'decrease' | 'accept'`
- **RiskAssessment**: Add `followUpPriority: 'routine' | 'early' | 'urgent'` and `doctorOverrideApplied: boolean` and `explanationNotes: string[]`

### 2. `src/pages/PatientAssessment.tsx` -- Add UI for New Inputs

Add new inputs into existing steps (no new steps):

- **Step 4 (Surgery Details)**: Replace the intraoperative issues checkbox with a Select dropdown for complication type (None / Posterior capsule rupture / Zonular weakness / Vitreous loss)
- **Step 6 (Clinical Measurements)**: Add Inflammation Grade (0/1+/2+/3+) select, Corneal Edema Severity (None/Mild/Moderate/Severe) select, and Time Since Surgery input (number + hours/days toggle)
- **Step 7 (Media/Visual Analysis)**: Add before the image upload area:
  - Compliance Score radio group (Good / Moderate / Poor) with a clinical note callout for "Poor"
  - Follow-Up Trend radio group (Improving / Stable / Worsening)

Update the initial `formData` state with defaults for all new fields.

### 3. `src/pages/AssessmentResults.tsx` -- Add Doctor Override

- Add a **Doctor Risk Override** card in the results page (after the risk score overview, before media analysis)
- Three radio buttons: "Accept AI Score" / "Increase Risk" / "Decrease Risk"
- When override is applied, recalculate the displayed risk score and category, show an explicit banner: "Doctor override applied: risk [increased/decreased]"
- Update the explanation text to mention the override when active
- Add Follow-Up Priority badge next to the risk badge (Routine / Early / Urgent)

### 4. `src/lib/mockAI.ts` -- Enhanced Risk Engine

**`calculateRiskScore` function updates:**

- **Typed intraoperative complications** (replace boolean logic):
  - `posterior-capsule-rupture`: +22 points
  - `vitreous-loss`: +25 points
  - `zonular-weakness`: +15 points
  - `none`: +0

- **Inflammation grading scoring**:
  - `0`: +0
  - `1+`: +5
  - `2+`: +12
  - `3+`: +22

- **Corneal edema severity scoring**:
  - `none`: +0
  - `mild`: +4
  - `moderate`: +12
  - `severe`: +20

- **Temporal adjustment** (time since surgery):
  - If less than 24 hours: reduce inflammation/symptom contributions by 30% (early findings are expected)
  - If 1-3 days: standard weighting
  - If more than 7 days: increase weight of persistent symptoms by 20%

- **Compliance multiplier** (applied to final score):
  - `good`: x1.0
  - `moderate`: x1.15
  - `poor`: x1.35
  - Add risk factor note: "Low compliance can worsen outcomes even in otherwise low-risk patients."

- **Follow-up trend escalation**:
  - `improving`: -5 points
  - `stable`: +0
  - `worsening`: +12 points, add risk factor

- **Doctor override** (applied last, post-calculation):
  - `increase`: multiply final score by 1.25, cap at 100
  - `decrease`: multiply final score by 0.75, floor at 5
  - `accept`: no change

- **Follow-up priority** derivation:
  - Score less than 30: "routine"
  - Score 30-59: "early"
  - Score 60 or above: "urgent"

**`generateExplanation` function updates:**

- Limit to top 3 strongest contributing factors (instead of all 5)
- Add explicit mention of doctor override when applied: "Doctor override applied: risk [increased/decreased]."
- Add compliance note when poor: "Low compliance can worsen outcomes even in otherwise low-risk patients."
- Add temporal context: "Findings interpreted in context of [X hours/days] post-surgery."

**`generateCareRecommendations` function updates:**

- Add compliance-specific recommendation when poor compliance detected
- Add edema-specific recommendation when moderate/severe corneal edema
- Add inflammation-specific recommendation when grade 2+ or 3+

## Technical Notes

- All new fields have safe defaults so existing assessments without the new fields still work
- The `calculateRiskScore` function signature stays the same (`Partial<PatientAssessment>`)
- Doctor override is applied in the results page after initial calculation, keeping the core engine pure
- No new routes, no new pages, no UI layout changes

