// cspell:disable

import {describe, itCases} from '@augment-vir/test';
import {createReleaseBody} from './release-body.js';

describe(createReleaseBody.name, () => {
    itCases(createReleaseBody, [
        {
            it: 'formats an empty body',
            inputs: [
                {
                    tag: 'previous-tag',
                    version: '0.0.1',
                },
                [
                    {
                        hash: 'hash',
                        author: 'author',
                        message: 'basic message',
                        body: '',
                    },
                ],
                {
                    repo: {
                        owner: 'owner',
                        repo: 'repo',
                    },
                },
            ],
            expect: `Previous: [previous-tag](https://github.com/owner/repo/releases/tag/previous-tag)

## Commits

 - hash (author): basic message`,
        },
        {
            it: 'formats a basic body',
            inputs: [
                {
                    tag: 'previous-tag',
                    version: '0.0.1',
                },
                [
                    {
                        hash: 'hash',
                        author: 'author',
                        message: 'basic message',
                        body: 'this is a body',
                    },
                ],
                {
                    repo: {
                        owner: 'owner',
                        repo: 'repo',
                    },
                },
            ],
            expect: `Previous: [previous-tag](https://github.com/owner/repo/releases/tag/previous-tag)

## Commits

 - hash (author): basic message
    this is a body`,
        },
        {
            it: 'truncates a long message',
            inputs: [
                {
                    tag: 'previous-tag',
                    version: '0.0.1',
                },
                [
                    {
                        hash: 'hash',
                        author: 'author',
                        message: 'basic message that is way too long it just keeps going on and on',
                        body: 'this is a body',
                    },
                ],
                {
                    repo: {
                        owner: 'owner',
                        repo: 'repo',
                    },
                },
            ],
            expect: `Previous: [previous-tag](https://github.com/owner/repo/releases/tag/previous-tag)

## Commits

 - hash (author): basic message that is way too long it just keeps g...
    ...oing on and on
    this is a body`,
        },
        {
            it: 'handles multiple commits',
            inputs: [
                {
                    tag: 'previous-tag',
                    version: '0.0.1',
                },
                [
                    {
                        hash: 'hash',
                        author: 'author',
                        message: 'basic message that is way too long it just keeps going on and on',
                        body: 'this is a body',
                    },
                    {
                        hash: 'hash 2',
                        author: 'author 2',
                        message: 'basic message',
                        body: '',
                    },
                    {
                        hash: 'hash 3',
                        author: 'author 3',
                        message: 'basic message',
                        body: 'has\nmultiline\nbody',
                    },
                    {
                        hash: 'hash 4',
                        author: 'author 4',
                        message: 'basic message',
                        body: 'basic body',
                    },
                ],
                {
                    repo: {
                        owner: 'owner',
                        repo: 'repo',
                    },
                },
            ],
            expect: `Previous: [previous-tag](https://github.com/owner/repo/releases/tag/previous-tag)

## Commits

 - hash (author): basic message that is way too long it just keeps g...
    ...oing on and on
    this is a body
 - hash 2 (author 2): basic message
 - hash 3 (author 3): basic message
    has
    multiline
    body
 - hash 4 (author 4): basic message
    basic body`,
        },
    ]);
});
