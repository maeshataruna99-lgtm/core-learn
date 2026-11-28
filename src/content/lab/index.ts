import type { LabProject } from '../../core/lab.ts';
import { docExtractLab } from './docextract.ts';
import { docExtractRealLab } from './docextractReal.ts';
import { mgsLab } from './mgs.ts';
import { simrsLab } from './simrs.ts';

export const labProjects: LabProject[] = [docExtractLab, docExtractRealLab, simrsLab, mgsLab];
