import {getInput} from '@actions/core';
import {getOctokit, context as githubContext} from '@actions/github';
import {removePrefix, safeMatch} from '@augment-vir/common';
import {existsSync} from 'node:fs';
import {valid} from 'semver';
import simpleGit from 'simple-git';

export type ActionParams = ReturnType<typeof loadActionParams>;

export function loadActionParams() {
    const [
        ,
        tagName,
    ] = safeMatch(githubContext.ref, /^refs\/tags\/(.+)$/);
    if (!tagName) {
        throw new Error(`Failed to extract a tag name from given ref: '${githubContext.ref}'`);
    }

    const semVersion = removePrefix({value: tagName, prefix: 'v'});
    if (!valid(semVersion)) {
        throw new Error(`Tag version is not valid semver: '${semVersion}'`);
    }

    const includeNpmPack: boolean = getInput('include_npm_pack', {trimWhitespace: true}) === 'true';

    const repoDir = process.env.GITHUB_WORKSPACE;
    if (!repoDir || !existsSync(repoDir)) {
        throw new Error(`Invalid repo dir: ${repoDir}`);
    }

    const repo = githubContext.repo;

    const token = getInput('token', {trimWhitespace: true});
    if (!token) {
        throw new Error('Missing token GitHub Action input.');
    }

    const octokit = getOctokit(token);

    const git = simpleGit(repoDir);

    return {
        /** The name of the git tag that triggered this action. */
        tagName,
        /** The raw semver version, extracted from the tag name without any `'v'` prefix. */
        semVersion,
        /**
         * If `true`, this action should run `npm pack` and include its output in the GitHub
         * release's assets.
         */
        includeNpmPack,
        /** Path to the repo which is running this action. */
        repoDir,
        /** Name and owner of the repo which is running this action. */
        repo,
        octokit,
        git,
    };
}
