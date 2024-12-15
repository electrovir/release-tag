import {assert, check} from '@augment-vir/assert';
import {createUuidV4, filterMap, log, wrapString, type SelectFrom} from '@augment-vir/common';
import type {ActionParams} from '../util/action-params.js';
import {logJson} from '../util/log-json.js';
import type {TaggedVersion} from './versions.js';

const commitBoundary = [
    'vir',
    createUuidV4(),
].join('-');

const valueBoundary = [
    'vir',
    createUuidV4(),
].join('-');

export type Commit = {
    hash: string;
    author: string;
    message: string;
    body: string;
};

export async function listCommitsSinceLastVersion(
    previous: Readonly<TaggedVersion> | undefined,
    {
        git,
        tagName,
    }: Readonly<
        SelectFrom<
            ActionParams,
            {
                git: true;
                tagName: true;
            }
        >
    >,
) {
    const logRange = [
        previous?.tag,
        tagName,
    ]
        .filter(check.isTruthy)
        .join('..');

    const formatOptions = [
        '%h',
        '%an',
        '%s',
        '%b',
    ].join(wrapString({value: valueBoundary, wrapper: ' '}));

    const logOptions = [
        '--no-pager',
        'log',
        logRange,
        `--pretty=format:${formatOptions}${commitBoundary}`,
    ];

    log.faint('git log inputs:');
    logJson(logOptions, 'faint');

    const logOutput = (await git.raw(logOptions)).trim();

    const commits: Commit[] = filterMap(
        logOutput.split(commitBoundary),
        (commitString): Commit | undefined => {
            if (!commitString) {
                return undefined;
            }

            const commitParts = commitString.split(valueBoundary);

            const hash = commitParts[0]?.trim();
            assert.isString(hash, `Failed to extract commit hash from:\n${commitString}`);

            const author = commitParts[1]?.trim();
            assert.isString(author, `Failed to extract commit author from:\n${commitString}`);

            const message = commitParts[2]?.trim();
            assert.isString(message, `Failed to extract commit message from:\n${commitString}`);

            const body = commitParts[3]?.trim();
            assert.isString(body, `Failed to extract commit body from:\n${commitString}`);

            return {
                hash,
                author,
                message,
                body,
            };
        },
        (mapped) => check.isTruthy(mapped),
    );

    return commits;
}
