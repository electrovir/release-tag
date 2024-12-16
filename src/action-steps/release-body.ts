import {check} from '@augment-vir/assert';
import {filterMap, type SelectFrom} from '@augment-vir/common';
import type {ActionParams} from '../util/action-params.js';
import type {Commit} from './list-commits.js';
import {TaggedVersion} from './versions.js';

export function createReleaseBody(
    previous: Readonly<TaggedVersion> | undefined,
    commits: ReadonlyArray<Readonly<Commit>>,
    {
        repo,
    }: Readonly<
        SelectFrom<
            ActionParams,
            {
                repo: true;
            }
        >
    >,
): string {
    const commitLines = commits.map((commit) => {
        const truncatedMessage = commit.message.slice(0, 50);
        const leftoverMessage = commit.message.slice(50);

        const fullMessage = [
            truncatedMessage,
            leftoverMessage ? '...' : '',
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
            leftoverMessage ? '    ...' + leftoverMessage + '\n' : '',
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

    return [
        ...(previous
            ? [
                  `Previous: [${previous.tag}](https://github.com/${repo.owner}/${repo.repo}/releases/tag/${previous.tag})`,
                  '',
              ]
            : []),
        '## Commits',
        '',
        ...commitLines,
    ].join('\n');
}
