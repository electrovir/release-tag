import type {SelectFrom} from '@augment-vir/common';
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
    return [
        ...(previous
            ? [
                  `Previous: [${previous.tag}](https://github.com/${repo.owner}/${repo.repo}/releases/tag/${previous.tag})`,
                  '',
              ]
            : []),
        '## Commits',
        '',
        commits.map((commit) => {
            const truncatedMessage = commit.message.slice(0, 50);
            const leftoverMessage = commit.message.slice(50);

            const fullMessage = [
                truncatedMessage,
                leftoverMessage ? '...' : '',
            ].join('');

            const indentedBody = commit.body
                .split('\n')
                .map((line) => `    ${line}`)
                .join('\n');

            const fullBody = [
                leftoverMessage ? '...' + leftoverMessage + '\n' : '',
                indentedBody,
            ].join('');

            return [
                ' - ',
                commit.hash,
                ` (${commit.author}): `,
                fullMessage,
                fullBody,
            ].join('');
        }),
    ].join('\n');
}
