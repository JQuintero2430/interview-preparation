// Exercise 39.4, variant b: the combined `signals` schematic, which chains the input, output and query schematics
// (sorted by name) with the same options.
import { runSchematic } from '../../support/run-schematic';
import { coreCollection, type Modernize } from '../workspace';

export const modernize: Modernize = (files, options = {}) => runSchematic(coreCollection, 'signals', files, options);
