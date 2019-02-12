import { allEnlirElements, allEnlirSchools, enlir, EnlirElement, EnlirStatus } from '../enlir';
import { parseEnlirAttack } from './attack';
import { appendElement, damageTypeAbbreviation, getElementAbbreviation } from './types';
import { andList, lowerCaseFirst, parseNumberString } from './util';

/**
 * Status effects which should be omitted from the regular status list
 */
export function includeStatus(status: string): boolean {
  // En-Element is listed separately
  return !status.startsWith('Attach ');
}

export function describeStats(stats: string[]): string {
  const result = stats.join('/');
  if (result === 'ATK/DEF/MAG/RES/MND') {
    return 'A/D/M/R/MND';
  } else if (result === 'ATK/DEF/MAG/RES') {
    return 'A/D/M/R';
  } else {
    return result;
  }
}

/**
 * Maps from Enlir status names to MMP aliases.  Some Enlir statuses have
 * embedded numbers and so can't use a simple string lookup like this.
 */
const enlirStatusAlias: { [status: string]: string } = {
  Astra: 'Status blink 1',
  'Cast speed *2': 'Fastcast',
};

for (const i of allEnlirSchools) {
  enlirStatusAlias[`${i} +30% Boost`] = `1.3x ${i} dmg`;
}

const enlirStatusAliasWithNumbers: { [status: string]: string } = {
  'High Quick Cast': 'hi fastcast',
  'Instant Cast': 'instacast',
  'Magical Blink': 'Magic blink',
};

const enlirStatusEffectAlias: { [statusEffect: string]: string } = {
  'cast speed x2.00': 'Fastcast',
};

const isFollowUpEffect = (effect: string) => !!effect.match(/[cC]asts .* after using/);

const isFollowUpStatus = ({ effects, codedName }: EnlirStatus) =>
  isFollowUpEffect(effects) || codedName.endsWith('_CHASE') || codedName.startsWith('CHASE_MODE_');

/**
 * Describes a "well-known" or common Enlir status name.
 *
 * One-off statuses instead need to be looked up and their effects processed
 * via describeEnlirStatusEffect.
 */
function describeEnlirStatus(status: string) {
  let m: RegExpMatchArray | null;

  // Generic statuses
  if (enlirStatusAlias[status]) {
    return enlirStatusAlias[status];
  } else if ((m = status.match(/^(.*) (\d+)$/)) && enlirStatusAliasWithNumbers[m[1]]) {
    return enlirStatusAliasWithNumbers[m[1]] + ' ' + m[2];
  }

  // Special cases
  if ((m = status.match(/HP Stock \((\d+)\)/))) {
    return 'Autoheal ' + +m[1] / 1000 + 'k';
  } else if ((m = status.match(/Stoneskin: (\d+)%/))) {
    return 'Negate dmg ' + m[1] + '%';
  } else if ((m = status.match(/((?:[A-Z]{3}(?:,? and |, ))*[A-Z]{3}) ([-+]\d+%)/))) {
    // Status effects: e.g., "MAG +30%" from EX: Attack Hand
    // Reorganize stats into, e.g., +30% MAG to match MMP
    const [, stat, amount] = m;
    return amount + ' ' + stat.split(andList).join('/');
  }

  // Fallback
  return status;
}

function describeEnlirStatusEffect(effect: string, enlirStatus: EnlirStatus | null) {
  let m: RegExpMatchArray | null;

  if (enlirStatus && isFollowUpEffect(effect)) {
    return describeFollowUp(enlirStatus);
  }

  // Generic status effects
  if (enlirStatusEffectAlias[effect]) {
    return enlirStatusEffectAlias[effect];
  }

  // Special cases
  if ((m = effect.match(/((?:[A-Z]{3}(?:,? and |, ))*[A-Z]{3}) ([-+]\d+%)/))) {
    // Status effects: e.g., "MAG +30%" from EX: Attack Hand
    // Reorganize stats into, e.g., +30% MAG to match MMP
    const [, stat, amount] = m;
    return amount + ' ' + stat.split(andList).join('/');
  }

  // Fallback
  return effect;
}

interface ParsedEnlirStatus {
  description: string;
  isExLike: boolean;
  defaultDuration: number | null;
}

function describeExLike(enlirStatus: EnlirStatus): string {
  return enlirStatus.effects
    .split(andList)
    .map(i => describeEnlirStatusEffect(i, enlirStatus))
    .map(lowerCaseFirst)
    .join(', ');
}

function describeFollowUpTrigger(trigger: string): string {
  if (trigger === 'an ability') {
    return 'any ability';
  }

  trigger = trigger
    .split(' ')
    .map(i => (allEnlirElements.indexOf(i as EnlirElement) !== -1 ? i.toLowerCase() : i))
    .map(i => parseNumberString(i) || i)
    .join(' ');

  return trigger
    .replace(/ (abilities|ability|attacks|attack)$/, '')
    .replace(' or ', '/')
    .replace(/^a /, '');
}

function describeFollowUpAttack(attackName: string): string {
  const attackSkill = enlir.otherSkillsByName[attackName];
  if (!attackSkill) {
    return attackName;
  }

  const attack = parseEnlirAttack(attackSkill.effects, attackSkill);
  if (!attack) {
    return attackName;
  }

  let damage = '';
  damage += attack.isAoE ? 'AoE ' : '';
  damage += damageTypeAbbreviation(attack.damageType) + attack.damage;

  damage += appendElement(attack.element, getElementAbbreviation);
  damage += attack.isRanged ? ' rngd' : '';
  damage += attack.isJump ? ' jmp' : '';
  damage += attack.isOverstrike ? ' overstrike' : '';
  damage += attack.school ? ' ' + attack.school : '';
  damage += attack.isNoMiss ? ' no miss' : '';
  damage += attack.isSummon ? ' (SUM)' : '';

  return damage;
}

function describeFollowUp(enlirStatus: EnlirStatus): string {
  const m = enlirStatus.effects.match(/[cC]asts (.*) after using (.*)/);
  if (!m) {
    return enlirStatus.effects;
  }
  return '(' + describeFollowUpTrigger(m[2]) + ' ⤇ ' + describeFollowUpAttack(m[1]) + ')';
}

export function parseEnlirStatus(status: string): ParsedEnlirStatus {
  const enlirStatus = enlir.statusByName[status];
  let description = describeEnlirStatus(status);

  const isEx = status.startsWith('EX: ');
  const isExLike = isEx || isFollowUpStatus(enlirStatus);

  if (enlirStatus && isExLike) {
    description = describeExLike(enlirStatus);
    if (isEx) {
      description = 'EX: ' + description;
    }
  }

  return {
    description,
    isExLike,
    defaultDuration: enlirStatus ? enlirStatus.defaultDuration : null,
  };
}

/**
 * Status effect sort orders - we usually follow Enlir's order, but listing
 * effects here can cause them to be sorted before (more negative) or after
 * (more positive) other effects.
 */
const statusSortOrder: { [status: string]: number } = {
  Haste: -1,
};

export function sortStatus(a: string, b: string): number {
  return (statusSortOrder[a] || 0) - (statusSortOrder[b] || 0);
}
