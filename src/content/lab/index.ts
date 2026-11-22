import type { LabProject } from '../../core/lab.ts';
import { docExtractLab } from './docextract.ts';
import { docExtractRealLab } from './docextractReal.ts';

export const labProjects: LabProject[] = [docExtractLab, docExtractRealLab];
