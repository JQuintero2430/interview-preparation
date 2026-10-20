// Exercise 39.4, variant a: one schematic per step, the tree passed along, in section 10's order for the signal APIs.
// Only the two schematics that read the in-memory tree run here; control-flow and inject read their tsconfig from disk.
import { runSchematic } from '../../support/run-schematic';
import { coreCollection, type Modernize } from '../workspace';

export const modernize: Modernize = async (files, options = {}) => {
  const withInputs = await runSchematic(coreCollection, 'signal-input-migration', files, options);
  return runSchematic(coreCollection, 'output-migration', withInputs);
};
