import type { ConstructLogParams, LogType, LogColor } from "../../types/logging";
import chalk from 'chalk';
/**
 * Constructs a `DevCaddy` log and logs it
 * @param options - The options for constructing the log
 */
export function constructedLog<LType extends LogType, OType extends object>(options: ConstructLogParams<LType, OType>) {
  let tagColor: LogColor | null = null;
  let tagValue: string | null = null;

  if (options.printTag !== false) {
    tagColor = options.colors?.tag ?? 'green';
    tagValue = '[DevCaddy]';
  }

  let lineColor = options.colors?.line ?? 'white';
  const tag = tagValue && tagColor ? chalk[tagColor](tagValue) : null;

  if (options.type !== 'info') {
    const chunks = [
      tag,
      chalk[lineColor](options.value),
      options.emoji ? options.emoji : null
    ];

    const filtered = chunks.filter((chunk) => chunk != null);

    console.log(filtered.join(' '));

    return;
  }

  lineColor = options.colors?.line ?? 'blue';

  const chunks = [
    tag,
    chalk[lineColor](JSON.stringify(options.value, null, 2)),
    options.emoji ? options.emoji : null
  ];

  const filtered = chunks.filter((chunk) => chunk != null);

  console.log(filtered.join(' '));

  return;
}