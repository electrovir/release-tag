import {check} from '@augment-vir/assert';
import {filterMap, safeMatch, type SelectFrom} from '@augment-vir/common';
import type {ActionParams} from '../util/action-params.js';
import type {Commit} from './list-commits.js';
import {TaggedVersion} from './versions.js';

export function createReleaseBody(
    previous: Readonly<Pick<TaggedVersion, 'tag'>> | undefined,
    commits: ReadonlyArray<Readonly<Commit>>,
    {
        repo,
        tagName,
    }: Readonly<
        SelectFrom<
            ActionParams,
            {
                tagName: true;
                repo: true;
            }
        >
    >,
): string {
    const commitLines = commits.map((commit) => {
        const truncatedTitle = commit.message.slice(0, 100).trim();
        const leftoverTitle = commit.message.slice(100).trim();
        const [
            ,
            titlePrefixForBolding,
            restOfTheTitle,
            // eslint-disable-next-line sonarjs/slow-regex
        ] = safeMatch(truncatedTitle, /(\[[^\]]+?\])(.+)/);

        const fullMessage = [
            titlePrefixForBolding
                ? `**${titlePrefixForBolding}**${restOfTheTitle}`
                : truncatedTitle,
            leftoverTitle ? '...' : '',
        ].join('');

        const indentedBody = filterMap(
            commit.body.split('\n'),
            (line) => {
                if (line) {
                    return `    ${line}`;
                } else {
                    return undefined;
                }
            },
            check.isTruthy,
        ).join('\n');

        const fullBody = [
            leftoverTitle ? '    ...' + leftoverTitle + '\n' : '',
            indentedBody,
        ].join('');

        return [
            ' - ',
            commit.hash,
            ` (${commit.author}): `,
            fullMessage,
            fullBody ? '\n' + fullBody : '',
        ].join('');
    });

    const previousLines = previous
        ? [
              `Previous: [${previous.tag}](https://github.com/${repo.owner}/${repo.repo}/releases/tag/${previous.tag})`,
              `Compare: [${previous.tag}...${tagName}](https://github.com/${repo.owner}/${repo.repo}/compare/${previous.tag}...${tagName})`,
              '',
          ]
        : [];

    return [
        ...previousLines,
        '## Commits',
        '',
        ...commitLines,
    ].join('\n');
}
