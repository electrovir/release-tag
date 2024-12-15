import {filterMap, removePrefix, type SelectFrom} from '@augment-vir/common';
import {compare, valid} from 'semver';
import type {SimpleGit} from 'simple-git';
import type {ActionParams} from '../util/action-params.js';

export type TaggedVersion = {
    tag: string;
    version: string;
};

export async function determineVersions({
    git,
    semVersion,
}: Readonly<
    SelectFrom<
        ActionParams,
        {
            git: true;
            semVersion: true;
        }
    >
>): Promise<{previous: TaggedVersion | undefined; isCurrentLatest: boolean}> {
    const allVersions = await getAllVersions(git);

    if (!allVersions.length) {
        return {
            isCurrentLatest: true,
            previous: undefined,
        };
    }

    let isSemVersionLatest = true;

    const previous = allVersions.reduce((best, current) => {
        const currentComparison = compare(current.version, semVersion);
        const bestComparison = compare(current.version, best.version);

        if (
            /** `current` is less than `semVersion`. */
            currentComparison === -1 &&
            /** `current` is greater than `best` */
            bestComparison === 1
        ) {
            return current;
        } else if (
            /** `current` is greater than `semVersion`. */
            currentComparison === 1
        ) {
            isSemVersionLatest = false;
        } else if (currentComparison === 0) {
            return best;
        }

        return best;
    });

    return {
        isCurrentLatest: isSemVersionLatest,
        previous: previous.version === semVersion ? undefined : previous,
    };
}

async function getAllVersions(git: Readonly<SimpleGit>) {
    const allCurrentTags = (await git.tags()).all;

    return filterMap(
        allCurrentTags,
        (tag) => {
            return {
                version: removePrefix({value: tag, prefix: 'v'}),
                tag,
            };
        },
        ({version}) => {
            return !!valid(version);
        },
    );
}
