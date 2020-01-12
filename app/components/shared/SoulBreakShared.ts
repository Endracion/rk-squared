/**
 * @file
 * Types and helpers shared across all soul break components.  (Not to be
 * confused with support for shared soul breaks.)
 */

import * as TrieSearch from 'trie-search';

import {
  enlir,
  EnlirLimitBreakTier,
  EnlirSoulBreakOrLegendMateria,
  EnlirSoulBreakTier,
  makeLegendMateriaAliases,
  makeLimitBreakAliases,
  makeSoulBreakAliases,
} from '../../data/enlir';
import { formatBraveCommands } from '../../data/mrP/brave';
import { formatMrPSkill, MrPSkill } from '../../data/mrP/skill';
import { getSchoolShortName, getShortName } from '../../data/mrP/typeHelpers';

export const styles = require('./SoulBreakShared.scss');

export function makeTierStyleMap(
  cssStyles: any,
): { [tier in EnlirSoulBreakTier | EnlirLimitBreakTier]: string | undefined } {
  return {
    SB: cssStyles.unique,
    SSB: cssStyles.super,
    BSB: cssStyles.burst,
    OSB: cssStyles.overstrike,
    AOSB: cssStyles.overstrike,
    USB: cssStyles.ultra,
    CSB: cssStyles.chain,
    AASB: cssStyles.awakening,
    SASB: cssStyles.synchro,
    Glint: cssStyles.glint,
    'Glint+': cssStyles.glint,

    OLB: cssStyles.overstrikeLimitBreak,

    // Unused - placeholders
    Default: cssStyles.unique,
    RW: cssStyles.unique,
    Shared: cssStyles.unique,
  };
}

export const tierClass = makeTierStyleMap(styles);

export const soulBreakAbbrevAliases = makeSoulBreakAliases(enlir.soulBreaks, {
  Default: '-',
  SB: '-',
  SSB: 'S',
  BSB: 'B',
  OSB: 'O',
  AOSB: 'AO',
  Glint: 'G',
  'Glint+': 'G+',
  USB: 'U',
  CSB: 'C',
  AASB: 'AA',
  SASB: 'SA',
  RW: '-',
  Shared: '-',
});
export const soulBreakFullAliases = makeSoulBreakAliases(enlir.soulBreaks);
export const limitBreakAbbrevAliases = makeLimitBreakAliases(enlir.limitBreaks, {
  OLB: 'OL',
});
export const limitBreakFullAliases = makeLimitBreakAliases(enlir.limitBreaks);
export const legendMateriaAliases = makeLegendMateriaAliases(enlir.legendMateria);

export function formatSoulBreakOrLegendMateriaName(item: EnlirSoulBreakOrLegendMateria): string {
  return item.gl ? item.name : '“' + item.name + '”';
}

function getSchoolName(command: MrPSkill): string {
  if (command.schoolDetails) {
    return command.schoolDetails.map(getSchoolShortName).join('/');
  } else if (command.school) {
    return getSchoolShortName(command.school);
  } else {
    return '?';
  }
}

export function getBraveColumns(mrP: MrPSkill, braveCommands: MrPSkill[]): [string, string] {
  return [
    '[' +
      getSchoolName(braveCommands[0]) +
      '], +1 on ' +
      mrP.braveCondition!.map(getShortName).join('/'),
    formatBraveCommands(braveCommands),
  ];
}

export function getBurstColumns(burstCommands: MrPSkill[]): Array<[string, string]> {
  return burstCommands.map(
    cmd => ['[' + getSchoolName(cmd) + ']', '[' + formatMrPSkill(cmd) + ']'] as [string, string],
  );
}

export function getSynchroColumns(
  mrP: MrPSkill,
  synchroCommands: MrPSkill[],
): Array<[string, string]> {
  return synchroCommands.map(
    (cmd, i) =>
      [
        '[' +
          getSchoolName(cmd) +
          ']' +
          (mrP.synchroCondition && mrP.synchroCondition[i]
            ? ', w/ ' + getShortName(mrP.synchroCondition[i])
            : ''),
        formatMrPSkill(cmd),
      ] as [string, string],
  );
}

interface SoulBreakSearchItem {
  id: number;
  character: string;
  characterText: string;
  name: string;
  nameJp: string;
  fullTier: string;
  abbrevTier: string;
}
interface LegendMateriaSearchItem {
  id: number;
  character: string;
  characterText: string;
  name: string;
  nameJp: string;
  tier: string;
}

let cachedSoulBreakSearch: TrieSearch<SoulBreakSearchItem> | undefined;
let cachedLimitBreakSearch: TrieSearch<SoulBreakSearchItem> | undefined;
let cachedLegendMateriaSearch: TrieSearch<LegendMateriaSearchItem> | undefined;
function getSearches() {
  if (!cachedSoulBreakSearch) {
    cachedSoulBreakSearch = new TrieSearch(
      ['character', 'characterText', 'name', 'fullTier', 'abbrevTier'],
      {
        indexField: 'id',
        idFieldOrFunction: 'id',
      },
    );
    cachedSoulBreakSearch.addAll(
      Object.values(enlir.soulBreaks)
        .filter(i => i.character != null)
        .map(i => ({
          id: i.id,
          character: i.character!,
          characterText: i.character!.replace(/[^a-zA-Z]/g, ''),
          name: i.name,
          nameJp: i.nameJp,
          fullTier: soulBreakFullAliases[i.id],
          abbrevTier: soulBreakAbbrevAliases[i.id],
        })),
    );
  }
  if (!cachedLimitBreakSearch) {
    cachedLimitBreakSearch = new TrieSearch(['character', 'characterText', 'name', 'tier'], {
      indexField: 'id',
      idFieldOrFunction: 'id',
    });
    cachedLimitBreakSearch.addAll(
      Object.values(enlir.limitBreaks).map(i => ({
        id: i.id,
        character: i.character,
        characterText: i.character!.replace(/[^a-zA-Z]/g, ''),
        name: i.name,
        nameJp: i.nameJp,
        fullTier: limitBreakFullAliases[i.id],
        abbrevTier: limitBreakAbbrevAliases[i.id],
      })),
    );
  }
  if (!cachedLegendMateriaSearch) {
    cachedLegendMateriaSearch = new TrieSearch(['character', 'characterText', 'name', 'tier'], {
      indexField: 'id',
      idFieldOrFunction: 'id',
    });
    cachedLegendMateriaSearch.addAll(
      Object.values(enlir.legendMateria).map(i => ({
        id: i.id,
        character: i.character,
        characterText: i.character!.replace(/[^a-zA-Z]/g, ''),
        name: i.name,
        nameJp: i.nameJp,
        tier: legendMateriaAliases[i.id],
      })),
    );
  }
  return [cachedSoulBreakSearch, cachedLimitBreakSearch, cachedLegendMateriaSearch];
}

export interface SearchResults {
  characters: Set<string>;
  soulBreakIds: Set<number>;
  limitBreakIds: Set<number>;
  legendMateriaIds: Set<number>;
}

export function searchSoulBreaksAndLegendMateria(searchFilter: string): SearchResults {
  const [soulBreakSearch, limitBreakSearch, legendMateriaSearch] = getSearches();
  const searchResults: SearchResults = {
    characters: new Set<string>(),
    soulBreakIds: new Set<number>(),
    limitBreakIds: new Set<number>(),
    legendMateriaIds: new Set<number>(),
  };
  for (const i of soulBreakSearch.get(searchFilter, TrieSearch.UNION_REDUCER)) {
    searchResults.characters.add(i.character);
    searchResults.soulBreakIds.add(i.id);
  }
  for (const i of limitBreakSearch.get(searchFilter, TrieSearch.UNION_REDUCER)) {
    searchResults.characters.add(i.character);
    searchResults.limitBreakIds.add(i.id);
  }
  for (const i of legendMateriaSearch.get(searchFilter, TrieSearch.UNION_REDUCER)) {
    searchResults.characters.add(i.character);
    searchResults.legendMateriaIds.add(i.id);
  }
  return searchResults;
}
